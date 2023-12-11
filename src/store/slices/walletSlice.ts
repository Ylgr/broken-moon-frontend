import {createAction, createSlice} from "@reduxjs/toolkit";
import { ethers } from "ethers"
import {readEncryptedWallet, readSmartWalletAddress} from "@app/services/localStorage.service";

export interface OpDetails {
    actionName: string;
    actionStep: string;
    asset: string;
    amount: string;
    toAddress: string;
    note: string;
}

export interface WalletState {
    localWallet: ethers.Wallet | null;
    encryptedWallet: string | null;
    smartWalletAddress: string | null;
    ops: any;
    opsDetails: OpDetails[];
    isPayAsToken: boolean;
    transactionExecuted: number;
}

const initialState: WalletState = {
    localWallet: null,
    encryptedWallet: readEncryptedWallet(),
    smartWalletAddress: readSmartWalletAddress(),
    ops: null,
    opsDetails: [],
    isPayAsToken: true,
    transactionExecuted: 0,
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

export const setTransactionExecuted = createAction('wallet/setTransactionExecuted', (transactionExecuted: number) => {
    return {
        payload: transactionExecuted,
    };
});

export const setOpsDetails = createAction('wallet/setOpsDetails', (opsDetails: OpDetails[]) => {
    return {
        payload: opsDetails,
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
        builder.addCase(setTransactionExecuted, (state, action) => {
            state.transactionExecuted = action.payload;
        });
        builder.addCase(setOpsDetails, (state, action) => {
            state.opsDetails = action.payload;
        });
    }
});

export default walletSlice.reducer;
