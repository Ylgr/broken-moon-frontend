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
      console.log('doLogin: ')
      dispatch(setEncryptedWallet(res.wallet));
      persistEncryptedWallet(res.wallet);
      const wallet = ethers.Wallet.fromEncryptedJsonSync(res.wallet, loginPayload.password);
      // dispatch(setLocalWallet(wallet));
      const localWalletAddress = wallet.address;
      console.log('localWalletAddress: ', localWalletAddress)
      const smartWalletAddress  = await getSmartWalletAddress(localWalletAddress)
      console.log('smartWalletAddress: ', smartWalletAddress)

      dispatch(setSmartWalletAddress(smartWalletAddress));
      persistSmartWalletAddress(smartWalletAddress);
        const name = loginPayload.email.substring(0, loginPayload.email.lastIndexOf("@"))
      res.user.lastName = "Nguyen"
        res.user.firstName = name.charAt(0).toUpperCase() + name.slice(1)
      res.user.email.name = name
      res.user.userName = name
      res.user.imgUrl = 'https://api.dicebear.com/7.x/croodles/svg?seed=' + smartWalletAddress;
    console.log(res);
    dispatch(setUser(res.user));
    persistToken(res.token);
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
