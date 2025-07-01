import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Compliance Manager",
      company: "GreenTech Solutions",
      rating: 5,
      content: "This EPR compliance platform has transformed how we manage our environmental responsibilities. The automated calculations and reporting features have saved us countless hours.",
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Sustainability Director",
      company: "EcoPackaging Inc.",
      rating: 5,
      content: "The material library and fee management tools are incredibly comprehensive. We've reduced our compliance costs by 30% since switching to this platform.",
      avatar: "MC"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Environmental Coordinator",
      company: "FreshFoods Corp",
      rating: 4,
      content: "Great platform with excellent customer support. The compliance calendar helps us stay on top of all our deadlines across multiple jurisdictions.",
      avatar: "ER"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Testimonials</h2>
        <p className="text-muted-foreground">
          See what our customers are saying about their EPR compliance experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <p className="text-sm text-muted-foreground">Support Available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      Verified Customer
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-gray-200" />
                <p className="text-sm leading-relaxed pl-6">
                  {testimonial.content}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Want to share your experience?</CardTitle>
          <CardDescription>
            We'd love to hear about your EPR compliance journey with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your feedback helps us improve and helps other businesses make informed decisions.
            </p>
            <div className="space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                📧 testimonials@epr-compliance.com
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                📞 +1 (555) 123-4567
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
