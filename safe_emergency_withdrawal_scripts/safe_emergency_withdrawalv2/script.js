// Path: scripts/withdraw_from_safe.js

const { ethers } = require('ethers');
const Safe = require('@safe-global/protocol-kit').default;
const SafeApiKit = require('@safe-global/api-kit').default;
const EthersAdapter = require('@safe-global/safe-ethers-lib').default;

// Define your constants directly
const PRIVATE_KEY1 = '0';
const PRIVATE_KEY2 = '0';
const SAFE_ADDRESS = '0';
const TOKEN_ADDRESS = '0';
const RECIPIENT_ADDRESS = '0';
const PROVIDER_URL = 'https://bsc-dataseed.binance.org/';

async function main() {
    console.log('Connecting to the Binance Smart Chain...');
    const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

    // Initialize wallets
    const wallet1 = new ethers.Wallet(PRIVATE_KEY1, provider);
    const wallet2 = new ethers.Wallet(PRIVATE_KEY2, provider);
    console.log(`Wallet1 address: ${wallet1.address}`);
    console.log(`Wallet2 address: ${wallet2.address}`);

    // Initialize EthersAdapters for both wallets
    const ethAdapter1 = new EthersAdapter({
        ethers,
        signer: wallet1
    });
    const ethAdapter2 = new EthersAdapter({
        ethers,
        signer: wallet2
    });

    // Load the existing Safe
    const safeSdk1 = await Safe.create({
        ethAdapter: ethAdapter1,
        safeAddress: SAFE_ADDRESS
    });

    // Check the balance of the Safe
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
    ], provider);

    const balance = await tokenContract.balanceOf(SAFE_ADDRESS);
    console.log(`Balance in Safe: ${ethers.utils.formatUnits(balance, 18)} USDT`);

    if (balance.lt(ethers.utils.parseUnits('10.0', 18))) {
        console.error('Not enough tokens in the Safe to perform the transaction');
        return;
    }

    // Prepare the transaction
    const data = tokenContract.interface.encodeFunctionData("transfer", [RECIPIENT_ADDRESS, ethers.utils.parseUnits('10.0', 18)]);
    const safeTransactionData = {
        to: TOKEN_ADDRESS,
        value: '0',
        data: data
    };

    // Create Safe transaction
    const safeTransaction = await safeSdk1.createTransaction({ safeTransactionData });

    // Propose the transaction using Safe API Kit
    const apiKit = new SafeApiKit({
        chainId: 56,
        txServiceUrl: 'https://safe-transaction.bsc.gnosis.io/'
    });

    const safeTxHash = await safeSdk1.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk1.signTransaction(safeTransaction);

    await apiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: wallet1.address,
        senderSignature: senderSignature.data,
    });

    // Load Safe with the second wallet and sign the transaction
    const safeSdk2 = await Safe.create({
        ethAdapter: ethAdapter2,
        safeAddress: SAFE_ADDRESS
    });
    await safeSdk2.signTransaction(safeTransaction);

    console.log('Transaction has been signed by both wallets, ready to execute...');

    // Execute the transaction
    const executeTxResponse = await safeSdk1.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse.wait();
    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
}

main().catch(err => {
    console.error('Error during execution:', err);
});