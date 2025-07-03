import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  FileText,
  Search,
  BookOpen
} from 'lucide-react';

export function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Get help with EPR compliance, find answers to common questions, and contact our support team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Knowledge Base card removed */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Live Chat</span>
            </CardTitle>
            <CardDescription>
              Chat with our support team in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </Badge>
              <span className="text-sm text-muted-foreground">Avg. response: 2 min</span>
            </div>
            <Button className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Support</span>
            </CardTitle>
            <CardDescription>
              Send us an email and we'll get back to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-3">
              <p className="text-sm"><strong>General Support:</strong></p>
              <p className="text-sm text-muted-foreground">support@epr-compliance.com</p>
              <p className="text-sm"><strong>Technical Issues:</strong></p>
              <p className="text-sm text-muted-foreground">tech@epr-compliance.com</p>
            </div>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Phone Support</span>
            </CardTitle>
            <CardDescription>
              Call us for immediate assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Support Hotline</p>
                <p className="text-lg font-mono">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Monday - Friday, 9 AM - 6 PM EST</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentation</span>
            </CardTitle>
            <CardDescription>
              Access detailed guides and API documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                User Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                API Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Compliance Handbook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to the most common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">How do I calculate EPR fees?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                EPR fees are calculated based on material weight, type, and recyclability. Use our Fee Calculator in the Fee Management section.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">What file formats are supported for bulk import?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We support CSV, Excel (.xlsx), and XML formats. See our Bulk Import guide for detailed formatting requirements.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">How often should I submit compliance reports?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Reporting frequency depends on your jurisdiction. Most require quarterly submissions, but check your local regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
