
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Phone, Mail, BookOpen, Users, MessageCircle } from 'lucide-react';

export const SupportHelpSystem = () => {
  const [openSections, setOpenSections] = useState({
    contact: false,
    guides: false,
    testimonials: false,
    qa: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support & Help System</h1>
          <p className="text-gray-600 mt-2">Get help, learn new features, and access support resources</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contact Support Section */}
        <Card>
          <Collapsible open={openSections.contact} onOpenChange={() => toggleSection('contact')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-blue-600" />
                    Contact Support
                  </div>
                  {openSections.contact ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-gray-800 font-medium">For immediate support, please contact:</p>
                      <p className="text-gray-700 mt-2">
                        <strong>Email:</strong> support@eprcompliancehub.com
                      </p>
                      <p className="text-gray-700">
                        <strong>Phone:</strong> +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Guides Section */}
        <Card>
          <Collapsible open={openSections.guides} onOpenChange={() => toggleSection('guides')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-green-600" />
                    Guides
                  </div>
                  {openSections.guides ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* EPR Guides */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-700">EPR Guides</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: Do You Qualify for EPR? A Quick Checklist</h4>
                        <p className="text-sm text-gray-700 mb-2">EPR laws typically apply to "producers" (brand owners, first importers) who sell packaged goods into a jurisdiction. Check if you meet the criteria:</p>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Do you sell into EPR-regulated states/provinces? (e.g., California, Oregon, Maine, Colorado, Maryland in the US).</li>
                          <li>• Does your company exceed the revenue threshold? Most laws have a de minimis revenue threshold (e.g., over $1 million in annual gross revenue).</li>
                          <li>• Do you exceed the material threshold? Some laws also have a minimum amount of packaging you must place on the market (e.g., over 1 ton annually).</li>
                        </ul>
                        <p className="text-sm text-gray-700 mt-2">If you answered YES to all three for a specific jurisdiction, you are likely obligated to comply with its EPR laws.</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: What is Extended Producer Responsibility (EPR)?</h4>
                        <p className="text-sm text-gray-700">EPR is an environmental policy approach in which a producer's responsibility for a product is extended to the post-consumer stage of a product's life cycle. For packaging, this means that the companies who produce and sell packaged goods are financially responsible for the recycling and end-of-life management of that packaging. The fees they pay are used to fund municipal recycling systems, improve infrastructure, and educate consumers.</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: Recent Law Changes</h4>
                        <p className="text-sm text-gray-700 mb-2">(Last Updated: July 2025)</p>
                        <p className="text-sm text-gray-700">The EPR landscape is constantly evolving. Several new US states are considering packaging EPR legislation. Key trends in new laws include a greater emphasis on eco-modulation (fees adjusted based on environmental impact), specific targets for recycled content, and the inclusion of "hard-to-recycle" materials. Check with your Producer Responsibility Organization (PRO) for the latest updates.</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: How Eco-Modulation Affects Your Fees</h4>
                        <p className="text-sm text-gray-700 mb-2">Eco-modulation is a core principle of modern EPR. It means your fees are not static; they are adjusted up or down based on the environmental characteristics of your packaging.</p>
                        <p className="text-sm text-gray-700 mb-1"><strong>Factors that INCREASE fees (Penalties):</strong> Using hard-to-recycle materials (like PVC), unnecessary plastic components, or problematic inks and labels.</p>
                        <p className="text-sm text-gray-700 mb-1"><strong>Factors that DECREASE fees (Credits):</strong> Using high percentages of post-consumer recycled (PCR) content, designing for easy recyclability, or lightweighting your packaging.</p>
                        <p className="text-sm text-gray-700">Our Cost Optimization tool is designed to help you leverage eco-modulation to your advantage.</p>
                      </div>
                    </div>
                  </div>

                  {/* App Guides */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-700">App Guides</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: Understanding the App's Workflow</h4>
                        <p className="text-sm text-gray-700 mb-2">Welcome to the EPR Compliance Hub! Here's how to get started and make the most of the platform.</p>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• <strong>Setup Your Company:</strong> Begin by adding your company profile(s) and any additional business entities under Company Setup.</li>
                          <li>• <strong>Build Your Catalogs:</strong> Use the "Material Catalog" and "Product Catalog" to input all your packaging materials and the products they are part of. You can do this one-by-one or use the "Bulk Import" feature for speed.</li>
                          <li>• <strong>Add Sales Data:</strong> Link sales data (units sold per jurisdiction) to your products. This is crucial for calculating your obligations.</li>
                          <li>• <strong>Analyze Your Data:</strong> Head to the "Analytics" page to see a visual dashboard of your total fees, material usage, and potential cost savings.</li>
                          <li>• <strong>Generate Reports:</strong> Use the "Reports" section to create and export official compliance reports required by state and provincial governments.</li>
                          <li>• <strong>Manage Your Team:</strong> In "Settings," you can invite team members and manage your API keys for integrations.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: Understanding Analytics</h4>
                        <p className="text-sm text-gray-700 mb-2">The Analytics dashboard is your command center for insights.</p>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• <strong>Total EPR Obligation:</strong> This is your total calculated fee liability across all jurisdictions for the selected time period.</li>
                          <li>• <strong>Fee by Material/Product:</strong> These charts break down your costs so you can see which materials or products are the most expensive from a compliance perspective.</li>
                          <li>• <strong>Cost Optimization Opportunities:</strong> This powerful tool (see separate guide) shows you how making small changes to your packaging can result in significant savings.</li>
                          <li>• <strong>Trend Lines:</strong> Graphs are greyed out until you have at least 3 months of data. Once active, they show your progress over time on key metrics like cost and recycled content usage.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Guide: How to Create a Report</h4>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Navigate to "Reports" from the main menu.</li>
                          <li>• Click "New Report" and select the type of report you need (e.g., Compliance Report for California).</li>
                          <li>• Choose the reporting period.</li>
                          <li>• The system will generate the report using your catalog and sales data.</li>
                          <li>• You can view the report in the app or use the "Export Center" to download it as a PDF or CSV for submission.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Testimonials Section */}
        <Card>
          <Collapsible open={openSections.testimonials} onOpenChange={() => toggleSection('testimonials')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-purple-600" />
                    Testimonials
                  </div>
                  {openSections.testimonials ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Customer testimonials will be displayed here.</p>
                  <p className="text-sm">Check back soon for user feedback and success stories.</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Q&A Section */}
        <Card>
          <Collapsible open={openSections.qa} onOpenChange={() => toggleSection('qa')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-3 text-orange-600" />
                    Q&A
                  </div>
                  {openSections.qa ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-orange-700">Questions & Answers</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Application Support</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: How do I fix a CSV import error?</p>
                            <p className="text-sm text-gray-700">A: Most errors are caused by incorrect column headers or formatting. Please review our CSV formatting guide in the "Guides" section and ensure your file matches it exactly. Common issues include missing product_id or using text in a numbers-only field like component_weight_grams.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: Can I invite a user with read-only access?</p>
                            <p className="text-sm text-gray-700">A: Yes. When you invite a team member from Settings → Team Management, you will be able to assign them a role. Choose the "Viewer" role to grant them read-only access to your company's data.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: Where do I find my API Key?</p>
                            <p className="text-sm text-gray-700">A: Navigate to Settings → API & Integrations. If you haven't created a key yet, you can generate a new one there. For security, we only show the key once upon creation. Be sure to copy it and store it in a safe place.</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">EPR Compliance</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: What is a Producer Responsibility Organization (PRO)?</p>
                            <p className="text-sm text-gray-700">A: A PRO is an organization that producers contract with to manage their EPR compliance obligations in a specific jurisdiction. They handle fee collection, reporting to the state, and managing recycling programs on behalf of their member companies. This platform helps you gather the data your PRO requires.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: Is a shipping box I use for e-commerce considered packaging?</p>
                            <p className="text-sm text-gray-700">A: Yes, in most jurisdictions, tertiary packaging like shipping boxes is covered under EPR legislation and must be reported.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Q: What's the difference between SB 54 (California) and LD 1541 (Maine)?</p>
                            <p className="text-sm text-gray-700">A: While both are EPR laws, they have different structures. California's law is managed by a single PRO which sets and collects fees. Maine's law is a municipal reimbursement model, where the state determines costs and producers reimburse municipalities for their recycling programs. Our platform is designed to handle the reporting requirements for both models.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};
