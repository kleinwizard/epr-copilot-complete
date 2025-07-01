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
  const guides = [
    {
      id: 1,
      title: "Getting Started with EPR Compliance",
      description: "A comprehensive introduction to Extended Producer Responsibility and how to get started",
      type: "guide",
      duration: "15 min read",
      difficulty: "Beginner",
      topics: ["EPR Basics", "Setup", "First Steps"]
    },
    {
      id: 2,
      title: "Setting Up Your Product Catalog",
      description: "Learn how to properly categorize and manage your products for compliance reporting",
      type: "tutorial",
      duration: "20 min read",
      difficulty: "Beginner",
      topics: ["Product Management", "Categorization", "Data Entry"]
    },
    {
      id: 3,
      title: "Advanced Fee Calculations",
      description: "Master complex fee calculations including volume discounts and multi-jurisdiction scenarios",
      type: "guide",
      duration: "30 min read",
      difficulty: "Advanced",
      topics: ["Fee Management", "Calculations", "Optimization"]
    },
    {
      id: 4,
      title: "Bulk Import Best Practices",
      description: "Efficiently import large datasets while maintaining data quality and compliance",
      type: "tutorial",
      duration: "25 min read",
      difficulty: "Intermediate",
      topics: ["Data Import", "File Formats", "Validation"]
    },
    {
      id: 5,
      title: "Compliance Reporting Workflows",
      description: "Streamline your reporting process with automated workflows and templates",
      type: "guide",
      duration: "35 min read",
      difficulty: "Intermediate",
      topics: ["Reporting", "Automation", "Templates"]
    },
    {
      id: 6,
      title: "API Integration Guide",
      description: "Connect your existing systems with our platform using our comprehensive API",
      type: "technical",
      duration: "45 min read",
      difficulty: "Advanced",
      topics: ["API", "Integration", "Development"]
    }
  ];

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
