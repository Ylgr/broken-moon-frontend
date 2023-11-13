import {BigNumber, ethers} from "ethers";
import BicAccountFactory from "./abi/BicAccountFactory.json";
import BicAccount from "./abi/BicAccount.json";
import BmToken from "./abi/BmToken.json";
import EntryPoint from "./abi/EntryPoint.json";

// bsc testnet
export const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
export const bicAccountFactory = new ethers.Contract("0x0e5476a5AfD15c1e35ca4d97D220cb9f40617609", BicAccountFactory, provider);
// export const bmToken = new ethers.Contract("0x2ef8aa35647530EE276fCBCE2E639F86D8B7F1EB", BmToken, provider);
export const bmToken = new ethers.Contract("0x79942a7E73b3E27038D896E16157ECaac819d3AF", BmToken, provider); // BIC test AA

export const entryPoint = new ethers.Contract("0x0Dea81090663911A57f1cEc9569e55FD852E5dD3", EntryPoint, provider);


export const bicAccount = (address: string) => new ethers.Contract(address, BicAccount, provider);

export const bicAccountInterface = new ethers.utils.Interface(BicAccount);

export const getSmartWalletAddress = async (address: string): Promise<string> => {
    return await bicAccountFactory.getAddress(address, 0);
    // return await bicAccountFactory.entrypoint();
}

export const getBmBalance = async (address: string): Promise<BigNumber> => {
    return (await bmToken.balanceOf(address));
}

export const getBnBBalance = async (address: string): Promise<BigNumber> => {
    return (await provider.getBalance(address));
}

export const getTokenBalance = async (address: string): Promise<{bnb_balance: BigNumber, bm_balance: BigNumber}> => {
    return {
        bnb_balance: await getBnBBalance(address),
        bm_balance: await getBmBalance(address),
    }
}

export const bicAccountAbi = BicAccount;
