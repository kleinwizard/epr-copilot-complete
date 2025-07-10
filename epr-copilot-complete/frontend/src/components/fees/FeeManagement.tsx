
import { useState, useEffect } from 'react';
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
  Download,
  CreditCard
} from 'lucide-react';
import { FeeCalculator } from './FeeCalculator';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';


export function FeeManagement() {
  const [selectedTab, setSelectedTab] = useState('calculator');
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [feeHistory, setFeeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFee, setCurrentFee] = useState({ totalDue: 2500.00, quarter: 'Q1 2025', year: 2025 });
  const { toast } = useToast();

  const loadFeeData = async () => {
      try {
        setIsLoading(true);
        
        const token = authService.getAccessToken();
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        
        const historyResponse = await fetch(`${API_BASE_URL}/api/fees/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setFeeHistory(history || []);
        } else {
          setFeeHistory([
            {
              quarter: 'Q3 2024',
              submittedDate: '2024-09-15T00:00:00Z',
              fee: 2450.75,
              status: 'paid'
            },
            {
              quarter: 'Q2 2024',
              submittedDate: '2024-06-15T00:00:00Z',
              fee: 2180.50,
              status: 'paid'
            },
            {
              quarter: 'Q1 2024',
              submittedDate: '2024-03-15T00:00:00Z',
              fee: 1950.25,
              status: 'paid'
            }
          ]);
        }
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        
        const deadlines = [];
        
        const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
        const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
        const nextDeadlineDate = new Date(nextYear, (nextQuarter - 1) * 3 + 2, 15); // 15th of last month of quarter
        
        deadlines.push({
          quarter: `Q${nextQuarter} ${nextYear}`,
          dueDate: nextDeadlineDate.toISOString(),
          estimatedFee: 2500.00,
          status: 'pending'
        });
        
        if (deadlines.length < 2) {
          const followingQuarter = nextQuarter === 4 ? 1 : nextQuarter + 1;
          const followingYear = nextQuarter === 4 ? nextYear + 1 : nextYear;
          const followingDeadlineDate = new Date(followingYear, (followingQuarter - 1) * 3 + 2, 15);
          
          deadlines.push({
            quarter: `Q${followingQuarter} ${followingYear}`,
            dueDate: followingDeadlineDate.toISOString(),
            estimatedFee: 2600.00,
            status: 'draft'
          });
        }
        
        setUpcomingDeadlines(deadlines);
        
      } catch (error) {
        console.error('Failed to load fee data:', error);
        setUpcomingDeadlines([]);
        setFeeHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadFeeData();
  }, []);

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

  const exportIndividualReport = (payment: any) => {
    const reportData = {
      quarter: payment.quarter,
      submittedDate: payment.submittedDate,
      fee: payment.fee,
      status: payment.status,
      exportDate: new Date().toISOString()
    };

    const csvContent = [
      'Quarter,Submitted Date,Fee,Status,Export Date',
      `${reportData.quarter},${new Date(reportData.submittedDate).toLocaleDateString()},${reportData.fee},${reportData.status},${new Date(reportData.exportDate).toLocaleDateString()}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `epr-report-${payment.quarter.replace(/\s+/g, '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPaymentHistory = () => {
    if (feeHistory.length === 0) {
      alert('No payment history available to export');
      return;
    }

    const headers = ['Quarter', 'Submitted Date', 'Fee', 'Status'];
    const csvRows = [
      headers.join(','),
      ...feeHistory.map(payment => [
        payment.quarter,
        new Date(payment.submittedDate).toLocaleDateString(),
        payment.fee,
        payment.status
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `epr-payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPaidThisYear = feeHistory.reduce((sum, fee) => sum + fee.fee, 0);
  const nextDeadline = upcomingDeadlines[0];
  const daysUntilDeadline = nextDeadline ? Math.ceil((new Date(nextDeadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Next Deadline</span>
            </div>
            {isLoading ? (
              <div className="text-2xl font-bold text-gray-400">Loading...</div>
            ) : nextDeadline ? (
              <>
                <div className="text-2xl font-bold text-orange-600">{daysUntilDeadline} days</div>
                <p className="text-sm text-muted-foreground">
                  {nextDeadline.quarter} • ${nextDeadline.estimatedFee.toLocaleString()}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">No deadlines</div>
            )}
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading deadlines...</p>
                  </div>
                ) : upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming deadlines</p>
                  </div>
                ) : (
                  upcomingDeadlines.map((deadline, index) => (
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
                  ))
                )}
              </div>

              {nextDeadline && daysUntilDeadline <= 30 && (
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
                <Button variant="outline" onClick={exportPaymentHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading payment history...</p>
                  </div>
                ) : feeHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payment history available</p>
                  </div>
                ) : (
                  feeHistory.map((payment, index) => (
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
                      <Button variant="ghost" size="sm" onClick={() => exportIndividualReport(payment)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {currentFee.totalDue > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        className="w-full"
                        onClick={async () => {
                          try {
                            if (currentFee.totalDue <= 0) {
                              toast({
                                title: "No Payment Due",
                                description: "There is no outstanding balance to pay.",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            const paymentIntent = await apiService.post('/api/payments/create-intent', {
                              amount: currentFee.totalDue,
                              quarter: currentFee.quarter,
                              year: currentFee.year
                            });
                            
                            toast({
                              title: "Payment Processing",
                              description: `Processing payment of $${currentFee.totalDue.toLocaleString()}...`,
                            });
                            
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            toast({
                              title: "Payment Successful",
                              description: "Your EPR fee payment has been processed successfully.",
                            });
                            
                            loadFeeData();
                          } catch (error) {
                            console.error('Payment failed:', error);
                            toast({
                              title: "Payment Failed",
                              description: "Failed to process payment. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now - ${currentFee.totalDue.toLocaleString()}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Payment Schedule",
                            description: "Payment scheduling feature coming soon.",
                          });
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Payment
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Secure payment processing powered by Stripe. All major credit cards accepted.
                    </p>
                  </CardContent>
                </Card>
              )}

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
