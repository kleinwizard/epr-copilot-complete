
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MFASetup() {
  const [mfaMethod, setMfaMethod] = useState<'authenticator' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    return codes;
  };

  const setupSMS = async () => {
    try {
      // Mock API call to setup SMS MFA
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "SMS verification sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS verification",
        variant: "destructive",
      });
    }
  };

  const setupAuthenticator = async () => {
    try {
      // Mock QR code generation for authenticator app
      const mockQRUrl = "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=otpauth://totp/OregonEPR:user@company.com?secret=JBSWY3DPEHPK3PXP&issuer=OregonEPR";
      setQrCodeUrl(mockQRUrl);
      toast({
        title: "Authenticator setup",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const verifyMFA = async () => {
    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      const codes = generateBackupCodes();
      setShowBackupCodes(true);
      toast({
        title: "MFA enabled successfully",
        description: "Please save your backup codes in a secure location",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Multi-Factor Authentication Setup</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mfaMethod || 'choose'} onValueChange={(value) => setMfaMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="choose">Choose Method</TabsTrigger>
              {/* DISABLED: SMS option disabled for initial launch */}
              <TabsTrigger value="authenticator">Authenticator</TabsTrigger>
            </TabsList>

            <TabsContent value="choose" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DISABLED: SMS MFA option disabled for initial launch */}
                <Card className="opacity-50 cursor-not-allowed">
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="font-semibold text-gray-400">SMS Verification</h3>
                    <p className="text-sm text-gray-400">Feature disabled for initial launch</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setMfaMethod('authenticator')}>
                  <CardContent className="p-4 text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Authenticator App</h3>
                    <p className="text-sm text-muted-foreground">Use Google Authenticator or similar</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* DISABLED: SMS MFA tab disabled for initial launch */}

            <TabsContent value="authenticator" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Download an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                  </AlertDescription>
                </Alert>

                <Button onClick={setupAuthenticator}>
                  Generate QR Code
                </Button>

                {qrCodeUrl && (
                  <div className="text-center space-y-4">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto border rounded" />
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="auth-code">Enter code from authenticator</Label>
                      <Input
                        id="auth-code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button onClick={verifyMFA} disabled={verificationCode.length !== 6}>
                        Verify & Enable MFA
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showBackupCodes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Backup Codes</span>
            </CardTitle>
            <CardDescription>
              Save these codes in a secure location. Each can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <Badge key={index} variant="outline" className="font-mono text-center p-2">
                  {code}
                </Badge>
              ))}
            </div>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These codes will not be shown again. Please download or print them now.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2 mt-4">
              <Button variant="outline">Download Codes</Button>
              <Button variant="outline">Print Codes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
