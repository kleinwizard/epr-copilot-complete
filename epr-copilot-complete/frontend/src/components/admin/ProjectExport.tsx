
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Code, Database, Cloud } from 'lucide-react';
import { downloadProjectSummary, generateProjectExport } from '@/utils/exportProject';

export const ProjectExport = () => {
  const [exportData] = useState(() => generateProjectExport());

  const handleDownloadSummary = () => {
    downloadProjectSummary();
  };

  const handleViewReport = () => {
    window.open('/COMPLETION_REPORT.md', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Project Export & Documentation</h2>
          <p className="text-muted-foreground">
            Complete project summary and export options
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleViewReport}>
            <FileText className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
          <Button onClick={handleDownloadSummary}>
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Implementation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Frontend Complete</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UI Components</span>
                    <Badge variant="outline">{exportData.structure.components.count}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Services</span>
                    <Badge variant="outline">{exportData.structure.services.count}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Type Definitions</span>
                    <Badge variant="outline">{exportData.structure.types.count}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backend Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Essential Services:</h4>
                  <ul className="space-y-1 text-sm">
                    {exportData.backendRequirements.essential.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Coverage</CardTitle>
              <CardDescription>All specified features have been implemented</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {exportData.metadata.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="justify-start">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Components</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {exportData.structure.components.categories.map((category, index) => (
                    <li key={index}>{category}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {exportData.structure.services.types.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {exportData.metadata.technologies.map((tech, index) => (
                    <li key={index}>{tech}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Development Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {exportData.deploymentInstructions.development.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {exportData.deploymentInstructions.production.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="h-5 w-5 mr-2" />
                Monthly Cost Estimates
              </CardTitle>
              <CardDescription>
                Estimated operational costs for production deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Development</span>
                    <span className="font-medium">{exportData.estimatedCosts.development}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hosting</span>
                    <span className="font-medium">{exportData.estimatedCosts.hosting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backend Services</span>
                    <span className="font-medium">{exportData.estimatedCosts.backend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Third-party Services</span>
                    <span className="font-medium">{exportData.estimatedCosts.thirdPartyServices}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Range</span>
                    <span>{exportData.estimatedCosts.total}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cost Optimization Tips:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Start with Supabase free tier</li>
                    <li>• Use Vercel free tier for hosting</li>
                    <li>• Scale services based on usage</li>
                    <li>• Monitor costs monthly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
