
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supportService } from '@/services/supportService';
import { ContextualTip } from '@/types/support';
import { HelpCircle, Lightbulb, MousePointer, Eye } from 'lucide-react';

export const ContextualHelp = () => {
  const [tips, setTips] = useState<ContextualTip[]>([]);
  const [helpEnabled, setHelpEnabled] = useState(true);
  const [selectedPage, setSelectedPage] = useState('dashboard');

  useEffect(() => {
    loadContextualTips();
  }, [selectedPage]);

  const loadContextualTips = async () => {
    const tipsData = await supportService.getContextualTips(selectedPage);
    setTips(tipsData);
  };

  const pages = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'product-catalog', name: 'Product Catalog' },
    { id: 'fees', name: 'Fee Management' },
    { id: 'reports', name: 'Reports' },
    { id: 'calendar', name: 'Calendar' }
  ];

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'hover': return <MousePointer className="h-4 w-4" />;
      case 'click': return <Eye className="h-4 w-4" />;
      case 'focus': return <HelpCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tooltip': return 'bg-blue-100 text-blue-800';
      case 'popover': return 'bg-green-100 text-green-800';
      case 'modal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Contextual Help Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Contextual Help Settings
            <Switch 
              checked={helpEnabled} 
              onCheckedChange={setHelpEnabled}
            />
          </CardTitle>
          <CardDescription>
            Enable or disable contextual help tips throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lightbulb className="h-4 w-4" />
            <span>
              {helpEnabled ? 'Contextual help is enabled' : 'Contextual help is disabled'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Page Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Page to Configure</CardTitle>
          <CardDescription>Choose which page's contextual help you want to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pages.map(page => (
              <Button
                key={page.id}
                variant={selectedPage === page.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPage(page.id)}
              >
                {page.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contextual Tips for Selected Page */}
      <Card>
        <CardHeader>
          <CardTitle>
            Contextual Tips for {pages.find(p => p.id === selectedPage)?.name}
          </CardTitle>
          <CardDescription>
            Manage help tips that appear on this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tips.length > 0 ? (
            <div className="space-y-4">
              {tips.map(tip => (
                <Card key={tip.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{tip.title}</h4>
                          <Badge className={getTypeColor(tip.type)}>
                            {tip.type}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            {getTriggerIcon(tip.trigger)}
                            <span className="ml-1">{tip.trigger}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{tip.content}</p>
                        <p className="text-xs text-gray-500">Element: <code className="bg-gray-100 px-1 rounded">{tip.element}</code></p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No contextual tips configured for this page</p>
              <Button>Add New Tip</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Help Configuration</CardTitle>
          <CardDescription>Global settings for contextual help system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show help on first visit</h4>
                <p className="text-sm text-gray-500">Automatically show help tips when users visit a page for the first time</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow users to dismiss tips</h4>
                <p className="text-sm text-gray-500">Let users permanently dismiss help tips</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Track help interactions</h4>
                <p className="text-sm text-gray-500">Monitor which help tips are most useful</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
