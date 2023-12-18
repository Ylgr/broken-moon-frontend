import {ethers} from "ethers";
import {provider} from "@app/components/contract/smartWallet";


export const sendTransaction = async (sendTransactionPayload: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionReceipt> => {
    // @ts-ignore
    const executeWallet  = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY)).connect(provider);
    const transaction = await executeWallet.sendTransaction(sendTransactionPayload);
    return transaction.wait();
}
