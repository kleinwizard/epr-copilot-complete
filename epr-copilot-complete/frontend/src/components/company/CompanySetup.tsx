
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CompanySetup() {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  
  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Company Verification Status</CardTitle>
              <CardDescription>Your Oregon business registration and DEQ compliance status</CardDescription>
            </div>
            <Badge 
              variant={verificationStatus === 'verified' ? 'default' : 'secondary'}
              className={verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            >
              {verificationStatus === 'verified' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Verification
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Oregon Business Registry</p>
                <p className="text-sm text-green-700">Verified</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">DEQ Registration</p>
                <p className="text-sm text-yellow-700">Pending</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">EPR Eligibility</p>
                <p className="text-sm text-blue-700">Qualified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="entities">Multi-Entity Setup</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Legal Company Name</Label>
                  <Input id="company-name" placeholder="Enter legal company name" defaultValue="Acme Corporation Inc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dba">DBA / Trade Name</Label>
                  <Input id="dba" placeholder="Doing business as..." defaultValue="Acme Products" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-id">Oregon Business ID</Label>
                  <Input id="business-id" placeholder="Business registry number" defaultValue="123456789" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deq-number">DEQ Number</Label>
                  <Input id="deq-number" placeholder="DEQ registration number" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="naics">NAICS Code</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="311">Food Manufacturing</SelectItem>
                      <SelectItem value="325">Chemical Manufacturing</SelectItem>
                      <SelectItem value="454">Nonstore Retailers</SelectItem>
                      <SelectItem value="722">Food Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your business operations and products..."
                  defaultValue="Manufacturer and distributor of consumer packaged goods including food products, household items, and personal care products."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Business Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="123 Main Street" defaultValue="456 Industrial Blvd" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Portland" defaultValue="Portland" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value="Oregon" disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" placeholder="97201" defaultValue="97205" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Key Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Contact</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="primary-first">First Name</Label>
                        <Input id="primary-first" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary-last">Last Name</Label>
                        <Input id="primary-last" defaultValue="Smith" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-title">Title</Label>
                      <Input id="primary-title" defaultValue="Environmental Manager" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-email">Email</Label>
                      <Input id="primary-email" type="email" defaultValue="john.smith@acme.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-phone">Phone</Label>
                      <Input id="primary-phone" defaultValue="(503) 555-0123" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compliance Officer</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="compliance-first">First Name</Label>
                        <Input id="compliance-first" defaultValue="Sarah" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compliance-last">Last Name</Label>
                        <Input id="compliance-last" defaultValue="Johnson" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-title">Title</Label>
                      <Input id="compliance-title" defaultValue="Compliance Specialist" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-email">Email</Label>
                      <Input id="compliance-email" type="email" defaultValue="sarah.johnson@acme.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-phone">Phone</Label>
                      <Input id="compliance-phone" defaultValue="(503) 555-0124" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Entity Management</CardTitle>
              <CardDescription>Manage multiple business entities under one account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Acme Corporation Inc. (Parent)</h4>
                    <p className="text-sm text-muted-foreground">Primary entity - Manufacturing</p>
                  </div>
                  <Badge>Primary</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Acme Retail LLC</h4>
                    <p className="text-sm text-muted-foreground">Subsidiary - Retail operations</p>
                  </div>
                  <Badge variant="outline">Subsidiary</Badge>
                </div>
                
                <Button variant="outline" className="w-full">
                  + Add New Entity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Required Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Oregon Business Registration</h4>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Uploaded: business-registration.pdf</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">DEQ Registration Certificate</h4>
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Required for verification</p>
                    <Button size="sm" variant="outline" className="mt-2">Upload</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Tax ID Verification</h4>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Uploaded: tax-id.pdf</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Insurance Certificate</h4>
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Optional but recommended</p>
                    <Button size="sm" variant="outline" className="mt-2">Upload</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" className="px-8">
          Save Company Information
        </Button>
      </div>
    </div>
  );
}
