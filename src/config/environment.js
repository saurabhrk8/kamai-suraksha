import { PRODUCTION_CONFIG } from './production';

const config = {
  development: {
    API_BASE_URL: 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod',
    COGNITO_DOMAIN: 'kamaisuraksha-auth.auth.eu-west-2.amazoncognito.com',
    CLIENT_ID: 'nrck33p87u8mhi68nmjenk8g1',
    USER_POOL_ID: 'eu-west-2_Xbm29eLke',
    REGION: 'eu-west-2',
    REDIRECT_URI: 'http://localhost:5173/callback',
    LOGOUT_URI: 'http://localhost:5173/logout'
  },
  production: PRODUCTION_CONFIG
};

const environment = import.meta.env.MODE || 'development';
export default config[environment];
