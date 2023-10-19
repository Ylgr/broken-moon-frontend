import { httpApiMock } from '@app/api/mocks/http.api.mock';
import { AuthData } from '@app/api/auth.api';
import { initValues } from '@app/components/auth/LoginForm/LoginForm';
import Account from '@app/mock-backend/wallets/account.json';
import Alice from '@app/mock-backend/wallets/alice.json';
import Bob from '@app/mock-backend/wallets/bob.json';
import Test from '@app/mock-backend/wallets/test.json';

const avatarImg = process.env.REACT_APP_ASSETS_BUCKET + '/avatars/avatar5.webp';

const encryptedWallets = [Account, Alice, Bob, Test].reduce((previousValue, currentValue) => {
  previousValue[currentValue.email] = currentValue.encryptedWallet;
  return previousValue;
}, {[initValues.email]: initValues.password});

httpApiMock.onPost('login').reply((config) => {
  const data: AuthData = JSON.parse(config.data || '');
  const encryptedWallet = encryptedWallets[data.email];
  if(!encryptedWallet) return [401, { message: 'Invalid Credentials' }];

  console.log(data);
  if (data.password === initValues.password) {
    return [
      200,
      {
        token: 'bearerToken',
        user: {
          id: 1,
          firstName: 'Chris',
          lastName: 'Johnson',
          imgUrl: avatarImg,
          userName: '@john1989',
          email: {
            name: 'chris.johnson@altence.com',
            verified: false,
          },
          phone: {
            number: '+18143519459',
            verified: true,
          },
          sex: 'male',
          birthday: '01/26/2022',
          lang: 'en',
          country: 'GB',
          city: 'London',
          address1: '14 London Road',
          zipcode: 5211,
          website: 'altence.com',
          socials: {
            twitter: '@altence_team',
            facebook: 'https://facebook.com/groups/1076577369582221',
            linkedin: 'https://linkedin.com/company/altence',
          },
        },
      },
    ];
  } else return [401, { message: 'Invalid Credentials' }];
});

httpApiMock.onPost('signUp').reply(200);

httpApiMock.onPost('forgotPassword').reply(200);

httpApiMock.onPost('verifySecurityCode').reply(200);

httpApiMock.onPost('setNewPassword').reply(200);
