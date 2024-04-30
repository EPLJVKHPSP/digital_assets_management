const anchor = require('@project-serum/anchor');
const { PublicKey, SystemProgram, TOKEN_PROGRAM_ID, Token } = anchor.web3;
const BN = require('bn.js');

// Define wallet keypair JSON paths
const wallet1 = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(new Uint8Array(require("./keys/wallet_1.json"))));
const wallet2 = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(new Uint8Array(require("./keys/wallet_2.json"))));
const wallet3 = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(new Uint8Array(require("./keys/wallet_3.json"))));

// Set up the provider for Anchor
const provider = new anchor.AnchorProvider(anchor.web3.Connection("https://api.mainnet-beta.solana.com"), wallet1, { commitment: "confirmed" });
anchor.setProvider(provider);

// Set up the program instance
const program = anchor.workspace.MyAnchorProject; // Make sure this matches your actual project name

// Specify the token details or SOL withdrawal
const tokenAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Set to USDC address or "0" for SOL
const destinationPublicKey = wallet1.publicKey; // Assuming you're withdrawing to wallet_1

async function main() {
    // Fetch the multisig address and its account data
    const multisigAddress = new PublicKey("MULTISIG_ADDRESS_HERE"); // Replace with your multisig address
    const multisigAccount = await program.account.multisig.fetch(multisigAddress);
    
    // Get the next transaction index
    const transactionIndex = new BN(multisigAccount.transactionIndex).addn(1);

    // Derive the transaction PDA
    const [transactionPDA] = await PublicKey.findProgramAddress([
        anchor.utils.bytes.utf8.encode("transaction"),
        multisigAddress.toBuffer(),
        transactionIndex.toBuffer("le", 4)
    ], program.programId);

    let transactionInstruction;

    if (tokenAddress === "0") {
        // Handle SOL withdrawal
        const balance = await provider.connection.getBalance(multisigAddress);
        transactionInstruction = SystemProgram.transfer({
            fromPubkey: multisigAddress,
            toPubkey: destinationPublicKey,
            lamports: balance
        });
    } else {
        // Handle Token withdrawal
        const tokenAccountInfo = await getTokenAccount(provider, multisigAddress, new PublicKey(tokenAddress));
        const tokenBalance = tokenAccountInfo.amount;

        const token = new Token(provider.connection, new PublicKey(tokenAddress), TOKEN_PROGRAM_ID, wallet1);
        const associatedDestinationTokenAddr = await Token.getAssociatedTokenAddress(
            token.associatedProgramId,
            token.programId,
            new PublicKey(tokenAddress),
            destinationPublicKey
        );

        transactionInstruction = Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            tokenAccountInfo.address,
            associatedDestinationTokenAddr,
            multisigAddress,
            [],
            tokenBalance
        );
    }

    // Create the transaction and attach the instruction
    await program.rpc.createTransaction({
        accounts: {
            multisig: multisigAddress,
            transaction: transactionPDA,
            proposer: wallet1.publicKey
        },
        instructions: [transactionInstruction]
    });

    // Approvals from other wallets
    await approveTransaction(wallet2, multisigAddress, transactionPDA);
    await approveTransaction(wallet3, multisigAddress, transactionPDA);

    // Execute the transaction
    await program.rpc.executeTransaction({
        accounts: {
            multisig: multisigAddress,
            transaction: transactionPDA,
            executor: wallet1.publicKey
        }
    });

    console.log("Transaction executed successfully.");
}

async function approveTransaction(wallet, multisigAddress, transactionPDA) {
    // Create a transaction to approve the existing one
    const tx = new Transaction().add(
        program.instruction.approveTransaction({
            accounts: {
                multisig: multisigAddress,
                transaction: transactionPDA,
                approver: wallet.publicKey
            }
        })
    );

    // Send and confirm the transaction
    await provider.sendAndConfirm(tx, [wallet.payer]);
}

async function getTokenAccount(provider, owner, mint) {
    // Fetch the token account associated with the owner and mint
    const accounts = await provider.connection.getTokenAccountsByOwner(owner, { mint: mint });
    return accounts.value[0].account.data.parsed.info;
}

main().catch(err => console.error(err));