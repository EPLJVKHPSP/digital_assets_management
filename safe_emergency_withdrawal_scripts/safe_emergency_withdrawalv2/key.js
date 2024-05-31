const { ethers } = require('ethers');

const privateKey = '0xb5602a7005c93f3e25d75265bad25bdf4f2c1de9d0ffe26bc5c07834472a7c57'; // Directly use a known good private key
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
const wallet = new ethers.Wallet(privateKey, provider);
console.log('Wallet address:', wallet.address);
