
import { useState, useEffect } from 'react';
import { mobileService } from '@/services/mobileService';
import { BarcodeResult, MobileSettings } from '@/types/mobile';

export const useMobile = () => {
  const [isOffline, setIsOffline] = useState(mobileService.isOffline());
  const [isPWAInstallable, setIsPWAInstallable] = useState(mobileService.isPWAInstallable());
  const [settings, setSettings] = useState<MobileSettings>(mobileService.getMobileSettings());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    const result = await mobileService.installPWA();
    setIsPWAInstallable(mobileService.isPWAInstallable());
    return result;
  };

  const scanBarcode = async (): Promise<BarcodeResult | null> => {
    return await mobileService.scanBarcode();
  };

  const saveOfflineData = (type: 'product' | 'material' | 'report', data: any) => {
    mobileService.saveOfflineData(type, data);
  };

  const syncData = async () => {
    await mobileService.syncOfflineData();
  };

  const updateSettings = (newSettings: MobileSettings) => {
    mobileService.saveMobileSettings(newSettings);
    setSettings(newSettings);
  };

  return {
    isOffline,
    isPWAInstallable,
    settings,
    installPWA,
    scanBarcode,
    saveOfflineData,
    syncData,
    updateSettings
  };
};
