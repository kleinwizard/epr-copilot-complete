
import { Input } from '@/components/ui/input';

interface CollaborationSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CollaborationSearch({ searchTerm, onSearchChange }: CollaborationSearchProps) {
  return (
    <div className="flex items-center space-x-4">
      <Input
        placeholder="Search reports or collaborators..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
