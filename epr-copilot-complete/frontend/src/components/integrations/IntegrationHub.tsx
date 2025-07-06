

import { Plug, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const IntegrationHub = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-gray-600 mt-2">Connect and manage all your external integrations</p>
        </div>
      </div>

      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Plug className="h-16 w-16 text-gray-400" />
                <Clock className="h-6 w-6 text-orange-500 absolute -top-1 -right-1 bg-white rounded-full p-1" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Coming Soon</h3>
            <p className="text-gray-500 mb-2 leading-relaxed">
              The Integration Hub is currently under development and will be available in a future release.
            </p>
            <p className="text-gray-500 leading-relaxed">
              This powerful feature will allow you to connect with e-commerce platforms, supply chain systems, 
              custom APIs, and webhook endpoints to streamline your EPR compliance workflow.
            </p>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🚀 Stay tuned for updates on integration capabilities including:
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• E-commerce platform connections</li>
                <li>• Supply chain data synchronization</li>
                <li>• Custom API integrations</li>
                <li>• Real-time webhook notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// PRESERVED CODE FOR FUTURE IMPLEMENTATION:
