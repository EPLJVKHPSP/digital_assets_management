import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the RPC URL for the Binance Smart Chain
const RPC_URL = 'https://bsc-dataseed.binance.org/';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Use the private keys from the environment variables for the owners of the Safe
const owner1PrivateKey = process.env.OWNER_1_PRIVATE_KEY;
const owner2PrivateKey = process.env.OWNER_2_PRIVATE_KEY;

// Create signer instances from private keys
const owner1Signer = new ethers.Wallet(owner1PrivateKey, provider);
const owner2Signer = new ethers.Wallet(owner2PrivateKey, provider);

// Define the Safe address (replace with the actual Safe address you're working with)
const SAFE_ADDRESS = '0x0aC772a94AE245A9145E0DDe85299E5E4b779FB8';

// Function to initialize a Safe instance
async function initializeSafe(signer) {
    return await Safe.init({
        provider: provider,
        signer: signer.address,
        safeAddress: SAFE_ADDRESS
    });
}

// Function to perform transactions with the Safe
async function createAndExecuteTransaction() {
    // Initialize the Safe instances for each owner
    const safeOwner1 = await initializeSafe(owner1Signer);
    const safeOwner2 = await initializeSafe(owner2Signer);

    // Specify the transaction details (replace with actual values)
    const tokenAddress = '0xTokenAddress';
    const recipientAddress = '0xRecipientAddress';
    const amount = ethers.utils.parseUnits('10', 18); // Example: Sending 10 tokens

    // Create a transaction
    const transaction = {
        to: tokenAddress,
        value: '0',
        data: safeOwner1.interface.encodeFunctionData('transfer', [recipientAddress, amount])
    };

    // Propose the transaction with the first owner's signature
    const txResponse = await safeOwner1.createTransaction({ transaction });
    console.log('Transaction proposed:', txResponse);

    // Confirm the transaction with the second owner's signature
    const confirmResponse = await safeOwner2.confirmTransaction(txResponse.safeTxHash);
    console.log('Transaction confirmed:', confirmResponse);

    // Execute the transaction
    const executeResponse = await safeOwner2.executeTransaction(txResponse);
    const receipt = await executeResponse.transactionResponse?.wait();
    console.log('Transaction executed:', receipt.transactionHash);
}

// Execute the script
createAndExecuteTransaction().catch((error) => {
    console.error('Error executing transaction:', error);
});
