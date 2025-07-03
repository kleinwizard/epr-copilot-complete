
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';

interface HeaderProps {
  currentPage: string;
  onPageChange?: (page: string) => void;
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleNotificationClick = () => {
    if (onPageChange) {
      onPageChange('notifications');
    } else {
      window.location.href = '/notifications';
    }
  };

  const getPageTitle = (page: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      company: 'Company Setup',
      'product-catalog': 'Product Catalog',
      materials: 'Material Library',
      'bulk-import': 'Bulk Import',
      fees: 'Fee Management',
      'quarterly-reports': 'Quarterly Reports',
      'annual-summary': 'Annual Summary',
      'submission-history': 'Submission History',
      analytics: 'Analytics',
      calendar: 'Compliance Calendar',
      team: 'Team Management',
      settings: 'Settings'
    };
    return titles[page] || 'Oregon EPR Platform';
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">{getPageTitle(currentPage)}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getUserInitials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
