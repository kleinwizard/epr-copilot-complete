
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface BarcodeResult {
  text: string;
  format: string;
  timestamp: Date;
}

export interface OfflineData {
  id: string;
  type: 'product' | 'material' | 'report';
  data: any;
  timestamp: Date;
  synced: boolean;
}

export interface TouchGesture {
  type: 'swipe' | 'tap' | 'long-press' | 'pinch';
  direction?: 'left' | 'right' | 'up' | 'down';
  target: HTMLElement;
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

export interface MobileSettings {
  offlineMode: boolean;
  syncFrequency: number;
  cameraPermission: boolean;
  locationPermission: boolean;
  pushNotifications: boolean;
}
