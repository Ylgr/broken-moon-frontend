import {createAction, createSlice} from "@reduxjs/toolkit";
import { ethers } from "ethers"
import {readEncryptedWallet, readSmartWalletAddress} from "@app/services/localStorage.service";

export interface WalletState {
    localWallet: ethers.Wallet | null;
    encryptedWallet: string | null;
    smartWalletAddress: string | null;
    ops: any;
    isPayAsToken: boolean;
}

const initialState: WalletState = {
    localWallet: null,
    encryptedWallet: readEncryptedWallet(),
    smartWalletAddress: readSmartWalletAddress(),
    ops: null,
    isPayAsToken: false,
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

export const setOps = createAction('wallet/setOps', (ops: any) => {
    return {
        payload: ops,
    };
});

export const setIsPayAsToken = createAction('wallet/setIsPayAsToken', (isPayAsToken: boolean) => {
    return {
        payload: isPayAsToken,
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
        builder.addCase(setOps, (state, action) => {
            state.ops = action.payload;
        });
        builder.addCase(setIsPayAsToken, (state, action) => {
            state.isPayAsToken = action.payload;
        });
    }
});

export default walletSlice.reducer;
