import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId   : 'com.arx.eqms.customer.angular',
  appName : 'EQMS',
  webDir  : 'dist',
  server  : {
    androidScheme: 'https'
  }
};

export default config;
