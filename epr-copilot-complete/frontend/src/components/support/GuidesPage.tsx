import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  FileText, 
  Calendar, 
  DollarSign,
  Upload,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Building,
  Package,
  Scale,
  Clock
} from 'lucide-react';

export function GuidesPage() {
  const [openGuides, setOpenGuides] = useState<Record<string, boolean>>({});

  const toggleGuide = (guideId: string) => {
    setOpenGuides(prev => ({
      ...prev,
      [guideId]: !prev[guideId]
    }));
  };

  const guides = [
    {
      id: 'qualify',
      title: 'Do I Qualify for EPR Requirements?',
      description: 'Determine if your business needs to comply with Extended Producer Responsibility regulations',
      icon: Building,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      duration: '10 min read',
      difficulty: 'Beginner',
      content: {
        introduction: 'Extended Producer Responsibility (EPR) laws require certain businesses to take financial and operational responsibility for the end-of-life management of their packaging. This guide helps you determine if your business qualifies.',
        sections: [
          {
            title: 'Revenue Thresholds by State',
            content: 'Each state has different revenue requirements that trigger EPR obligations:',
            table: [
              { state: 'California', threshold: '$1 million', scope: 'Gross revenue from sales of covered products in California' },
              { state: 'Oregon', threshold: '$1 million', scope: 'Gross revenue from sales of covered products in Oregon' },
              { state: 'Maine', threshold: '$5 million', scope: 'Gross revenue from sales of covered products in Maine' },
              { state: 'Colorado', threshold: '$300,000', scope: 'Gross revenue from sales of covered products in Colorado' },
              { state: 'Maryland', threshold: '$1 million', scope: 'Gross revenue from sales of covered products in Maryland' }
            ]
          },
          {
            title: 'Tonnage Thresholds',
            content: 'In addition to revenue, some states have minimum tonnage requirements:',
            list: [
              'California: 1 ton of packaging materials annually',
              'Oregon: 1 ton of packaging materials annually', 
              'Maine: 5 tons of packaging materials annually',
              'Colorado: No tonnage threshold (revenue only)',
              'Maryland: 1 ton of packaging materials annually'
            ]
          },
          {
            title: 'Entity Types Subject to EPR',
            content: 'The following business types may be subject to EPR requirements:',
            list: [
              'Brand owners (companies that own or license the brand under which products are sold)',
              'Importers (first entities to bring packaged products into the state)',
              'Distributors (in some cases, when brand owner cannot be identified)',
              'Online marketplaces (for products sold through their platforms)'
            ]
          },
          {
            title: 'Common Exemptions',
            content: 'Certain products and packaging types may be exempt:',
            list: [
              'Beverage containers covered by bottle bills',
              'Medical devices and pharmaceutical packaging',
              'Packaging for hazardous materials (FIFRA-regulated)',
              'Packaging for products sold exclusively to other businesses (B2B)',
              'Reusable packaging that consumers return to the producer'
            ]
          }
        ],
        actionItems: [
          'Calculate your annual revenue from covered product sales in each state',
          'Estimate your annual packaging tonnage by material type',
          'Identify your role in the supply chain (brand owner, importer, distributor)',
          'Check for applicable exemptions',
          'Consult with legal counsel if your qualification status is unclear'
        ]
      }
    },
    {
      id: 'calendar',
      title: 'The EPR Compliance Calendar: Your Year-Round Action Plan',
      description: 'Stay on top of all EPR deadlines and requirements with this comprehensive compliance calendar',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      duration: '15 min read',
      difficulty: 'Intermediate',
      content: {
        introduction: 'EPR compliance involves multiple deadlines throughout the year. This calendar helps you plan ahead and never miss a critical deadline.',
        sections: [
          {
            title: 'Q1 (January - March)',
            content: 'First quarter activities and deadlines:',
            list: [
              'January 31: California annual report due (for previous year)',
              'February 15: Oregon quarterly report due (Q4 of previous year)',
              'March 1: Maine annual registration renewal',
              'March 15: Colorado quarterly report due (Q4 of previous year)',
              'March 31: Maryland annual report due (for previous year)'
            ]
          },
          {
            title: 'Q2 (April - June)',
            content: 'Second quarter activities and deadlines:',
            list: [
              'April 15: Oregon quarterly report due (Q1)',
              'May 15: Colorado quarterly report due (Q1)',
              'June 1: California mid-year data validation',
              'June 30: Maine semi-annual report due'
            ]
          },
          {
            title: 'Q3 (July - September)',
            content: 'Third quarter activities and deadlines:',
            list: [
              'July 15: Oregon quarterly report due (Q2)',
              'August 15: Colorado quarterly report due (Q2)',
              'September 1: Begin preparing annual reports',
              'September 30: California fee payment due (if applicable)'
            ]
          },
          {
            title: 'Q4 (October - December)',
            content: 'Fourth quarter activities and deadlines:',
            list: [
              'October 15: Oregon quarterly report due (Q3)',
              'November 15: Colorado quarterly report due (Q3)',
              'December 1: Begin annual data collection for next year\'s reports',
              'December 31: Maine annual fee payment due'
            ]
          },
          {
            title: 'Year-Round Best Practices',
            content: 'Maintain compliance throughout the year:',
            list: [
              'Monthly: Update product and packaging data',
              'Quarterly: Review and validate data accuracy',
              'Semi-annually: Conduct internal compliance audits',
              'Annually: Review and update compliance procedures',
              'As needed: Monitor regulatory changes and updates'
            ]
          }
        ],
        actionItems: [
          'Set up calendar reminders for all applicable deadlines',
          'Establish monthly data collection procedures',
          'Create quarterly review processes',
          'Designate backup personnel for critical deadlines',
          'Subscribe to regulatory update notifications'
        ]
      }
    },
    {
      id: 'ecomodulation',
      title: 'Decoding Eco-Modulation: How to Lower Your EPR Fees',
      description: 'Learn how to reduce your EPR fees through strategic packaging design and material choices',
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      duration: '20 min read',
      difficulty: 'Advanced',
      content: {
        introduction: 'Eco-modulation allows producers to reduce their EPR fees by making environmentally beneficial packaging choices. Understanding these mechanisms can significantly impact your compliance costs.',
        sections: [
          {
            title: 'Recyclability Bonuses',
            content: 'Packaging that is widely recyclable receives fee reductions:',
            table: [
              { criteria: 'Widely Recyclable', discount: '10-25%', description: 'Materials accepted by 75%+ of recycling programs' },
              { criteria: 'Moderately Recyclable', discount: '5-15%', description: 'Materials accepted by 50-74% of recycling programs' },
              { criteria: 'Limited Recyclability', discount: '0%', description: 'Materials accepted by &lt;50% of recycling programs' },
              { criteria: 'Non-Recyclable', discount: 'Penalty +25%', description: 'Materials not accepted by recycling programs' }
            ]
          },
          {
            title: 'Recycled Content Incentives',
            content: 'Using post-consumer recycled (PCR) content reduces fees:',
            table: [
              { pcrContent: '0-9%', discount: '0%', notes: 'Baseline rate' },
              { pcrContent: '10-24%', discount: '5-10%', notes: 'Minimum PCR threshold' },
              { pcrContent: '25-49%', discount: '15-20%', notes: 'Moderate PCR content' },
              { pcrContent: '50-74%', discount: '25-30%', notes: 'High PCR content' },
              { pcrContent: '75%+', discount: '35-40%', notes: 'Maximum PCR discount' }
            ]
          },
          {
            title: 'Design for Recycling',
            content: 'Packaging design features that improve recyclability:',
            list: [
              'Mono-material construction (single material type)',
              'Compatible adhesives and inks',
              'Removable labels and sleeves',
              'Minimal use of barrier coatings',
              'Standardized material identification'
            ]
          },
          {
            title: 'Problematic Materials (Penalties)',
            content: 'Materials that increase fees due to environmental concerns:',
            list: [
              'PFAS (per- and polyfluoroalkyl substances)',
              'Heavy metals (lead, mercury, cadmium, hexavalent chromium)',
              'Oxo-degradable plastics',
              'PVC in flexible applications',
              'Polystyrene foam'
            ]
          },
          {
            title: 'State-Specific Considerations',
            content: 'Each state has unique eco-modulation factors:',
            list: [
              'California: CMC (Circular Material Categories) with detailed recyclability assessments',
              'Oregon: LCA (Life Cycle Assessment) bonus tiers for comprehensive environmental impact',
              'Maine: Toxicity flags for PFAS and other harmful substances',
              'Colorado: Focus on recyclability and recycled content',
              'Maryland: Emphasis on design for recycling principles'
            ]
          }
        ],
        actionItems: [
          'Audit current packaging for recyclability improvements',
          'Increase post-consumer recycled content where feasible',
          'Eliminate problematic materials and additives',
          'Design for disassembly and material separation',
          'Work with suppliers to improve material specifications'
        ]
      }
    },
    {
      id: 'dataimport',
      title: 'Mastering Data Import: The Complete CSV Formatting Guide',
      description: 'Learn the exact CSV format requirements for bulk data upload and avoid common import errors',
      icon: Upload,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      duration: '25 min read',
      difficulty: 'Intermediate',
      content: {
        introduction: 'For bulk data upload, your CSV must be structured so that each row represents a single packaging component. This guide provides the complete formatting requirements.',
        sections: [
          {
            title: 'Required CSV Headers',
            content: 'Your CSV file must include these exact column headers:',
            table: [
              { header: 'product_sku', description: 'Unique product identifier', format: 'Text', example: 'CHOC-BAR-45' },
              { header: 'product_name', description: 'Consumer-facing name', format: 'Text', example: 'Gourmet Chocolate Bar' },
              { header: 'jurisdiction_code', description: '2-letter state code', format: 'Text', example: 'CA' },
              { header: 'units_sold', description: 'Total units sold', format: 'Integer', example: '50000' },
              { header: 'component_name', description: 'Name for this part', format: 'Text', example: 'Paper Wrapper' },
              { header: 'component_material_code', description: 'Official material code', format: 'Text', example: '22_P1N' },
              { header: 'component_weight_grams', description: 'Weight in grams', format: 'Decimal', example: '2.5' },
              { header: 'packaging_level', description: 'Packaging type', format: 'PRIMARY, SECONDARY, ...', example: 'PRIMARY' },
              { header: 'pcr_content_percent', description: 'PCR content %', format: 'Integer (0-100)', example: '80' }
            ]
          },
          {
            title: 'Optional State-Specific Headers',
            content: 'Include these headers when applicable:',
            table: [
              { header: 'designated_producer_id_override', description: '(Optional) ID of another responsible producer', format: 'UUID Text', example: '' },
              { header: 'ca_plastic_component_flag', description: '(CA) Non-plastic item has plastic part', format: 'TRUE / FALSE', example: 'FALSE' },
              { header: 'me_toxicity_flag', description: '(ME) Component contains PFAS, etc.', format: 'TRUE / FALSE', example: 'FALSE' },
              { header: 'or_lca_bonus_tier', description: '(OR) LCA bonus claimed', format: 'NONE, A, B, C', example: 'NONE' },
              { header: 'is_beverage_container_exempt', description: 'Part of a bottle bill program', format: 'TRUE / FALSE', example: 'FALSE' },
              { header: 'is_medical_exempt', description: 'Medical/pharma packaging', format: 'TRUE / FALSE', example: 'FALSE' },
              { header: 'is_fifra_exempt', description: 'Hazardous material packaging', format: 'TRUE / FALSE', example: 'FALSE' }
            ]
          },
          {
            title: 'Data Validation Rules',
            content: 'Ensure your data meets these requirements:',
            list: [
              'All required fields must have values (no empty cells)',
              'Material codes must match official jurisdiction codes',
              'Weight values must be positive numbers',
              'Percentage values must be between 0 and 100',
              'Boolean fields must be exactly "TRUE" or "FALSE"',
              'Jurisdiction codes must be valid 2-letter state abbreviations'
            ]
          },
          {
            title: 'Common Import Errors',
            content: 'Avoid these frequent mistakes:',
            list: [
              'Using commas in numeric fields (use periods for decimals)',
              'Including units in weight fields (grams only, no "g" suffix)',
              'Mixing case in boolean fields (use all caps: TRUE/FALSE)',
              'Using invalid material codes (check jurisdiction-specific lists)',
              'Missing required headers or misspelled column names',
              'Including extra spaces before or after values'
            ]
          },
          {
            title: 'File Preparation Tips',
            content: 'Best practices for CSV preparation:',
            list: [
              'Save as CSV UTF-8 format to preserve special characters',
              'Use Excel or Google Sheets for initial data preparation',
              'Test with a small sample file first (10-20 rows)',
              'Keep a backup of your original data',
              'Validate material codes before import',
              'Review the import preview before final submission'
            ]
          }
        ],
        actionItems: [
          'Download the official CSV template from the platform',
          'Prepare a test file with 10-20 sample products',
          'Validate all material codes against jurisdiction lists',
          'Test the import process with your sample file',
          'Create a standardized process for ongoing data updates'
        ]
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Guides & Tutorials</h2>
          <p className="text-muted-foreground">
            Comprehensive guides to help you master EPR compliance and get the most out of our platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-gray-600">Essential Guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">70min</p>
                  <p className="text-xs text-gray-600">Total Reading Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-600">States Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-gray-600">Compliance Coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guides */}
        <div className="space-y-4">
          {guides.map((guide) => {
            const IconComponent = guide.icon;
            const isOpen = openGuides[guide.id];
            
            return (
              <Card key={guide.id}>
                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleGuide(guide.id)}
                  >
                    <CardHeader className="hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg ${guide.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`h-6 w-6 ${guide.color}`} />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-xl">{guide.title}</CardTitle>
                            <CardDescription className="text-left">
                              {guide.description}
                            </CardDescription>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{guide.duration}</Badge>
                              <Badge variant="outline">{guide.difficulty}</Badge>
                            </div>
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
                      <div className="space-y-6">
                        <p className="text-gray-700 leading-relaxed">
                          {guide.content.introduction}
                        </p>
                        
                        {guide.content.sections.map((section, index) => (
                          <div key={index} className="space-y-3">
                            <h4 className="font-semibold text-lg text-gray-900">
                              {section.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {section.content}
                            </p>
                            
                            {section.table && (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      {Object.keys(section.table[0]).map((header) => (
                                        <th key={header} className="border border-gray-300 px-3 py-2 text-left font-semibold capitalize">
                                          {header.replace(/([A-Z])/g, ' $1').trim()}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.table.map((row, rowIndex) => (
                                      <tr key={rowIndex} className="hover:bg-gray-50">
                                        {Object.values(row).map((cell, cellIndex) => (
                                          <td key={cellIndex} className="border border-gray-300 px-3 py-2" dangerouslySetInnerHTML={{ __html: cell as string }} />
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            
                            {section.list && (
                              <ul className="space-y-2">
                                {section.list.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start space-x-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span className="text-gray-600 text-sm">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3">Action Items</h5>
                          <ul className="space-y-2">
                            {guide.content.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Quick Start Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Checklist</CardTitle>
            <CardDescription>
              Follow this checklist to get up and running quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Read 'Do I Qualify for EPR Requirements?' to determine your obligations",
                "Set up your compliance calendar using our year-round action plan",
                "Review eco-modulation opportunities to reduce your fees",
                "Download and prepare your CSV import template",
                "Complete your first product data import",
                "Generate your first compliance report"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{item}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Start with Guide 1: Do I Qualify?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
