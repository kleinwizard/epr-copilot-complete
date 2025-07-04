
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ComplianceProfile {
  id: string;
  jurisdiction: string;
  annualRevenue: number;
  annualTonnage: number;
}

interface BusinessEntity {
  id: string;
  name: string;
  roles: string[];
  type: 'primary' | 'subsidiary';
}

interface CompanyInfo {
  legalName: string;
  dbaName: string;
  businessId: string;
  deqNumber: string;
  naicsCode: string;
  entityType: string;
  description: string;
  address: string;
  city: string;
  zipCode: string;
  primaryContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
  complianceOfficer: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
}

export function CompanySetup() {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    legalName: '',
    dbaName: '',
    businessId: '',
    deqNumber: '',
    naicsCode: '',
    entityType: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    primaryContact: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    },
    complianceOfficer: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    }
  });
  const [complianceProfiles, setComplianceProfiles] = useState<ComplianceProfile[]>([]);
  const [businessEntities, setBusinessEntities] = useState<BusinessEntity[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: '',
    roles: [] as string[],
    type: 'subsidiary' as 'primary' | 'subsidiary'
  });
  const [newProfile, setNewProfile] = useState({
    jurisdiction: '',
    annualRevenue: '',
    annualTonnage: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const [companyData, profiles, entities, docs] = await Promise.all([
        apiService.getCompanyInfo(),
        apiService.get('/api/company/compliance-profiles'),
        apiService.get('/api/company/entities'),
        apiService.get('/api/company/documents')
      ]);
      
      if (companyData) {
        setCompanyInfo(companyData);
      }
      setComplianceProfiles(profiles || []);
      setBusinessEntities(entities || []);
      setDocuments(docs || []);
    } catch (error) {
      console.error('Failed to load company data:', error);
    }
  };

  const handleSaveCompanyInfo = async () => {
    setIsLoading(true);
    try {
      await apiService.saveCompanyInfo(companyInfo);
      
      toast({
        title: "Company Information Saved",
        description: "Your company information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await apiService.uploadFile('/api/company/documents', file);
      
      if (result.success) {
        setDocuments(prev => [...prev, result.document]);
        toast({
          title: "Document Uploaded",
          description: `${file.name} has been successfully uploaded.`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProfile = async () => {
    if (!newProfile.jurisdiction || !newProfile.annualRevenue || !newProfile.annualTonnage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all profile fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const profile = await apiService.post('/api/company/compliance-profiles', {
        jurisdiction: newProfile.jurisdiction,
        annualRevenue: parseFloat(newProfile.annualRevenue),
        annualTonnage: parseFloat(newProfile.annualTonnage)
      });
      
      setComplianceProfiles(prev => [...prev, profile]);
      setNewProfile({ jurisdiction: '', annualRevenue: '', annualTonnage: '' });
      
      toast({
        title: "Profile Added",
        description: "Compliance profile has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add compliance profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProfile = async (profileId: string) => {
    try {
      await apiService.delete(`/api/company/compliance-profiles/${profileId}`);
      setComplianceProfiles(prev => prev.filter(p => p.id !== profileId));
      
      toast({
        title: "Profile Removed",
        description: "Compliance profile has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove compliance profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddEntity = async () => {
    if (!newEntity.name || newEntity.roles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide entity name and select at least one role.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entity = await apiService.post('/api/company/entities', newEntity);
      setBusinessEntities(prev => [...prev, entity]);
      setNewEntity({ name: '', roles: [], type: 'subsidiary' });
      setIsAddEntityModalOpen(false);
      
      toast({
        title: "Entity Added",
        description: "Business entity has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add business entity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEntityRoleToggle = (role: string) => {
    setNewEntity(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };
  
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
          <TabsTrigger value="compliance">Compliance Profiles</TabsTrigger>
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
                  <Input 
                    id="company-name" 
                    placeholder="Enter legal company name" 
                    value={companyInfo.legalName}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, legalName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dba">DBA / Trade Name</Label>
                  <Input 
                    id="dba" 
                    placeholder="Doing business as..." 
                    value={companyInfo.dbaName}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, dbaName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-id">Oregon Business ID</Label>
                  <Input 
                    id="business-id" 
                    placeholder="Business registry number" 
                    value={companyInfo.businessId}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, businessId: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deq-number">DEQ Number</Label>
                  <Input 
                    id="deq-number" 
                    placeholder="DEQ registration number" 
                    value={companyInfo.deqNumber}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, deqNumber: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="naics">NAICS Code</Label>
                  <Select value={companyInfo.naicsCode} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, naicsCode: value }))}>
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
                  <Select value={companyInfo.entityType} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, entityType: value }))}>
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
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
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
                <Input 
                  id="address" 
                  placeholder="123 Main Street" 
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Portland" 
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value="Oregon" disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input 
                    id="zip" 
                    placeholder="97201" 
                    value={companyInfo.zipCode}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
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
                        <Input 
                          id="primary-first" 
                          value={companyInfo.primaryContact.firstName}
                          onChange={(e) => setCompanyInfo(prev => ({ 
                            ...prev, 
                            primaryContact: { ...prev.primaryContact, firstName: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary-last">Last Name</Label>
                        <Input 
                          id="primary-last" 
                          value={companyInfo.primaryContact.lastName}
                          onChange={(e) => setCompanyInfo(prev => ({ 
                            ...prev, 
                            primaryContact: { ...prev.primaryContact, lastName: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-title">Title</Label>
                      <Input 
                        id="primary-title" 
                        value={companyInfo.primaryContact.title}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, title: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-email">Email</Label>
                      <Input 
                        id="primary-email" 
                        type="email" 
                        value={companyInfo.primaryContact.email}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, email: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-phone">Phone</Label>
                      <Input 
                        id="primary-phone" 
                        value={companyInfo.primaryContact.phone}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, phone: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compliance Officer</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="compliance-first">First Name</Label>
                        <Input 
                          id="compliance-first" 
                          value={companyInfo.complianceOfficer.firstName}
                          onChange={(e) => setCompanyInfo(prev => ({ 
                            ...prev, 
                            complianceOfficer: { ...prev.complianceOfficer, firstName: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compliance-last">Last Name</Label>
                        <Input 
                          id="compliance-last" 
                          value={companyInfo.complianceOfficer.lastName}
                          onChange={(e) => setCompanyInfo(prev => ({ 
                            ...prev, 
                            complianceOfficer: { ...prev.complianceOfficer, lastName: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-title">Title</Label>
                      <Input 
                        id="compliance-title" 
                        value={companyInfo.complianceOfficer.title}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          complianceOfficer: { ...prev.complianceOfficer, title: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-email">Email</Label>
                      <Input 
                        id="compliance-email" 
                        type="email" 
                        value={companyInfo.complianceOfficer.email}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          complianceOfficer: { ...prev.complianceOfficer, email: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compliance-phone">Phone</Label>
                      <Input 
                        id="compliance-phone" 
                        value={companyInfo.complianceOfficer.phone}
                        onChange={(e) => setCompanyInfo(prev => ({ 
                          ...prev, 
                          complianceOfficer: { ...prev.complianceOfficer, phone: e.target.value }
                        }))}
                      />
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
              <CardTitle>Entity Roles & Hierarchy</CardTitle>
              <CardDescription>Define entity roles and relationships for EPR compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Entity Roles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="brand-owner" />
                    <Label htmlFor="brand-owner">Brand Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="importer" />
                    <Label htmlFor="importer">Importer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="ecommerce-shipper" />
                    <Label htmlFor="ecommerce-shipper">E-commerce Shipper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="franchisor" />
                    <Label htmlFor="franchisor">Franchisor</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Entity Hierarchy</h4>
                <div className="space-y-2">
                  {businessEntities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No business entities defined yet. Add your first entity below.
                    </div>
                  ) : (
                    businessEntities.map((entity) => (
                      <div key={entity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{entity.name}</h4>
                          <p className="text-sm text-muted-foreground">{entity.roles.join(', ')}</p>
                        </div>
                        <Badge variant={entity.type === 'primary' ? 'default' : 'secondary'}>
                          {entity.type === 'primary' ? 'Primary' : 'Subsidiary'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
                
                <Dialog open={isAddEntityModalOpen} onOpenChange={setIsAddEntityModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Entity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Business Entity</DialogTitle>
                      <DialogDescription>
                        Define a new business entity and assign its roles for EPR compliance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="entity-name">Entity Name</Label>
                        <Input
                          id="entity-name"
                          placeholder="Enter entity name"
                          value={newEntity.name}
                          onChange={(e) => setNewEntity(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Entity Type</Label>
                        <Select value={newEntity.type} onValueChange={(value: 'primary' | 'subsidiary') => setNewEntity(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="subsidiary">Subsidiary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Entity Roles</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Brand Owner', 'Importer', 'E-commerce Shipper', 'Franchisor'].map((role) => (
                            <div key={role} className="flex items-center space-x-2">
                              <Switch
                                id={`role-${role}`}
                                checked={newEntity.roles.includes(role)}
                                onCheckedChange={() => handleEntityRoleToggle(role)}
                              />
                              <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddEntityModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEntity}>Add Entity</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jurisdictional Compliance Profiles</CardTitle>
              <CardDescription>
                Manage your annual revenue and tonnage data for each jurisdiction where you operate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <Select value={newProfile.jurisdiction} onValueChange={(value) => setNewProfile(prev => ({ ...prev, jurisdiction: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="ME">Maine</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="MD">Maryland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Gross Revenue</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={newProfile.annualRevenue}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, annualRevenue: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Tonnage</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      step="0.1" 
                      value={newProfile.annualTonnage}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, annualTonnage: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={handleAddProfile}>Add Profile</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {complianceProfiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No compliance profiles added yet. Add your first profile above.
                    </div>
                  ) : (
                    complianceProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{profile.jurisdiction}</span>
                          <p className="text-sm text-gray-600">
                            ${(profile.annualRevenue / 1000000).toFixed(1)}M revenue • {profile.annualTonnage} tons
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveProfile(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
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
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents uploaded yet. Upload your required documents below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{doc.name}</h4>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">Uploaded: {doc.filename}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium mb-1">Upload Document</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload business registration, certificates, or other required documents
                      </p>
                      <input
                        type="file"
                        id="document-upload"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('document-upload')?.click()}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          className="px-8" 
          onClick={handleSaveCompanyInfo}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Company Information'}
        </Button>
      </div>
    </div>
  );
}
