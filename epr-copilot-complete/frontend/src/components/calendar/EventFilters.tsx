
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

interface EventFiltersProps {
  filters: {
    type: string;
    priority: string;
    status: string;
    jurisdiction: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'deadline', label: 'Deadlines' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'submission', label: 'Submissions' },
    { value: 'meeting', label: 'Meetings' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' }
  ];

  const jurisdictionOptions = [
    { value: 'all', label: 'All Jurisdictions' },
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Federal', label: 'Federal' }
  ];

  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {Object.values(filters).filter(f => f !== 'all').length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Event Type</DropdownMenuLabel>
        {typeOptions.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={filters.type === option.value}
            onCheckedChange={() => updateFilter('type', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {priorityOptions.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={filters.priority === option.value}
            onCheckedChange={() => updateFilter('priority', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {statusOptions.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={filters.status === option.value}
            onCheckedChange={() => updateFilter('status', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Jurisdiction</DropdownMenuLabel>
        {jurisdictionOptions.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={filters.jurisdiction === option.value}
            onCheckedChange={() => updateFilter('jurisdiction', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onFiltersChange({
                type: 'all',
                priority: 'all',
                status: 'all',
                jurisdiction: 'all'
              })}
            >
              Clear All Filters
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
