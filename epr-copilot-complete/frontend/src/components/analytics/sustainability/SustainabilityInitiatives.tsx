
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp } from 'lucide-react';

const initiatives = [
  {
    title: 'Recyclable Material Increase',
    description: 'Increase recyclable packaging to 80%',
    progress: 73,
    impact: 'High',
    deadline: '2024-12-31'
  },
  {
    title: 'Weight Optimization',
    description: 'Reduce average packaging weight by 15%',
    progress: 45,
    impact: 'Medium',
    deadline: '2024-09-30'
  },
  {
    title: 'Alternative Materials',
    description: 'Replace LDPE with compostable alternatives',
    progress: 28,
    impact: 'High',
    deadline: '2025-03-31'
  }
];

export function SustainabilityInitiatives() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Sustainability Initiatives</span>
        </CardTitle>
        <CardDescription>Active projects to improve environmental impact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initiatives.map((initiative, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{initiative.title}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant={initiative.impact === 'High' ? 'default' : 'secondary'}>
                    {initiative.impact} Impact
                  </Badge>
                  <span className="text-sm text-muted-foreground">Due: {initiative.deadline}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{initiative.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <Progress value={initiative.progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{initiative.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Focus on completing recyclable material initiative for maximum impact</li>
            <li>• Consider accelerating alternative materials timeline</li>
            <li>• Explore partnerships with sustainable packaging suppliers</li>
            <li>• Implement circular design principles in new product development</li>
          </ul>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Detailed Roadmap
          </Button>
          <Button size="sm">
            Add New Initiative
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
