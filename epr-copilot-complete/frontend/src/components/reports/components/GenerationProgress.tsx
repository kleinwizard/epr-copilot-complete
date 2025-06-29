
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  progress: number;
}

export function GenerationProgress({ progress }: GenerationProgressProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Generating Report...</h3>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">
            This may take a few minutes. Please don't close this window.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
