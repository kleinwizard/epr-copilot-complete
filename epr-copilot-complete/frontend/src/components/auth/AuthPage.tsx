
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-xl">EPR Compliance Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
