
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ImportPreviewProps {
  data: any[];
  type: 'products' | 'materials';
}

export function ImportPreview({ data, type }: ImportPreviewProps) {
  const validateRow = (row: any) => {
    if (type === 'products') {
      return row.name && row.sku && row.category && row.weight > 0;
    } else {
      return row.name && row.category && row.type;
    }
  };

  const getColumns = () => {
    if (type === 'products') {
      return ['name', 'sku', 'category', 'weight', 'description'];
    } else {
      return ['name', 'category', 'type', 'recyclable', 'eprRate'];
    }
  };

  const columns = getColumns();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 w-8">#</th>
                {columns.map(col => (
                  <th key={col} className="text-left p-2 capitalize">{col}</th>
                ))}
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, index) => {
                const isValid = validateRow(row);
                return (
                  <tr key={index} className="border-b">
                    <td className="p-2 text-gray-500">{index + 1}</td>
                    {columns.map(col => (
                      <td key={col} className="p-2">
                        {row[col] || '-'}
                      </td>
                    ))}
                    <td className="p-2">
                      {isValid ? (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-700 border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 5 rows of {data.length} total rows
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
