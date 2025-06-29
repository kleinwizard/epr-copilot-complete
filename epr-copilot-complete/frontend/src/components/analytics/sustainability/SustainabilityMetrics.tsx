
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Globe, Recycle, Award } from 'lucide-react';

export function SustainabilityMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sustainability Score</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">67</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +5 this month
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carbon Footprint</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">2.8t</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  -12% YoY
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <Recycle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Circularity Rate</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">73%</span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  +8% target
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry Ranking</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">#12</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Top 20%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
