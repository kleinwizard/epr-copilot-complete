import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  Clock, 
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function GuidesPage() {
  const appGuides = [
    {
      id: 1,
      title: "Understanding the App's Workflow",
      description: "Welcome to the EPR Compliance Hub! Here's how to get started and make the most of the platform.",
      type: "guide",
      duration: "10 min read",
      difficulty: "Beginner",
      topics: ["Setup", "Workflow", "Getting Started"],
      content: `1. **Setup Your Company:** Begin by adding your company profile(s) and any additional business entities under Company Setup.
2. **Build Your Catalogs:** Use the "Material Catalog" and "Product Catalog" to input all your packaging materials and the products they are part of. You can do this one-by-one or use the "Bulk Import" feature for speed.
3. **Add Sales Data:** Link sales data (units sold per jurisdiction) to your products. This is crucial for calculating your obligations.
4. **Analyze Your Data:** Head to the "Analytics" page to see a visual dashboard of your total fees, material usage, and potential cost savings.
5. **Generate Reports:** Use the "Reports" section to create and export official compliance reports required by state and provincial governments.
6. **Manage Your Team:** In "Settings," you can invite team members and manage your API keys for integrations.`
    },
    {
      id: 2,
      title: "Understanding Analytics",
      description: "The Analytics dashboard is your command center for insights.",
      type: "guide",
      duration: "15 min read",
      difficulty: "Beginner",
      topics: ["Analytics", "Dashboard", "Insights"],
      content: `* **Total EPR Obligation:** This is your total calculated fee liability across all jurisdictions for the selected time period.
* **Fee by Material/Product:** These charts break down your costs so you can see which materials or products are the most expensive from a compliance perspective.
* **Cost Optimization Opportunities:** This powerful tool (see separate guide) shows you how making small changes to your packaging can result in significant savings.
* **Trend Lines:** Graphs are greyed out until you have at least 3 months of data. Once active, they show your progress over time on key metrics like cost and recycled content usage.`
    },
    {
      id: 3,
      title: "How to Create a Report",
      description: "Step-by-step guide to generating compliance reports",
      type: "tutorial",
      duration: "12 min read",
      difficulty: "Beginner",
      topics: ["Reports", "Compliance", "Export"],
      content: `1. Navigate to "Reports" from the main menu.
2. Click "New Report" and select the type of report you need (e.g., Compliance Report for California).
3. Choose the reporting period.
4. The system will generate the report using your catalog and sales data.
5. You can view the report in the app or use the "Export Center" to download it as a PDF or CSV for submission.`
    }
  ];

  const eprGuides = [
    {
      id: 4,
      title: "Do You Qualify for EPR? A Quick Checklist",
      description: "EPR laws typically apply to 'producers' (brand owners, first importers) who sell packaged goods into a jurisdiction.",
      type: "guide",
      duration: "8 min read",
      difficulty: "Beginner",
      topics: ["EPR Basics", "Qualification", "Compliance"],
      content: `Check if you meet the criteria:
* **Do you sell into EPR-regulated states/provinces?** (e.g., California, Oregon, Maine, Colorado, Maryland in the US).
* **Does your company exceed the revenue threshold?** Most laws have a *de minimis* revenue threshold (e.g., over $1 million in annual gross revenue).
* **Do you exceed the material threshold?** Some laws also have a minimum amount of packaging you must place on the market (e.g., over 1 ton annually).
*If you answered YES to all three for a specific jurisdiction, you are likely obligated to comply with its EPR laws.*`
    },
    {
      id: 5,
      title: "What is Extended Producer Responsibility (EPR)?",
      description: "EPR is an environmental policy approach in which a producer's responsibility for a product is extended to the post-consumer stage.",
      type: "guide",
      duration: "12 min read",
      difficulty: "Beginner",
      topics: ["EPR Definition", "Policy", "Environment"],
      content: `For packaging, this means that the companies who produce and sell packaged goods are financially responsible for the recycling and end-of-life management of that packaging. The fees they pay are used to fund municipal recycling systems, improve infrastructure, and educate consumers.`
    },
    {
      id: 6,
      title: "Recent Law Changes",
      description: "The EPR landscape is constantly evolving. Several new US states are considering packaging EPR legislation.",
      type: "guide",
      duration: "10 min read",
      difficulty: "Intermediate",
      topics: ["Law Updates", "Legislation", "Trends"],
      content: `*(Last Updated: July 2025)*
Key trends in new laws include a greater emphasis on eco-modulation (fees adjusted based on environmental impact), specific targets for recycled content, and the inclusion of "hard-to-recycle" materials. Check with your Producer Responsibility Organization (PRO) for the latest updates.`
    },
    {
      id: 7,
      title: "How Eco-Modulation Affects Your Fees",
      description: "Eco-modulation is a core principle of modern EPR. It means your fees are not static; they are adjusted up or down based on the environmental characteristics of your packaging.",
      type: "guide",
      duration: "15 min read",
      difficulty: "Intermediate",
      topics: ["Eco-Modulation", "Fees", "Environmental Impact"],
      content: `* **Factors that INCREASE fees (Penalties):** Using hard-to-recycle materials (like PVC), unnecessary plastic components, or problematic inks and labels.
* **Factors that DECREASE fees (Credits):** Using high percentages of post-consumer recycled (PCR) content, designing for easy recyclability, or lightweighting your packaging.
Our Cost Optimization tool is designed to help you leverage eco-modulation to your advantage.`
    }
  ];

  const guides = [...appGuides, ...eprGuides];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'tutorial': return <Video className="h-4 w-4" />;
      case 'technical': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Guides & Tutorials</h2>
        <p className="text-muted-foreground">
          Comprehensive guides to help you master EPR compliance and get the most out of our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-blue-600 mb-1">25+</div>
            <p className="text-sm text-muted-foreground">Comprehensive Guides</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-600 mb-1">15+</div>
            <p className="text-sm text-muted-foreground">Video Tutorials</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-purple-600 mb-1">10k+</div>
            <p className="text-sm text-muted-foreground">Users Helped</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(guide.type)}
                  <Badge variant="outline" className="capitalize">
                    {guide.type}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(guide.difficulty)}
                >
                  {guide.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{guide.duration}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {guide.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Guide
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              "Complete your company profile setup",
              "Import or add your first products",
              "Configure material classifications",
              "Set up compliance calendar events",
              "Run your first fee calculation",
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
              Start Quick Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
