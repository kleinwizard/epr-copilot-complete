
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Hand, Smartphone, Zap, Move } from 'lucide-react';

export const TouchOptimization = () => {
  const [touchSettings, setTouchSettings] = useState({
    hapticFeedback: true,
    swipeGestures: true,
    doubleTapToZoom: true,
    longPressMenu: true
  });

  const [demoInteraction, setDemoInteraction] = useState<string | null>(null);

  const handleDemoInteraction = (type: string) => {
    setDemoInteraction(type);
    setTimeout(() => setDemoInteraction(null), 2000);
  };

  const touchFeatures = [
    {
      title: 'Swipe Navigation',
      description: 'Swipe left/right to navigate between sections',
      enabled: touchSettings.swipeGestures
    },
    {
      title: 'Pull to Refresh',
      description: 'Pull down to refresh data',
      enabled: true
    },
    {
      title: 'Pinch to Zoom',
      description: 'Zoom in/out on charts and images',
      enabled: true
    },
    {
      title: 'Long Press Menu',
      description: 'Long press for context menus',
      enabled: touchSettings.longPressMenu
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hand className="h-5 w-5 mr-2" />
            Touch Optimization
          </CardTitle>
          <CardDescription>
            Enhanced touch interactions for mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {touchFeatures.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{feature.title}</h4>
                  <Badge variant={feature.enabled ? "default" : "secondary"}>
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Touch Settings</CardTitle>
          <CardDescription>Configure touch behavior and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Haptic Feedback</h4>
              <p className="text-sm text-gray-600">Vibrate on touch interactions</p>
            </div>
            <Switch 
              checked={touchSettings.hapticFeedback}
              onCheckedChange={(checked) => 
                setTouchSettings({...touchSettings, hapticFeedback: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Swipe Gestures</h4>
              <p className="text-sm text-gray-600">Enable swipe navigation</p>
            </div>
            <Switch 
              checked={touchSettings.swipeGestures}
              onCheckedChange={(checked) => 
                setTouchSettings({...touchSettings, swipeGestures: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Double Tap to Zoom</h4>
              <p className="text-sm text-gray-600">Quick zoom on double tap</p>
            </div>
            <Switch 
              checked={touchSettings.doubleTapToZoom}
              onCheckedChange={(checked) => 
                setTouchSettings({...touchSettings, doubleTapToZoom: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Long Press Menu</h4>
              <p className="text-sm text-gray-600">Context menu on long press</p>
            </div>
            <Switch 
              checked={touchSettings.longPressMenu}
              onCheckedChange={(checked) => 
                setTouchSettings({...touchSettings, longPressMenu: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Touch Demo</CardTitle>
          <CardDescription>Try different touch interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 text-center"
              onClick={() => handleDemoInteraction('tap')}
            >
              <div>
                <Smartphone className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Tap</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 text-center"
              onDoubleClick={() => handleDemoInteraction('double-tap')}
            >
              <div>
                <Zap className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Double Tap</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 text-center"
              onMouseDown={() => setTimeout(() => handleDemoInteraction('long-press'), 500)}
            >
              <div>
                <Hand className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Long Press</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 text-center"
              onClick={() => handleDemoInteraction('swipe')}
            >
              <div>
                <Move className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Swipe</span>
              </div>
            </Button>
          </div>

          {demoInteraction && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-800 font-medium">
                {demoInteraction.charAt(0).toUpperCase() + demoInteraction.slice(1)} detected!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
