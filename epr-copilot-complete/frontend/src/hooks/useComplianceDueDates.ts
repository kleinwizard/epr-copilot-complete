import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';

interface DueDate {
  id: string;
  title: string;
  date: string;
  type: 'quarterly' | 'annual' | 'monthly';
  status: 'upcoming' | 'overdue' | 'completed';
  description: string;
}

export function useComplianceDueDates() {
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDueDates();
  }, []);

  const loadDueDates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getComplianceDueDates();
      setDueDates(data || []);
    } catch (err) {
      setError('Failed to load compliance due dates');
      console.error('Failed to load due dates:', err);
      
      const fallbackDates: DueDate[] = [
        {
          id: '1',
          title: 'Q1 2024 Report Due',
          date: '2024-04-15',
          type: 'quarterly',
          status: 'upcoming',
          description: 'Quarterly packaging report submission deadline'
        },
        {
          id: '2',
          title: 'Annual Registration Renewal',
          date: '2024-12-31',
          type: 'annual',
          status: 'upcoming',
          description: 'Annual EPR program registration renewal'
        }
      ];
      setDueDates(fallbackDates);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDueDates = () => {
    loadDueDates();
  };

  return {
    dueDates,
    isLoading,
    error,
    refreshDueDates
  };
}
