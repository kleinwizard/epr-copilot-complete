export interface CompanyData {
  legalName: string;
  dbaName: string;
  businessId: string;
  deqNumber: string;
  address: string;
  city: string;
  zipCode: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  weight: number;
  materials: Array<{
    type: string;
    weight: number;
    recyclable: boolean;
  }>;
  status: string;
  lastUpdated: string;
  eprFee: number;
}

export interface Material {
  id: number;
  name: string;
  category: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  sustainabilityScore: number;
  complianceStatus: string;
  lastUpdated: string;
  description: string;
}

class DataService {
  private storageKey = 'epr_app_data';

  private getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {
      company: null,
      products: [],
      materials: [],
      analytics: {
        complianceScore: 94,
        daysToDeadline: 45,
        totalProducts: 0,
        totalFees: 0
      }
    };
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async getCompanyInfo(): Promise<CompanyData | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getData();
    return data.company;
  }

  async saveCompanyInfo(companyData: CompanyData): Promise<CompanyData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = this.getData();
    data.company = { ...companyData, lastUpdated: new Date().toISOString() };
    this.saveData(data);
    return data.company;
  }

  async getProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getData();
    return data.products;
  }

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = this.getData();
    const newProduct = {
      ...productData,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    } as Product;
    data.products.push(newProduct);
    data.analytics.totalProducts = data.products.length;
    data.analytics.totalFees = data.products.reduce((sum: number, p: Product) => sum + p.eprFee, 0);
    this.saveData(data);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = this.getData();
    const index = data.products.findIndex((p: Product) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    data.products[index] = { 
      ...data.products[index], 
      ...productData, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    };
    data.analytics.totalFees = data.products.reduce((sum: number, p: Product) => sum + p.eprFee, 0);
    this.saveData(data);
    return data.products[index];
  }

  async getMaterials(): Promise<Material[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getData();
    return data.materials;
  }

  async saveMaterial(materialData: Partial<Material>): Promise<Material> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = this.getData();
    const newMaterial = {
      ...materialData,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    } as Material;
    data.materials.push(newMaterial);
    this.saveData(data);
    return newMaterial;
  }

  async updateMaterial(id: number, materialData: Partial<Material>): Promise<Material> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = this.getData();
    const index = data.materials.findIndex((m: Material) => m.id === id);
    if (index === -1) throw new Error('Material not found');
    
    data.materials[index] = { 
      ...data.materials[index], 
      ...materialData, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    };
    this.saveData(data);
    return data.materials[index];
  }

  async getAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getData();
    return {
      ...data.analytics,
      totalProducts: data.products.length,
      totalFees: data.products.reduce((sum: number, p: Product) => sum + p.eprFee, 0)
    };
  }

  async getComplianceDueDates() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: '1',
        title: 'Q1 2024 Report Due',
        date: '2024-04-15',
        type: 'quarterly',
        status: 'upcoming',
        description: 'Quarterly packaging report submission deadline'
      },
      {
        id: '2',
        title: 'Annual Registration Renewal',
        date: '2024-12-31',
        type: 'annual',
        status: 'upcoming',
        description: 'Annual EPR program registration renewal'
      }
    ];
  }

  async uploadDocument(file: File): Promise<{ success: boolean; filename: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      filename: file.name
    };
  }
}

export const dataService = new DataService();
