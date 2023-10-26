import {ethers} from "ethers";
import BicAccountFactory from "./abi/BicAccountFactory.json";
import BmToken from "./abi/BmToken.json";

// bsc testnet
const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");

const bicAccountFactory = new ethers.Contract("0x0e5476a5AfD15c1e35ca4d97D220cb9f40617609", BicAccountFactory, provider);
export const bmToken = new ethers.Contract("0x2ef8aa35647530EE276fCBCE2E639F86D8B7F1EB", BmToken, provider);

export const getSmartWalletAddress = async (address: string): Promise<string> => {
    return await bicAccountFactory.getAddress(address, 0);
    // return await bicAccountFactory.entrypoint();
}

export const getBmBalance = async (address: string): Promise<string> => {
    return await bmToken.balanceOf(address);
}
