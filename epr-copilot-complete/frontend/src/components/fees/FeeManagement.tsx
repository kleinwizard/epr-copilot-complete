
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  TrendingUp, 
  Calendar,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { FeeCalculator } from './FeeCalculator';

// Mock data for demonstration
const upcomingDeadlines = [
  {
    quarter: 'Q4 2024',
    dueDate: '2025-01-30',
    estimatedFee: 19500,
    status: 'pending'
  },
  {
    quarter: 'Q1 2025',
    dueDate: '2025-04-30',
    estimatedFee: 21200,
    status: 'draft'
  }
];

const feeHistory = [
  {
    quarter: 'Q3 2024',
    submittedDate: '2024-10-25',
    fee: 18900,
    status: 'paid'
  },
  {
    quarter: 'Q2 2024',
    submittedDate: '2024-07-28',
    fee: 15200,
    status: 'paid'
  },
  {
    quarter: 'Q1 2024',
    submittedDate: '2024-04-29',
    fee: 14200,
    status: 'paid'
  }
];

export function FeeManagement() {
  const [selectedTab, setSelectedTab] = useState('calculator');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaidThisYear = feeHistory.reduce((sum, fee) => sum + fee.fee, 0);
  const nextDeadline = upcomingDeadlines[0];
  const daysUntilDeadline = Math.ceil((new Date(nextDeadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Next Deadline</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{daysUntilDeadline} days</div>
            <p className="text-sm text-muted-foreground">
              {nextDeadline.quarter} • ${nextDeadline.estimatedFee.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">YTD Fees Paid</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalPaidThisYear.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {feeHistory.length} quarters submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Compliance Status</span>
            </div>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <Badge className="mt-1 bg-green-100 text-green-800">Up to date</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <FeeCalculator />
        </TabsContent>

        <TabsContent value="deadlines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Fee Deadlines</CardTitle>
              <CardDescription>
                Track your quarterly EPR fee submission deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{deadline.quarter} Submission</h3>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Estimated Fee: ${deadline.estimatedFee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(deadline.status)}>
                        {deadline.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Prepare Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {daysUntilDeadline <= 30 && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Deadline Approaching</p>
                      <p className="text-sm text-orange-700">
                        Your {nextDeadline.quarter} EPR fee submission is due in {daysUntilDeadline} days. 
                        Make sure to prepare and submit your report on time to avoid penalties.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View your past EPR fee submissions and payments
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feeHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.quarter}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(payment.submittedDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium">
                          Fee: ${payment.fee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Total Fees Paid (2024)</p>
                    <p className="text-sm text-blue-700">
                      {feeHistory.length} quarterly submissions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">
                      ${totalPaidThisYear.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
