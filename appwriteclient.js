import { Client } from 'react-native-appwrite';
import { Platform } from "react-native";

const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67d9deb600378e7ea5ed",
  bundleId: "com.learnacademy.eduthree",
};

export class AppwriteClientFactory {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      const client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);

      // The .setPlatform call is optional with the official library 
      // and can sometimes cause issues if 'bundleId' is not recognized. 
      // You can omit it if it triggers errors:
      // if (Platform.OS !== 'web') {
      //   client.setPlatform(config.bundleId);
      // }
      
      this.instance = {
        storage: new Storage(client),
        account: new Account(client),
      };
    }
    return this.instance;
  }
}
