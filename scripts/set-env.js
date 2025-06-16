const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');

const envConfigFile = `export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: '${process.env["NG_APP_FIREBASE_API_KEY"]}',
    authDomain: '${process.env["NG_APP_AUTH_DOMAIN"]}',
    projectId: '${process.env["NG_APP_PROJECT_ID"]}',
    storageBucket: '${process.env["NG_APP_STORAGE_BUCKET"]}',
    messagingSenderId: '${process.env["NG_APP_MESSAGING_SENDER_ID"]}',
    appId: '${process.env["NG_APP_APP_ID"]}'
  }
};`;

fs.writeFileSync(targetPath, envConfigFile);
console.log('✅ environment.prod.ts generado con éxito.');