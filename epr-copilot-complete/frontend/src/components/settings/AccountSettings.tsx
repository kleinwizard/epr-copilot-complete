
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Mail, Phone, MapPin, Upload, FileText, Crop } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  avatar?: string;
}

interface CompanyData {
  legalName: string;
  dbaName: string;
  businessId: string;
  deqNumber: string;
  address: string;
  city: string;
  zipCode: string;
  description: string;
}

export function AccountSettings() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    avatar: ''
  });
  const [preferences, setPreferences] = useState({
    timezone: 'Pacific Time (PT)',
    language: 'English (US)'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      const [companyInfo, profileInfo, userPrefs] = await Promise.all([
        apiService.getCompanyInfo(),
        apiService.get('/api/user/profile'),
        apiService.get('/api/user/preferences')
      ]);
      
      setCompanyData(companyInfo);
      if (profileInfo) {
        setUserProfile(profileInfo);
      }
      if (userPrefs) {
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await apiService.put('/api/user/profile', userProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await apiService.put('/api/user/preferences', preferences);
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropAndSave = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const result = await apiService.uploadFile('/api/user/avatar', file);
      
      if (result.success) {
        setUserProfile(prev => ({ ...prev, avatar: result.avatarUrl }));
        setIsCropModalOpen(false);
        setSelectedImage(null);
        
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback className="text-lg">
                {userProfile.firstName && userProfile.lastName 
                  ? `${userProfile.firstName[0]}${userProfile.lastName[0]}` 
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crop Profile Photo</DialogTitle>
                <DialogDescription>
                  Adjust your photo and click save to update your profile picture.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                {selectedImage && (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="max-w-full max-h-64 rounded-lg"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCropAndSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Photo'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={userProfile.firstName}
                onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                value={userProfile.lastName}
                onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input 
              id="title" 
              value={userProfile.title}
              onChange={(e) => setUserProfile(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell us about yourself..."
              value={userProfile.bio}
              onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Your organization details and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading company information...</div>
            </div>
          ) : companyData ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{companyData.legalName || companyData.dbaName || 'Company Name'}</p>
                    <p className="text-sm text-muted-foreground">Primary Organization</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {companyData.deqNumber ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{companyData.businessId || 'Business ID not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{companyData.deqNumber || 'DEQ Number pending'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{companyData.address ? `${companyData.address}, ${companyData.city}, ${companyData.zipCode}` : 'Address not provided'}</span>
                </div>
                {companyData.description && (
                  <div className="flex items-start space-x-2 md:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-xs">{companyData.description}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No company information found</p>
              <p className="text-xs text-muted-foreground">Complete your company setup to see information here</p>
            </div>
          )}

          <Button variant="outline" onClick={() => window.location.href = '/company-setup'}>
            Edit Company Details
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your platform experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pacific Time (PT)">Pacific Time (PT)</SelectItem>
                <SelectItem value="Mountain Time (MT)">Mountain Time (MT)</SelectItem>
                <SelectItem value="Central Time (CT)">Central Time (CT)</SelectItem>
                <SelectItem value="Eastern Time (ET)">Eastern Time (ET)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English (US)">English (US)</SelectItem>
                <SelectItem value="English (UK)">English (UK)</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSavePreferences} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
