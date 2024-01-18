import {BigNumber, ethers} from "ethers";
import BicAccountFactory from "./abi/BicAccountFactory2.json";
import BicAccount from "./abi/BicAccount.json";
import BmToken from "./abi/BmToken.json";
import EntryPoint from "./abi/EntryPoint.json";
import Treasury from "./abi/Treasury.json";
import BICRegistrarController from "./abi/BICRegistrarController.json";
import NameWrapper from "./abi/NameWrapper.json";
import FreeToMintNft from "./abi/FreeToMintNft.json";
import Marketplace from "./abi/Marketplace.json";
import {Network, Alchemy} from "alchemy-sdk";

// bsc testnet
export const provider = new ethers.providers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
export const bicAccountFactory = new ethers.Contract("0x4e8A55cC1985714BF9fdB6E1F246E6B92E511AA2", BicAccountFactory, provider);
// export const bmToken = new ethers.Contract("0x2ef8aa35647530EE276fCBCE2E639F86D8B7F1EB", BmToken, provider);
export const bmToken = new ethers.Contract("0xc6652115584BAcFeD8998Cde132FC2E14d31a4cB", BmToken, provider); // BIC test AA

export const entryPoint = new ethers.Contract("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", EntryPoint, provider);

export const bicRegistrarController = new ethers.Contract('0x25f22aa0162FD8617c1271f8dd39876df8Ea8020', BICRegistrarController, provider);

export const nameWrapper = new ethers.Contract('0x7E38c6E84cB75bF5c7475E570ed21F5Ab64Be407', NameWrapper, provider);
export const bicAccount = (address: string) => new ethers.Contract(address, BicAccount, provider);

export const bicAccountInterface = new ethers.utils.Interface(BicAccount);

export const treasuryInterface = new ethers.utils.Interface(Treasury);

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

export const freeToMintNft = new ethers.Contract("0x0B32aD755626BFc0a88402aA25E4C635A802d83d", FreeToMintNft, provider);

export const marketplace = new ethers.Contract("0x08232a88682EF30cd16c4085c7E8FBD70cBc65A6", Marketplace, provider);

export const anyNft = (address: any) => new ethers.Contract(address, FreeToMintNft, provider);

export const alchemy = new Alchemy({
    network: Network.ARB_SEPOLIA,
    apiKey: process.env.REACT_APP_ALCHEMY_KEY, // Replace with your Alchemy API Key.
});
