import SafeApiKit from '@safe-global/api-kit'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import Safe from '@safe-global/protocol-kit'

// https://chainlist.org/?search=sepolia&testnets=true
const RPC_URL = 'https://bsc.rpc.blxrbdn.com'

// Initialize signers
const OWNER_1_ADDRESS = '0xF9243eaBEb73a799b2C1F398A7cB18fD7421002d'
const OWNER_1_PRIVATE_KEY = '0xb5602a7005c93f3e25d75265bad25bdf4f2c1de9d0ffe26bc5c07834472a7c57'

const OWNER_2_ADDRESS = '0x717C3A79869952A3B803A535951Ae24297375FE'
const OWNER_2_PRIVATE_KEY = '0xfde269dfabfa8efd0302bce31e6d413546df4369b8b3976f663fc5f6ec5d77de'

const safeAddress = '0x0aC772a94AE245A9145E0DDe85299E5E4b779FB8' 

const provider = new ethers.JsonRpcProvider(RPC_URL)
const owner1Signer = new ethers.Wallet(OWNER_1_PRIVATE_KEY, provider)
const owner2Signer = new ethers.Wallet(OWNER_2_PRIVATE_KEY, provider)

const apiKit = new SafeApiKit({
    chainId: 56,
    txServiceUrl: 'https://safe-transaction-bsc.safe.global'
})

//Connecting Safe
const protocolKitOwner1 = await Safe.init({
    provider,
    owner1Signer,
    safeAddress
  })


/// Any address can be used. In this example you will use vitalik.eth
const destination = '0xF9243eaBEb73a799b2C1F398A7cB18fD7421002d'
const amount = ethers.parseUnits('0.005', 'ether').toString()

const safeTransactionData: MetaTransactionData = {
  to: destination,
  data: '0x',
  value: amount
}
// Create a Safe transaction with the provided parameters
const safeTransaction = await protocolKitOwner1.createTransaction({ transactions: [safeTransactionData] })

// Deterministic hash based on transaction parameters
const safeTxHash = await protocolKitOwner1.getTransactionHash(safeTransaction)

// Sign transaction to verify that the transaction is coming from owner 1
const senderSignature = await protocolKitOwner1.signHash(safeTxHash)

await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: OWNER_1_ADDRESS,
    senderSignature: senderSignature.data,
  })

const pendingTransactions = await apiKit.getPendingTransactions(safeAddress).results

// Assumes that the first pending transaction is the transaction you want to confirm
const transaction = pendingTransactions[0]
const safeTxHash = transaction.safeTxHash

const protocolKitOwner2 = await Safe.init({
  provider: RPC_URL,
  signer: OWNER_2_PRIVATE_KEY,
  safeAddress
})

const signature = await protocolKitOwner2.signHash(safeTxHash)
const response = await apiKit.confirmTransaction(safeTxHash, signature.data)

const safeTransaction = await apiKit.getTransaction(safeTxHash)
const executeTxResponse = await protocolKit.executeTransaction(safeTransaction)
const receipt = await executeTxResponse.transactionResponse?.wait()

console.log('Transaction executed:')
console.log(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`)

const afterBalance = await protocolKit.getBalance()

console.log(`The final balance of the Safe: ${ethers.formatUnits(afterBalance, 'ether')} ETH`)
