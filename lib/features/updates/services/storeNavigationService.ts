import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { UPDATE_CONFIG } from '../config';

export class StoreNavigationService {
  private static readonly PACKAGE_NAME = 'com.welkit.kgency';

  /**
   * 해당 플랫폼의 앱스토어로 이동합니다
   */
  static async openStore(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await this.openAppStore();
      } else if (Platform.OS === 'android') {
        await this.openPlayStore();
      }
    } catch (error) {
      console.error('Failed to open store:', error);
    }
  }

  /**
   * iOS App Store로 이동합니다
   */
  private static async openAppStore(): Promise<void> {
    const appStoreId = UPDATE_CONFIG.appStoreId || '6749147143';
    const storeUrl = `itms-apps://itunes.apple.com/app/id${appStoreId}`;
    const webUrl = `https://apps.apple.com/app/id${appStoreId}`;
    
    const canOpenStore = await Linking.canOpenURL(storeUrl);
    if (canOpenStore) {
      await Linking.openURL(storeUrl);
    } else {
      await WebBrowser.openBrowserAsync(webUrl);
    }
  }

  /**
   * Android Play Store로 이동합니다
   */
  private static async openPlayStore(): Promise<void> {
    const packageName = Constants.expoConfig?.android?.package || this.PACKAGE_NAME;
    const storeUrl = `market://details?id=${packageName}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    
    const canOpenStore = await Linking.canOpenURL(storeUrl);
    if (canOpenStore) {
      await Linking.openURL(storeUrl);
    } else {
      await WebBrowser.openBrowserAsync(webUrl);
    }
  }
}