
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PasswordManagement() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordHistory] = useState([
    { id: 1, date: '2024-01-15', status: 'Changed via password reset' },
    { id: 2, date: '2023-12-01', status: 'Changed by user' },
    { id: 3, date: '2023-10-15', status: 'Initial password set' },
  ]);
  const [securitySettings, setSecuritySettings] = useState({
    requireMFA: true,
    lockoutEnabled: true,
    lockoutAttempts: 5,
    lockoutDuration: 30,
    passwordExpiry: 90
  });
  const { toast } = useToast();

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty'].includes(password.toLowerCase())
    };

    score = Object.values(checks).filter(Boolean).length;
    return { score: (score / 6) * 100, checks };
  };

  const { score: passwordStrength, checks } = calculatePasswordStrength(newPassword);

  const getStrengthColor = (strength: number) => {
    if (strength < 33) return 'bg-red-500';
    if (strength < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 33) return 'Weak';
    if (strength < 66) return 'Medium';
    return 'Strong';
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 66) {
      toast({
        title: "Password too weak",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password Strength</span>
                <Badge variant={passwordStrength >= 66 ? 'default' : 'destructive'}>
                  {getStrengthText(passwordStrength)}
                </Badge>
              </div>
              <Progress value={passwordStrength} className={`h-2 ${getStrengthColor(passwordStrength)}`} />
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries({
                  'At least 8 characters': checks.length,
                  'Uppercase letter': checks.uppercase,
                  'Lowercase letter': checks.lowercase,
                  'Number': checks.numbers,
                  'Special character': checks.special,
                  'Not common password': checks.noCommon
                }).map(([requirement, met]) => (
                  <div key={requirement} className="flex items-center space-x-1">
                    {met ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={met ? 'text-green-600' : 'text-red-600'}>
                      {requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handlePasswordChange} className="w-full">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure password and account security policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lockout-attempts">Failed Login Attempts</Label>
              <Input
                id="lockout-attempts"
                type="number"
                value={securitySettings.lockoutAttempts}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  lockoutAttempts: parseInt(e.target.value)
                })}
                min="3"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Account locks after this many failed attempts
              </p>
            </div>

            <div>
              <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
              <Input
                id="lockout-duration"
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  lockoutDuration: parseInt(e.target.value)
                })}
                min="5"
                max="1440"
              />
            </div>

            <div>
              <Label htmlFor="password-expiry">Password Expiry (days)</Label>
              <Input
                id="password-expiry"
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  passwordExpiry: parseInt(e.target.value)
                })}
                min="30"
                max="365"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Password History</span>
          </CardTitle>
          <CardDescription>
            Recent password changes and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {passwordHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{entry.status}</p>
                  <p className="text-sm text-muted-foreground">{entry.date}</p>
                </div>
                <Badge variant="outline">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
