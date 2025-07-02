
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  FileText, 
  Package, 
  DollarSign,
  Recycle,
  Calendar,
  CheckCircle
} from 'lucide-react';
import type { QuarterlyReport } from '@/services/reportService';

interface ReportViewerProps {
  report: QuarterlyReport;
  onBack: () => void;
}

export function ReportViewer({ report, onBack }: ReportViewerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // In real app, would update report status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold">{report.quarter} {report.year} Report</h2>
              <Badge className={`${getStatusColor(report.status)}`}>
                {report.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Due: {new Date(report.dueDate).toLocaleDateString()}
              {report.submissionDate && ` • Submitted: ${new Date(report.submissionDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {report.status === 'Draft' && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Products</span>
            </div>
            <div className="text-2xl font-bold">{report.summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {report.summary.totalUnits.toLocaleString()} units sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium">Total Weight</span>
            </div>
            <div className="text-2xl font-bold">{(report.summary.totalWeight / 1000).toFixed(1)}kg</div>
            <p className="text-xs text-muted-foreground">
              Packaging materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Recycle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Recyclable</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{report.summary.recyclablePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              By weight
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Total Fee</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">${report.fees.totalDue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              After discounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(report.summary.materialBreakdown).map(([material, weight]) => (
                    <div key={material} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{material}</span>
                      <span className="text-sm">{(weight / 1000).toFixed(1)}kg</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Base Fee</span>
                    <span className="text-sm">${report.fees.totalBaseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Recyclability Discount</span>
                    <span className="text-sm text-green-600">-${report.fees.recyclabilityDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t font-medium">
                    <span>Total Due</span>
                    <span>${report.fees.totalDue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.products.map((product) => (
                  <div key={product.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      </div>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Units Sold:</span>
                        <p className="font-medium">{product.unitsSold.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Weight:</span>
                        <p className="font-medium">{product.totalWeight}g</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Fee:</span>
                        <p className="font-medium">${product.totalFee.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.summary.materialBreakdown).map(([material, weight]) => {
                  const percentage = (weight / report.summary.totalWeight * 100).toFixed(1);
                  return (
                    <div key={material} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{material}</span>
                        <span className="text-sm">{(weight / 1000).toFixed(1)}kg ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Calculation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Base Fee</p>
                    <p className="text-lg font-bold">${report.fees.totalBaseFee.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">Recyclability Discount</p>
                    <p className="text-lg font-bold text-green-700">-${report.fees.recyclabilityDiscount.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Final Amount</p>
                    <p className="text-lg font-bold text-blue-700">${report.fees.totalDue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Payment Status</span>
                  </div>
                  <Badge variant={report.fees.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                    {report.fees.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
