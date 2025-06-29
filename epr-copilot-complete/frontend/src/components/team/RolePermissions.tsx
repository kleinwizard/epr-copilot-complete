
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Check, 
  X,
  Crown,
  Settings,
  Users,
  Eye
} from 'lucide-react';
import { getAllRolePermissions } from '@/services/teamService';

export function RolePermissions() {
  const rolePermissions = getAllRolePermissions();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'manager': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'user': return <Users className="h-4 w-4 text-green-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'user': return 'bg-green-50 text-green-700 border-green-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const permissionCategories = [
    { key: 'dashboard', label: 'Dashboard', permissions: ['view', 'edit'] },
    { key: 'company', label: 'Company Setup', permissions: ['view', 'edit'] },
    { key: 'products', label: 'Products & Packaging', permissions: ['view', 'edit', 'delete'] },
    { key: 'materials', label: 'Material Library', permissions: ['view', 'edit', 'delete'] },
    { key: 'fees', label: 'Fee Management', permissions: ['view', 'edit'] },
    { key: 'reports', label: 'Reports & Compliance', permissions: ['view', 'edit', 'submit'] },
    { key: 'analytics', label: 'Analytics', permissions: ['view'] },
    { key: 'calendar', label: 'Compliance Calendar', permissions: ['view', 'edit'] },
    { key: 'team', label: 'Team Management', permissions: ['view', 'edit', 'invite', 'remove'] },
    { key: 'settings', label: 'Settings', permissions: ['view', 'edit'] }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>
            Overview of what each role can access and modify in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {permissionCategories.map((category) => (
              <div key={category.key} className="space-y-3">
                <h3 className="font-medium text-lg">{category.label}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Permission</TableHead>
                      {rolePermissions.map((rp) => (
                        <TableHead key={rp.role} className="text-center">
                          <Badge variant="outline" className={getRoleBadgeColor(rp.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(rp.role)}
                              <span className="capitalize">{rp.role}</span>
                            </div>
                          </Badge>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.permissions.map((permission) => (
                      <TableRow key={permission}>
                        <TableCell className="font-medium capitalize">
                          {permission}
                        </TableCell>
                        {rolePermissions.map((rp) => {
                          const hasPermission = (rp.permissions as any)[category.key]?.[permission];
                          return (
                            <TableCell key={rp.role} className="text-center">
                              {hasPermission ? (
                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-red-600 mx-auto" />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
