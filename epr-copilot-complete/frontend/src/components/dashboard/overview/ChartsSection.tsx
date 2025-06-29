
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Jan', fees: 12500, submissions: 4 },
  { month: 'Feb', fees: 15200, submissions: 3 },
  { month: 'Mar', fees: 18900, submissions: 5 },
  { month: 'Apr', fees: 14200, submissions: 4 },
  { month: 'May', fees: 16800, submissions: 6 },
  { month: 'Jun', fees: 19500, submissions: 4 }
];

const complianceData = [
  { quarter: 'Q1 2024', score: 85 },
  { quarter: 'Q2 2024', score: 92 },
  { quarter: 'Q3 2024', score: 88 },
  { quarter: 'Q4 2024', score: 94 }
];

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Fee Trends</CardTitle>
          <CardDescription>EPR fees and submission volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fees" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Score Trend</CardTitle>
          <CardDescription>Quarterly compliance performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
