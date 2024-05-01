import Squads, { getAuthorityPDA, DEFAULT_MULTISIG_PROGRAM_ID } from '@sqds/sdk';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { Wallet } from '@sqds/sdk';
import BN from 'bn.js';
import { wallet1PrivateKey, wallet2PrivateKey, vaultPublicKey } from './keys.js';
async function withdrawFromVault(amount) {
    // Create wallets from the provided private keys
    const wallet1Keypair = Keypair.fromSecretKey(wallet1PrivateKey);
    const wallet2Keypair = Keypair.fromSecretKey(wallet2PrivateKey);
    const wallet1 = new Wallet(wallet1Keypair);
    const wallet2 = new Wallet(wallet2Keypair);
    const rpcEndpoint = "https://api.mainnet-beta.solana.com"; // Mainnet RPC endpoint
    // Establish connection to Solana mainnet
    const squads1 = Squads.endpoint(rpcEndpoint, wallet1);
    const squads2 = Squads.endpoint(rpcEndpoint, wallet2);
    const multisigPublicKey = await getMultisigPublicKey(vaultPublicKey);
    // Create a transaction to withdraw from the vault
    const multisigTransaction = await squads1.createTransaction(multisigPublicKey, 1);
    const transferSolIx = SystemProgram.transfer({
        fromPubkey: vaultPublicKey,
        toPubkey: wallet1Keypair.publicKey,
        lamports: amount, // Amount to withdraw in lamports
    });
    // Add the instruction to the transaction
    await squads1.addInstruction(multisigTransaction.publicKey, transferSolIx);
    // Activate the transaction
    await squads1.activateTransaction(multisigTransaction.publicKey);
    // Approve the transaction with Wallet 1
    await squads1.approveTransaction(multisigTransaction.publicKey);
    // Approve the transaction with Wallet 2
    await squads2.approveTransaction(multisigTransaction.publicKey);
    // Execute the transaction
    await squads1.executeTransaction(multisigTransaction.publicKey);
    // Check the transaction status
    const postExecuteState = await squads1.getTransaction(multisigTransaction.publicKey);
    console.log('Transaction state:', postExecuteState.status);
}
async function getMultisigPublicKey(vaultPublicKey) {
    const [multisigPublicKey] = await getAuthorityPDA(vaultPublicKey, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
    return multisigPublicKey;
}
// Replace with the amount to withdraw in lamports
const amount = 500000000; // 0.5 SOL
withdrawFromVault(amount)
    .then(() => console.log("Transaction completed"))
    .catch((e) => console.error("Error:", e));
