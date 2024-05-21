// withdrawal.ts

import { Connection, Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import Squads, { Wallet, getAuthorityPDA, DEFAULT_MULTISIG_PROGRAM_ID } from '@sqds/sdk';
import BN from 'bn.js';
import { wallet1PrivateKey, wallet2PrivateKey } from './keys';

const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=fadd088c-e174-433b-8732-cf19685d1896";

// Create a new connection object
const connection = new Connection(RPC_URL, 'confirmed');

console.log('Squads SDK Loaded:', Squads); // Log the Squads SDK object

async function withdrawFromVault(amount: number): Promise<void> {
    console.log('Initializing wallet keypairs...');
    const wallet1Keypair = Keypair.fromSecretKey(new Uint8Array(wallet1PrivateKey));
    const wallet2Keypair = Keypair.fromSecretKey(new Uint8Array(wallet2PrivateKey));

    console.log('Creating Wallet instances...');
    const wallet1 = new Wallet(wallet1Keypair);
    const wallet2 = new Wallet(wallet2Keypair);

    console.log('Setting up Squads with mainnet for Wallet 1...');
    const squads1 = Squads.mainnet(wallet1); // Initialize Squads for Wallet 1

    console.log('Setting up Squads with mainnet for Wallet 2...');
    const squads2 = Squads.mainnet(wallet2); // Initialize Squads for Wallet 2

    console.log('Fetching Multisig Public Key...');
    const msPda = new PublicKey("C9sfa3ETT6AGMnBimgoeZDa5GP57PzMqxBSS7mGGQNhM");

    console.log('Creating transaction...');
    const multisigTransaction = await squads1.createTransaction(msPda, 1);
    console.log(`Transaction created with ID: ${multisigTransaction.publicKey.toString()}`);

    console.log('Building transfer instruction...');
    const transferSolIx = SystemProgram.transfer({
        fromPubkey: msPda,
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

async function getMultisigPublicKey(): Promise<PublicKey> {
    console.log('Using fixed multisig public key:', msPda.toString());
    console.log('Fetching authority PDA...');
    const [multisigPublicKey] = await getAuthorityPDA(msPda, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
    return multisigPublicKey;
}

const amount = 500000000; // 0.5 SOL
console.log(`Initiating withdrawal of ${amount} lamports...`);
withdrawFromVault(amount)
    .then(() => console.log("Transaction completed successfully."))
    .catch((e) => console.error("Error during transaction:", e));
