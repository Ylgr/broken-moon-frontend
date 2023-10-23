import {createAction, createSlice} from "@reduxjs/toolkit";
import { ethers } from "ethers"
import {readEncryptedWallet} from "@app/services/localStorage.service";

export interface WalletState {
    localWallet: ethers.BaseWallet | null;
    encryptedWallet: string | null;
}

const initialState: WalletState = {
    localWallet: null,
    encryptedWallet: readEncryptedWallet(),
};

export const setLocalWallet = createAction('wallet/setLocalWallet', (localWallet: ethers.BaseWallet) => {
    return {
        payload: localWallet,
    };
});

export const setEncryptedWallet = createAction('wallet/setEncryptedWallet', (encryptedWallet: string) => {
    return {
        payload: encryptedWallet,
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
    }
});

export default walletSlice.reducer;
