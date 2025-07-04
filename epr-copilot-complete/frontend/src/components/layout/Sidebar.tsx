
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  BarChart,
  Calendar,
  Check,
  ChevronDown,
  Cog,
  Compass,
  CreditCard,
  Gauge,
  Settings,
  Globe,
  HelpCircle,
  Home,
  LineChart,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  Menu,
  Plus,
  PlusCircle,
  Receipt,
  Settings2,
  ShoppingBag,
  Square,
  Type,
  User,
  UserPlus,
  Users,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  LayoutList,
  FileText,
  Database,
  Bell,
  MessageSquare,
  Zap,
  BookOpen,
  Star,
  Shield,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Link } from "react-router-dom";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handlePageChange = (page: string) => {
    onPageChange(page);
    closeMobileMenu();
  };

  const hierarchicalMenu = [
    {
      id: 'catalog-data',
      label: 'Catalog & Data',
      icon: 'database',
      items: [
        { id: 'company', label: 'Company Setup', icon: 'settings' },
        { id: 'product-catalog', label: 'Product Catalog', icon: 'layout-grid' },
        { id: 'materials', label: 'Material Library', icon: 'layout-template' },
        { id: 'bulk-import', label: 'Bulk Import', icon: 'layout-list' }
      ]
    },
    {
      id: 'compliance-fees',
      label: 'Compliance & Fees',
      icon: 'shield',
      items: [
        { id: 'fees', label: 'Fee Management', icon: 'file-text' },
        { id: 'calendar', label: 'Compliance Calendar', icon: 'calendar' },
        { id: 'notifications', label: 'Notifications & Alerts', icon: 'bell' }
      ]
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: 'bar-chart',
      items: [
        { id: 'quarterly-reports', label: 'Reports', icon: 'file-text' },
        { id: 'analytics', label: 'Analytics', icon: 'line-chart' }
      ]
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: 'users',
      items: [
        { id: 'communication', label: 'Communication', icon: 'message-square' },
        { id: 'team', label: 'Team Management', icon: 'users' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: 'help-circle',
      items: [
        { id: 'support-help', label: 'Support & Help', icon: 'help-circle' }
      ]
    },
  ];

  const getIcon = (iconName: string, className: string = "mr-2 h-4 w-4") => {
    switch (iconName) {
      case 'home': return <Home className={className} />;
      case 'layout-dashboard': return <LayoutDashboard className={className} />;
      case 'database': return <Database className={className} />;
      case 'settings': return <Settings className={className} />;
      case 'settings-2': return <Settings2 className={className} />;
      case 'layout-grid': return <LayoutGrid className={className} />;
      case 'layout-template': return <LayoutTemplate className={className} />;
      case 'layout-list': return <LayoutList className={className} />;
      case 'file-text': return <FileText className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'calendar': return <Calendar className={className} />;
      case 'bell': return <Bell className={className} />;
      case 'bar-chart': return <BarChart className={className} />;
      case 'line-chart': return <LineChart className={className} />;
      case 'users': return <Users className={className} />;
      case 'message-square': return <MessageSquare className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'help-circle': return <HelpCircle className={className} />;
      case 'star': return <Star className={className} />;
      case 'book-open': return <BookOpen className={className} />;
      default: return <LayoutDashboard className={className} />;
    }
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-gray-50 md:border-r md:z-50">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-6 bg-white border-b">
          <span className="font-bold text-lg">EPR Compliance</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto" aria-label="Sidebar">
          {/* Home Button - Single clickable button */}
          <Button
            variant={currentPage === 'home' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange('home')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>

          {/* Integration Hub Button - Elevated to top-level */}
          <Button
            variant={currentPage === 'integration-hub' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange('integration-hub')}
          >
            <Zap className="mr-2 h-4 w-4" />
            Integration Hub
          </Button>

          {hierarchicalMenu.map((section) => (
            <div key={section.id} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between group hover:bg-gray-100"
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              >
                <div className="flex items-center">
                  {getIcon(section.icon)}
                  {section.label}
                </div>
                <ChevronDown className={`h-4 w-4 opacity-50 group-hover:opacity-100 transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`} />
              </Button>
              
              {expandedSection === section.id && (
                <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => handlePageChange(item.id)}
                    >
                      {getIcon(item.icon, "mr-2 h-3 w-3")}
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Settings Button - Moved to bottom */}
          <div className="mt-auto pt-2">
            <Button
              variant={currentPage === 'settings' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handlePageChange('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </nav>
        <div className="flex items-center px-6 py-4 bg-white border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt={user?.email || "Avatar"} />
            <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-3.5 justify-start flex-1 w-full">
                <span className="truncate text-sm">{user?.email || "User"}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
