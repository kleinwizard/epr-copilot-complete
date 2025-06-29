
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, Key, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SSOConfiguration() {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    clientSecret: '',
    domain: ''
  });
  const [azureConfig, setAzureConfig] = useState({
    tenantId: '',
    clientId: '',
    clientSecret: ''
  });
  const [samlConfig, setSamlConfig] = useState({
    entityId: '',
    ssoUrl: '',
    certificate: ''
  });
  const { toast } = useToast();

  const testConnection = async (provider: string) => {
    try {
      // Mock API call to test SSO connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Connection successful",
        description: `${provider} SSO configuration is working correctly`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${provider}`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Configuration copied to clipboard",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Single Sign-On Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure SSO providers for seamless authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch
              id="sso-enabled"
              checked={ssoEnabled}
              onCheckedChange={setSsoEnabled}
            />
            <Label htmlFor="sso-enabled">Enable Single Sign-On</Label>
            {ssoEnabled && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>

          {ssoEnabled && (
            <Tabs defaultValue="google" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="google">Google Workspace</TabsTrigger>
                <TabsTrigger value="azure">Microsoft Azure AD</TabsTrigger>
                <TabsTrigger value="saml">SAML 2.0</TabsTrigger>
              </TabsList>

              <TabsContent value="google" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Google Workspace SSO</CardTitle>
                    <CardDescription>
                      Configure Google Workspace authentication for your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="google-client-id">Client ID</Label>
                      <Input
                        id="google-client-id"
                        placeholder="123456789012-abcdef.apps.googleusercontent.com"
                        value={googleConfig.clientId}
                        onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="google-client-secret">Client Secret</Label>
                      <Input
                        id="google-client-secret"
                        type="password"
                        placeholder="Enter client secret"
                        value={googleConfig.clientSecret}
                        onChange={(e) => setGoogleConfig({...googleConfig, clientSecret: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="google-domain">Authorized Domain</Label>
                      <Input
                        id="google-domain"
                        placeholder="company.com"
                        value={googleConfig.domain}
                        onChange={(e) => setGoogleConfig({...googleConfig, domain: e.target.value})}
                      />
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Redirect URI:</strong> https://your-domain.com/auth/google/callback
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-auto p-1"
                          onClick={() => copyToClipboard('https://your-domain.com/auth/google/callback')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button onClick={() => testConnection('Google Workspace')}>
                        Test Connection
                      </Button>
                      <Button variant="outline">Save Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="azure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Microsoft Azure AD</CardTitle>
                    <CardDescription>
                      Configure Azure Active Directory authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                      <Input
                        id="azure-tenant-id"
                        placeholder="12345678-1234-1234-1234-123456789012"
                        value={azureConfig.tenantId}
                        onChange={(e) => setAzureConfig({...azureConfig, tenantId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="azure-client-id">Application (Client) ID</Label>
                      <Input
                        id="azure-client-id"
                        placeholder="87654321-4321-4321-4321-210987654321"
                        value={azureConfig.clientId}
                        onChange={(e) => setAzureConfig({...azureConfig, clientId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="azure-client-secret">Client Secret</Label>
                      <Input
                        id="azure-client-secret"
                        type="password"
                        placeholder="Enter client secret"
                        value={azureConfig.clientSecret}
                        onChange={(e) => setAzureConfig({...azureConfig, clientSecret: e.target.value})}
                      />
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Redirect URI:</strong> https://your-domain.com/auth/azure/callback
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-auto p-1"
                          onClick={() => copyToClipboard('https://your-domain.com/auth/azure/callback')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button onClick={() => testConnection('Microsoft Azure AD')}>
                        Test Connection
                      </Button>
                      <Button variant="outline">Save Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saml" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SAML 2.0 Configuration</CardTitle>
                    <CardDescription>
                      Configure SAML 2.0 authentication with your identity provider
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="saml-entity-id">Entity ID</Label>
                      <Input
                        id="saml-entity-id"
                        placeholder="https://your-idp.com/entity"
                        value={samlConfig.entityId}
                        onChange={(e) => setSamlConfig({...samlConfig, entityId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="saml-sso-url">SSO URL</Label>
                      <Input
                        id="saml-sso-url"
                        placeholder="https://your-idp.com/sso"
                        value={samlConfig.ssoUrl}
                        onChange={(e) => setSamlConfig({...samlConfig, ssoUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="saml-certificate">X.509 Certificate</Label>
                      <textarea
                        id="saml-certificate"
                        className="w-full h-32 p-2 border rounded-md"
                        placeholder="-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END CERTIFICATE-----"
                        value={samlConfig.certificate}
                        onChange={(e) => setSamlConfig({...samlConfig, certificate: e.target.value})}
                      />
                    </div>

                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        <strong>ACS URL:</strong> https://your-domain.com/auth/saml/acs<br />
                        <strong>SP Entity ID:</strong> oregon-epr-platform
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button onClick={() => testConnection('SAML 2.0')}>
                        Test Connection
                      </Button>
                      <Button variant="outline">Save Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
