
import { VendorProfile } from '../types/communication';

export class VendorPortalService {
  private vendors: Map<string, VendorProfile> = new Map();

  constructor() {
    this.initializeMockVendors();
  }

  private initializeMockVendors() {
    const mockVendors: VendorProfile[] = [
      {
        id: 'vendor-1',
        companyName: 'EcoPackaging Solutions',
        contactName: 'Jennifer Martinez',
        email: 'jennifer@ecopackaging.com',
        phone: '+1-555-0123',
        website: 'https://ecopackaging.com',
        description: 'Sustainable packaging solutions for modern businesses',
        categories: ['Packaging', 'Sustainable Materials'],
        certifications: ['FSC Certified', 'Recyclable', 'Biodegradable'],
        status: 'active',
        joinedDate: '2024-01-15T10:00:00Z',
        lastActive: new Date().toISOString(),
        rating: 4.8,
        reviewCount: 127
      },
      {
        id: 'vendor-2',
        companyName: 'Green Materials Corp',
        contactName: 'David Kim',
        email: 'david@greenmaterials.com',
        phone: '+1-555-0124',
        website: 'https://greenmaterials.com',
        description: 'Raw materials and components for eco-friendly products',
        categories: ['Raw Materials', 'Components'],
        certifications: ['Bio-based', 'Carbon Neutral', 'ISO 14001'],
        status: 'active',
        joinedDate: '2024-02-01T14:30:00Z',
        lastActive: new Date(Date.now() - 1800000).toISOString(),
        rating: 4.6,
        reviewCount: 89
      }
    ];

    mockVendors.forEach(vendor => {
      this.vendors.set(vendor.id, vendor);
    });
  }

  getVendors(): VendorProfile[] {
    return Array.from(this.vendors.values());
  }

  getVendorById(vendorId: string): VendorProfile | undefined {
    return this.vendors.get(vendorId);
  }

  getVendorsByCategory(category: string): VendorProfile[] {
    return this.getVendors().filter(vendor => 
      vendor.categories.includes(category)
    );
  }

  async inviteVendor(email: string, companyName: string): Promise<boolean> {
    console.log(`Sending invitation to ${email} for ${companyName}`);
    
    // Simulate invitation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Math.random() > 0.1; // 90% success rate
  }

  async updateVendorStatus(vendorId: string, status: VendorProfile['status']): Promise<boolean> {
    const vendor = this.vendors.get(vendorId);
    if (vendor) {
      vendor.status = status;
      return true;
    }
    return false;
  }

  async rateVendor(vendorId: string, rating: number): Promise<boolean> {
    const vendor = this.vendors.get(vendorId);
    if (vendor && rating >= 1 && rating <= 5) {
      // Recalculate average rating
      const totalRating = vendor.rating * vendor.reviewCount + rating;
      vendor.reviewCount += 1;
      vendor.rating = totalRating / vendor.reviewCount;
      return true;
    }
    return false;
  }

  searchVendors(query: string): VendorProfile[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getVendors().filter(vendor =>
      vendor.companyName.toLowerCase().includes(lowercaseQuery) ||
      vendor.contactName.toLowerCase().includes(lowercaseQuery) ||
      vendor.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery)) ||
      vendor.certifications.some(cert => cert.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const vendorPortalService = new VendorPortalService();
