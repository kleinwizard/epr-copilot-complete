
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextualHelp } from './ContextualHelp';
import { HelpCenter } from './HelpCenter';
import { TrainingSystem } from './TrainingSystem';
import { SupportChannels } from './SupportChannels';
import { HelpCircle, BookOpen, MessageSquare, GraduationCap } from 'lucide-react';

export const SupportHelpSystem = () => {
  const [activeTab, setActiveTab] = useState('help-center');

  const supportStats = {
    helpArticles: 156,
    trainingModules: 24,
    avgResponseTime: '2.3 hours',
    satisfactionRate: 94
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support & Help System</h1>
          <p className="text-gray-600 mt-2">Get help, learn new features, and access support resources</p>
        </div>
      </div>

      {/* Support Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Help Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{supportStats.helpArticles}</div>
            <p className="text-xs text-gray-500">available articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{supportStats.trainingModules}</div>
            <p className="text-xs text-gray-500">learning modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{supportStats.avgResponseTime}</div>
            <p className="text-xs text-gray-500">average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{supportStats.satisfactionRate}%</div>
            <p className="text-xs text-gray-500">user satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Support & Help Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="help-center">Help Center</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="contextual">Contextual Help</TabsTrigger>
          <TabsTrigger value="support">Support Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="help-center" className="mt-6">
          <HelpCenter />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <TrainingSystem />
        </TabsContent>

        <TabsContent value="contextual" className="mt-6">
          <ContextualHelp />
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <SupportChannels />
        </TabsContent>
      </Tabs>
    </div>
  );
};
