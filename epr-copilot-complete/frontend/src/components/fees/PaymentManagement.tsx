import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  Calendar,
  Receipt,
  TrendingUp,
  Download
} from 'lucide-react';
import { paymentProcessingService } from '@/services/paymentProcessingService';
import { PaymentMethod, PaymentIntent, Invoice, PaymentHistory } from '@/types/payment';
import { RealTimeCalculationResult } from '@/services/realTimeFeeCalculation';

interface PaymentManagementProps {
  customerId: string;
  feeCalculation?: RealTimeCalculationResult;
}

export function PaymentManagement({ customerId, feeCalculation }: PaymentManagementProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [activePaymentIntent, setActivePaymentIntent] = useState<PaymentIntent | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as const,
    last4: '',
    brand: '',
    expiryMonth: '',
    expiryYear: ''
  });

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = () => {
    setPaymentMethods(paymentProcessingService.getPaymentMethods());
    setInvoices(paymentProcessingService.getInvoicesByCustomer(customerId));
    setPaymentHistory(paymentProcessingService.getPaymentHistory(customerId));
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.last4 || !newPaymentMethod.brand) return;

    const method = paymentProcessingService.addPaymentMethod({
      type: newPaymentMethod.type,
      last4: newPaymentMethod.last4,
      brand: newPaymentMethod.brand,
      expiryMonth: parseInt(newPaymentMethod.expiryMonth),
      expiryYear: parseInt(newPaymentMethod.expiryYear),
      isDefault: paymentMethods.length === 0
    });

    setPaymentMethods([...paymentMethods, method]);
    setShowAddPaymentMethod(false);
    setNewPaymentMethod({
      type: 'card',
      last4: '',
      brand: '',
      expiryMonth: '',
      expiryYear: ''
    });
  };

  const removePaymentMethod = (methodId: string) => {
    paymentProcessingService.removePaymentMethod(methodId);
    loadData();
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    paymentProcessingService.setDefaultPaymentMethod(methodId);
    loadData();
  };

  const processPayment = async () => {
    if (!feeCalculation) return;
    
    const defaultMethod = paymentProcessingService.getDefaultPaymentMethod();
    if (!defaultMethod) {
      alert('Please add a payment method first');
      return;
    }

    const intent = paymentProcessingService.createPaymentIntent(
      feeCalculation,
      defaultMethod.id,
      'EPR Fee Payment'
    );

    setActivePaymentIntent(intent);

    try {
      const processedIntent = await paymentProcessingService.processPayment(intent.id);
      setActivePaymentIntent(processedIntent);
      
      // Generate invoice
      const invoice = paymentProcessingService.generateInvoice(
        customerId,
        feeCalculation,
        intent.id
      );
      
      // Simulate successful payment
      setTimeout(() => {
        if (processedIntent.status === 'succeeded') {
          paymentProcessingService.recordPayment(
            invoice.id,
            defaultMethod,
            `txn_${Date.now()}`,
            processedIntent.amount * 0.029 // 2.9% fee
          );
          loadData();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Payment Section */}
      {feeCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Current Fee Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total EPR Fee</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(feeCalculation.totalFee)}
                </p>
                <p className="text-xs text-blue-600">
                  {feeCalculation.breakdown.length} materials
                </p>
              </div>
              <div className="text-right">
                {activePaymentIntent ? (
                  <div className="space-y-2">
                    <Badge className={getStatusColor(activePaymentIntent.status)}>
                      {getStatusIcon(activePaymentIntent.status)}
                      <span className="ml-1 capitalize">{activePaymentIntent.status}</span>
                    </Badge>
                    {activePaymentIntent.status === 'processing' && (
                      <div className="text-xs text-gray-600">Processing payment...</div>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={processPayment}
                    disabled={paymentMethods.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Management Tabs */}
      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Button onClick={() => setShowAddPaymentMethod(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No payment methods added</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {method.brand} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge variant="outline" className="text-green-700 bg-green-50">
                              Default
                            </Badge>
                          )}
                        </div>
                        {method.expiryMonth && method.expiryYear && (
                          <div className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Add Payment Method Form */}
              {showAddPaymentMethod && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
                  <h4 className="font-medium">Add New Payment Method</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={newPaymentMethod.type} 
                        onValueChange={(value: any) => setNewPaymentMethod(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="ach">ACH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input
                        value={newPaymentMethod.brand}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Visa, Mastercard, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last 4 Digits</Label>
                      <Input
                        value={newPaymentMethod.last4}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, last4: e.target.value }))}
                        placeholder="1234"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={newPaymentMethod.expiryMonth}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                          placeholder="MM"
                          maxLength={2}
                        />
                        <Input
                          value={newPaymentMethod.expiryYear}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                          placeholder="YY"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addPaymentMethod}>Add Method</Button>
                    <Button variant="outline" onClick={() => setShowAddPaymentMethod(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Invoices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No invoices found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{invoice.invoiceNumber}</span>
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1 capitalize">{invoice.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Issued: {new Date(invoice.issuedDate).toLocaleDateString()}
                          {invoice.dueDate && (
                            <span> • Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(invoice.amount)}</div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Payment History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No payment history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {payment.paymentMethod.brand} •••• {payment.paymentMethod.last4}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payment.paymentDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-gray-600">
                          Fee: {formatCurrency(payment.fees)} • Net: {formatCurrency(payment.netAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Payment Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Payment reports coming soon</p>
                <p className="text-sm">Track spending trends, fee analysis, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
