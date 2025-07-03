
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Search, Mail, Phone, Globe } from 'lucide-react';
import { vendorPortalService } from '@/services/vendorPortalService';
import { VendorProfile } from '@/types/communication';

export const VendorPortal = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    const vendorData = vendorPortalService.getVendors();
    setVendors(vendorData);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = vendorPortalService.searchVendors(searchQuery);
      setVendors(results);
    } else {
      loadVendors();
    }
  };

  const getStatusColor = (status: VendorProfile['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 flex-1 max-w-md">
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={async () => {
          try {
            const companyName = prompt('Enter vendor company name:');
            if (!companyName) return;
            
            const contactName = prompt('Enter contact person name:');
            if (!contactName) return;
            
            const email = prompt('Enter vendor email:');
            if (!email) return;
            
            const success = await vendorPortalService.inviteVendor(email, companyName);
            
            if (success) {
              loadVendors();
              alert('Vendor invitation sent successfully!');
            } else {
              alert('Failed to send vendor invitation. Please try again.');
            }
          } catch (error) {
            console.error('Failed to invite vendor:', error);
            alert('Failed to send vendor invitation. Please try again.');
          }
        }}>Invite Vendor</Button>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {vendor.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{vendor.companyName}</CardTitle>
                    <p className="text-sm text-gray-600">{vendor.contactName}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {vendor.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{vendor.email}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{vendor.phone}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{vendor.website}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {renderStars(vendor.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({vendor.reviewCount})
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>

              {vendor.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {vendor.certifications.slice(0, 3).map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {vendor.certifications.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{vendor.certifications.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
