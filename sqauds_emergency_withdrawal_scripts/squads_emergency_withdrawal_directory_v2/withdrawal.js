// withdrawal.js

import Squads, { getAuthorityPDA, DEFAULT_MULTISIG_PROGRAM_ID } from '@sqds/sdk';
import { Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import { Wallet } from '@sqds/sdk';
import BN from 'bn.js';
import { wallet1PrivateKey, wallet2PrivateKey, vaultPublicKey } from './keys.js';

console.log('Squads SDK Loaded:', Squads); // Log the Squads SDK object

async function withdrawFromVault(amount) {
    console.log('Initializing wallet keypairs...');
    const wallet1Keypair = Keypair.fromSecretKey(wallet1PrivateKey);
    const wallet2Keypair = Keypair.fromSecretKey(wallet2PrivateKey);

    console.log('Creating Wallet instances...');
    const wallet1 = new Wallet(wallet1Keypair);
    const wallet2 = new Wallet(wallet2Keypair);

    console.log('Setting up RPC endpoint...');
    const rpcEndpoint = "https://api.mainnet-beta.solana.com"; // Mainnet RPC endpoint

    console.log('Establishing connection to Solana mainnet with Wallet 1...');
    const squads1 = Squads.default.endpoint(rpcEndpoint, wallet1);
    console.log('Establishing connection to Solana mainnet with Wallet 2...');
    const squads2 = Squads.default.endpoint(rpcEndpoint, wallet2);

    console.log('Fetching Multisig Public Key...');
    const multisigPublicKey = await getMultisigPublicKey(vaultPublicKey);

    console.log('Creating transaction...');
    const multisigTransaction = await squads1.createTransaction(multisigPublicKey, 1);
    console.log(`Transaction created with ID: ${multisigTransaction.publicKey.toString()}`);

    console.log('Building transfer instruction...');
    const transferSolIx = SystemProgram.transfer({
        fromPubkey: vaultPublicKey,
        toPubkey: wallet1Keypair.publicKey,
        lamports: amount, // Amount to withdraw in lamports
    });

    console.log('Adding instruction to transaction...');
    await squads1.addInstruction(multisigTransaction.publicKey, transferSolIx);

    console.log('Activating transaction...');
    await squads1.activateTransaction(multisigTransaction.publicKey);

    console.log('Approving transaction with Wallet 1...');
    await squads1.approveTransaction(multisigTransaction.publicKey);

    console.log('Approving transaction with Wallet 2...');
    await squads2.approveTransaction(multisigTransaction.publicKey);

    console.log('Executing transaction...');
    await squads1.executeTransaction(multisigTransaction.publicKey);

    console.log('Fetching transaction status...');
    const postExecuteState = await squads1.getTransaction(multisigTransaction.publicKey);
    console.log('Transaction state:', postExecuteState.status);
}

async function getMultisigPublicKey(vaultPublicKey) {
    console.log('Validating and converting vault public key...');
    const vaultPubKey = new PublicKey(vaultPublicKey);
    console.log('Fetching authority PDA...');
    const [multisigPublicKey] = await getAuthorityPDA(vaultPubKey, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
    return multisigPublicKey;
}

const amount = 500000000; // 0.5 SOL
console.log(`Initiating withdrawal of ${amount} lamports...`);
withdrawFromVault(amount)
    .then(() => console.log("Transaction completed successfully."))
    .catch((e) => console.error("Error during transaction:", e));