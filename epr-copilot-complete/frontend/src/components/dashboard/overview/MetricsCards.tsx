
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';

interface MetricsCardsProps {
  complianceScore: number;
  daysToDeadline: number;
}

export function MetricsCards({ complianceScore, daysToDeadline }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{complianceScore}%</div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={complianceScore} className="flex-1" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +6% from last quarter
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Days to Deadline</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{daysToDeadline}</div>
          <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-700 border-orange-200">
            March 31, 2025
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Q1 2025 submission due
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Q4 2024 Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$19,500</div>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+16% from Q3</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on 2,450 kg materials
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <Package className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,247</div>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-xs text-blue-600">+23 this month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Across 8 product categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
