import { LocalWallet, SmartWallet } from "@thirdweb-dev/wallets";
import {createAction, createSlice} from "@reduxjs/toolkit";

export function createSmartWallet(): SmartWallet {
    const smartWallet = new SmartWallet({
        chain: "binance-testnet",
        factoryAddress: "0x0e5476a5AfD15c1e35ca4d97D220cb9f40617609",
        gasless: true,
        clientId: process.env.REACT_APP_TEMPLATE_CLIENT_ID || "",
    });
    return smartWallet;
}

export interface WalletState {
    localWallet: LocalWallet;
    smartWallet: SmartWallet;
}

const initialState: WalletState = {
    localWallet: new LocalWallet(),
    smartWallet: createSmartWallet(),
};

export const setLocalWallet = createAction('wallet/setLocalWallet', (localWallet: LocalWallet) => {
    return {
        payload: localWallet,
    };
});

export const setSmartWallet = createAction('wallet/setSmartWallet', (smartWallet: SmartWallet) => {
    return {
        payload: smartWallet,
    };
});

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setLocalWallet, (state, action) => {
            // @ts-ignore
            state.localWallet = action.payload;
        });
        builder.addCase(setSmartWallet, (state, action) => {
            state.smartWallet = action.payload;
        });
    }
});

export default walletSlice.reducer;
