import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupportedJurisdictions } from '../../services/feeCalculation';

interface JurisdictionSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeAll?: boolean;
  className?: string;
}

export function JurisdictionSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select jurisdiction",
  includeAll = false,
  className 
}: JurisdictionSelectorProps) {
  const [jurisdictions, setJurisdictions] = useState<Array<{code: string, name: string, model_type: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJurisdictions = async () => {
      try {
        const supportedJurisdictions = await getSupportedJurisdictions();
        setJurisdictions(supportedJurisdictions);
      } catch (error) {
        console.error('Failed to load jurisdictions:', error);
        setJurisdictions([
          { code: 'OR', name: 'Oregon', model_type: 'PRO-led Fee System' },
          { code: 'CA', name: 'California', model_type: 'PRO-led Fee System' },
          { code: 'CO', name: 'Colorado', model_type: 'Municipal Reimbursement' },
          { code: 'ME', name: 'Maine', model_type: 'Full Municipal Reimbursement' },
          { code: 'MD', name: 'Maryland', model_type: 'Shared Responsibility' },
          { code: 'MN', name: 'Minnesota', model_type: 'Shared Responsibility' },
          { code: 'WA', name: 'Washington', model_type: 'Shared Responsibility' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadJurisdictions();
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">All Jurisdictions</SelectItem>
        )}
        {jurisdictions.map((jurisdiction) => (
          <SelectItem key={jurisdiction.code} value={jurisdiction.code}>
            <div className="flex flex-col">
              <span>{jurisdiction.name}</span>
              <span className="text-xs text-muted-foreground">{jurisdiction.model_type}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
