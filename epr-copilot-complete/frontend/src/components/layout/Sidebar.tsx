
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'company', label: 'Company Setup', icon: 'settings' },
    { id: 'product-catalog', label: 'Product Catalog', icon: 'layout-grid' },
    { id: 'materials', label: 'Material Library', icon: 'layout-template' },
    { id: 'bulk-import', label: 'Bulk Import', icon: 'layout-list' },
    { id: 'fees', label: 'Fee Management', icon: 'file-text' },
    { id: 'quarterly-reports', label: 'Reports', icon: 'file-text' },
    { id: 'analytics', label: 'Analytics', icon: 'layout-dashboard' },
    { id: 'calendar', label: 'Compliance Calendar', icon: 'layout-dashboard' },
    { id: 'notifications', label: 'Notifications', icon: 'layout-dashboard' },
    { id: 'alert-dashboard', label: 'Alert Dashboard', icon: 'layout-dashboard' },
    { id: 'erp-integration', label: 'ERP Integration', icon: 'settings' },
    { id: 'integration-hub', label: 'Integration Hub', icon: 'settings' },
    { id: 'communication', label: 'Communication', icon: 'layout-dashboard' },
    { id: 'mobile-pwa', label: 'Mobile & PWA', icon: 'layout-dashboard' },
    { id: 'ai-automation', label: 'AI & Automation', icon: 'layout-dashboard' },
    { id: 'team', label: 'Team Management', icon: 'settings' },
    { id: 'admin-tools', label: 'Admin Tools', icon: 'settings-2' },
    { id: 'auth', label: 'Authentication', icon: 'settings' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'support-help', label: 'Support & Help', icon: 'help-circle' }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'layout-dashboard': return <LayoutDashboard className="mr-2 h-4 w-4" />;
      case 'settings': return <Settings className="mr-2 h-4 w-4" />;
      case 'settings-2': return <Settings2 className="mr-2 h-4 w-4" />;
      case 'layout-grid': return <LayoutGrid className="mr-2 h-4 w-4" />;
      case 'layout-template': return <LayoutTemplate className="mr-2 h-4 w-4" />;
      case 'layout-list': return <LayoutList className="mr-2 h-4 w-4" />;
      case 'file-text': return <FileText className="mr-2 h-4 w-4" />;
      case 'help-circle': return <HelpCircle className="mr-2 h-4 w-4" />;
      default: return <LayoutDashboard className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-gray-50 md:border-r md:z-50">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-6 bg-white border-b">
          <span className="font-bold text-lg">EPR Compliance</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handlePageChange(item.id)}
            >
              {getIcon(item.icon)}
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center px-6 py-4 mt-auto bg-white border-t">
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
