import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ResetPasswordRequest,
  login,
  LoginRequest,
  signUp,
  SignUpRequest,
  resetPassword,
  verifySecurityCode,
  SecurityCodePayload,
  NewPasswordData,
  setNewPassword,
} from '@app/api/auth.api';
import { setUser } from '@app/store/slices/userSlice';
import {
    deleteToken,
    deleteUser,
    persistEncryptedWallet, persistSmartWalletAddress,
    persistToken,
    readToken
} from '@app/services/localStorage.service';
import {ethers} from "ethers";
import {setEncryptedWallet, setLocalWallet, setSmartWalletAddress} from "@app/store/slices/walletSlice";
import {getSmartWalletAddress} from "@app/components/contract/smartWallet";

export interface AuthSlice {
  token: string | null;
}

const initialState: AuthSlice = {
  token: readToken(),
};

export const doLogin = createAsyncThunk('auth/doLogin', async (loginPayload: LoginRequest, { dispatch }) =>
  login(loginPayload).then(async (res) => {
    console.log(res);
    dispatch(setUser(res.user));
    persistToken(res.token);
    dispatch(setEncryptedWallet(res.wallet));
    persistEncryptedWallet(res.wallet);
    const wallet = ethers.Wallet.fromEncryptedJsonSync(res.wallet, loginPayload.password);
    // dispatch(setLocalWallet(wallet));
    const localWalletAddress = wallet.address;
    const smartWalletAddress  = await getSmartWalletAddress(localWalletAddress)
    dispatch(setSmartWalletAddress(smartWalletAddress));
    persistSmartWalletAddress(smartWalletAddress);
    return res.token;
  }),
);

export const doSignUp = createAsyncThunk('auth/doSignUp', async (signUpPayload: SignUpRequest) =>
  signUp(signUpPayload),
);

export const doResetPassword = createAsyncThunk(
  'auth/doResetPassword',
  async (resetPassPayload: ResetPasswordRequest) => resetPassword(resetPassPayload),
);

export const doVerifySecurityCode = createAsyncThunk(
  'auth/doVerifySecurityCode',
  async (securityCodePayload: SecurityCodePayload) => verifySecurityCode(securityCodePayload),
);

export const doSetNewPassword = createAsyncThunk('auth/doSetNewPassword', async (newPasswordData: NewPasswordData) =>
  setNewPassword(newPasswordData),
);

export const doLogout = createAsyncThunk('auth/doLogout', (payload, { dispatch }) => {
  deleteToken();
  deleteUser();
  dispatch(setUser(null));
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(doLogin.fulfilled, (state, action) => {
      state.token = action.payload;
    });
    builder.addCase(doLogout.fulfilled, (state) => {
      state.token = '';
    });
  },
});

export default authSlice.reducer;
