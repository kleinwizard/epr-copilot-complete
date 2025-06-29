
import { BarcodeResult, OfflineData, PWAInstallPrompt, MobileSettings } from '@/types/mobile';

class MobileService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private offlineData: OfflineData[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.initializePWA();
    this.setupOfflineHandlers();
  }

  // PWA Installation
  private initializePWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
    });
  }

  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    
    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }

  isPWAInstallable(): boolean {
    return !!this.deferredPrompt;
  }

  // Barcode Scanning
  async scanBarcode(): Promise<BarcodeResult | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // Simulate barcode detection (in real app, use a barcode library)
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          resolve({
            text: '1234567890123',
            format: 'UPC-A',
            timestamp: new Date()
          });
        }, 2000);
      });
    } catch (error) {
      console.error('Camera access denied:', error);
      return null;
    }
  }

  // Offline Capabilities
  private setupOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  saveOfflineData(type: 'product' | 'material' | 'report', data: any): void {
    const offlineItem: OfflineData = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date(),
      synced: false
    };

    this.offlineData.push(offlineItem);
    localStorage.setItem('offlineData', JSON.stringify(this.offlineData));
  }

  getOfflineData(): OfflineData[] {
    const stored = localStorage.getItem('offlineData');
    if (stored) {
      this.offlineData = JSON.parse(stored);
    }
    return this.offlineData;
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isOnline) return;

    const unsyncedData = this.offlineData.filter(item => !item.synced);
    
    for (const item of unsyncedData) {
      try {
        // Simulate API sync
        await new Promise(resolve => setTimeout(resolve, 500));
        item.synced = true;
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
      }
    }

    localStorage.setItem('offlineData', JSON.stringify(this.offlineData));
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  // Settings
  getMobileSettings(): MobileSettings {
    const stored = localStorage.getItem('mobileSettings');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      offlineMode: true,
      syncFrequency: 300, // 5 minutes
      cameraPermission: false,
      locationPermission: false,
      pushNotifications: false
    };
  }

  saveMobileSettings(settings: MobileSettings): void {
    localStorage.setItem('mobileSettings', JSON.stringify(settings));
  }
}

export const mobileService = new MobileService();
