import {createAction, createSlice} from "@reduxjs/toolkit";
import { ethers } from "ethers"
import {readEncryptedWallet, readSmartWalletAddress} from "@app/services/localStorage.service";

export interface WalletState {
    localWallet: ethers.Wallet | null;
    encryptedWallet: string | null;
    smartWalletAddress: string | null;
}

const initialState: WalletState = {
    localWallet: null,
    encryptedWallet: readEncryptedWallet(),
    smartWalletAddress: readSmartWalletAddress(),
};

export const setLocalWallet = createAction('wallet/setLocalWallet', (localWallet: ethers.Wallet) => {
    return {
        payload: localWallet,
    };
});

export const setEncryptedWallet = createAction('wallet/setEncryptedWallet', (encryptedWallet: string) => {
    return {
        payload: encryptedWallet,
    };
});

export const setSmartWalletAddress = createAction('wallet/setSmartWalletAddress', (smartWalletAddress: string) => {
    return {
        payload: smartWalletAddress,
    };
});

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setLocalWallet, (state, action) => {
            state.localWallet = action.payload;
        });
        builder.addCase(setEncryptedWallet, (state, action) => {
            state.encryptedWallet = action.payload;
        });
        builder.addCase(setSmartWalletAddress, (state, action) => {
            state.smartWalletAddress = action.payload;
        });
    }
});

export default walletSlice.reducer;
