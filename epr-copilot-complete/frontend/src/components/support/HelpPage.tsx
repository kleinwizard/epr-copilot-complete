import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, User, Package, Calculator, Settings, Upload, FileText, DollarSign, BarChart3, Users, Shield, HelpCircle } from 'lucide-react';

export function HelpPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const helpSections = [
    {
      id: 'account',
      title: 'Account & User Management',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      subsections: [
        {
          title: 'Creating Your Account',
          content: 'Sign up with your business email and complete the organization setup wizard. You\'ll need your business registration details and primary contact information.'
        },
        {
          title: 'User Roles and Permissions',
          content: 'Manage team access with three role types: Administrator (full access), Compliance Officer (data entry and reporting), and Analyst (view-only access to reports and analytics).'
        },
        {
          title: 'Organization Settings',
          content: 'Configure your company profile, business locations, operational jurisdictions, and notification preferences. Set up your primary and secondary contacts for regulatory communications.'
        },
        {
          title: 'Multi-Location Management',
          content: 'If your business operates across multiple states, configure location-specific settings for each jurisdiction. Each location can have different compliance requirements and reporting schedules.'
        },
        {
          title: 'Security and Authentication',
          content: 'Enable two-factor authentication, manage API keys, and review login activity. Set up single sign-on (SSO) integration if your organization uses enterprise authentication.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Data Entry',
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      subsections: [
        {
          title: 'Adding Your First Product',
          content: 'Start by entering basic product information: SKU, name, and primary jurisdiction. Then add packaging components one by one, specifying material type, weight, and packaging level (primary, secondary, tertiary).'
        },
        {
          title: 'Packaging Component Details',
          content: 'For each component, specify: material type (using official codes), weight in grams, packaging level, recycled content percentage, and any special flags (beverage container, medical exemption, etc.).'
        },
        {
          title: 'Bulk Data Import via CSV',
          content: 'Use our CSV template to upload hundreds of products at once. Each row represents one packaging component. Download the template from the Import page and follow the formatting guide exactly.'
        },
        {
          title: 'Material Code Reference',
          content: 'Use the built-in material code lookup to find the correct codes for your packaging. Codes vary by jurisdiction (e.g., California CMC codes vs. Oregon material categories).'
        },
        {
          title: 'Product Validation and Errors',
          content: 'The system automatically validates your data entry. Common errors include invalid material codes, missing required fields, and weight inconsistencies. Check the validation panel for detailed error descriptions.'
        },
        {
          title: 'Managing Product Variants',
          content: 'For products with multiple sizes or packaging configurations, create separate entries for each variant. Use consistent naming conventions to group related products.'
        }
      ]
    },
    {
      id: 'fees',
      title: 'Fees & Reports',
      icon: Calculator,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      subsections: [
        {
          title: 'Understanding Fee Calculations',
          content: 'EPR fees are calculated based on packaging weight, material type, and eco-modulation factors. Each jurisdiction has different base rates and adjustment factors for recyclability, recycled content, and design for recycling.'
        },
        {
          title: 'Eco-Modulation Adjustments',
          content: 'Reduce your fees by improving packaging design: increase recycled content, improve recyclability, reduce overall packaging weight, and eliminate problematic materials like PFAS or heavy metals.'
        },
        {
          title: 'Producer Hierarchy and Responsibility',
          content: 'Understand who pays: Brand owners are primarily responsible, followed by importers, then distributors. If you\'re not the brand owner, you may be able to designate responsibility to the actual brand owner.'
        },
        {
          title: 'Quarterly and Annual Reporting',
          content: 'Generate compliance reports for submission to state agencies. Reports include detailed breakdowns by material type, jurisdiction-specific calculations, and supporting documentation.'
        },
        {
          title: 'Payment Processing',
          content: 'Pay EPR fees directly through the platform using secure payment processing. Set up automatic payments for recurring fees and receive payment confirmations for your records.'
        },
        {
          title: 'Audit Trail and Documentation',
          content: 'Maintain complete records of all calculations, data sources, and submissions. Export detailed audit trails for regulatory reviews and internal compliance documentation.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
          <p className="text-muted-foreground">
            Comprehensive guidance for EPR compliance, platform features, and best practices
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-xs text-gray-600">Help Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-xs text-gray-600">Support Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-600">States Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">&lt; 2min</p>
                  <p className="text-xs text-gray-600">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Sections */}
        <div className="space-y-4">
          {helpSections.map((section) => {
            const IconComponent = section.icon;
            const isOpen = openSections[section.id];
            
            return (
              <Card key={section.id}>
                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleSection(section.id)}
                  >
                    <CardHeader className="hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${section.color}`} />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                            <CardDescription>
                              {section.subsections.length} topics available
                            </CardDescription>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {section.subsections.map((subsection, index) => (
                          <div key={index} className="border-l-4 border-gray-200 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {subsection.title}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {subsection.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Additional Resources
            </CardTitle>
            <CardDescription>
              More ways to get help and stay informed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Video Tutorials</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Platform Overview (5 min)</li>
                  <li>• Adding Your First Product (8 min)</li>
                  <li>• Bulk CSV Import (12 min)</li>
                  <li>• Understanding Fee Calculations (15 min)</li>
                  <li>• Generating Compliance Reports (10 min)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Downloadable Guides</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• EPR Compliance Checklist (PDF)</li>
                  <li>• Material Code Reference Sheet (PDF)</li>
                  <li>• CSV Import Template (Excel)</li>
                  <li>• State-by-State Requirements (PDF)</li>
                  <li>• Fee Calculation Worksheet (Excel)</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Download All Guides
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  CSV Template
                </Button>
                <Button variant="outline" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Fee Calculator
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
