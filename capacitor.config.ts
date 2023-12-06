import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId   : 'com.arx.eqms.customer.angular',
  appName : 'EQMS',
  webDir  : 'dist',
  server  : {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      iconColor: "#488AFF",
    },
  },
};

export default config;
