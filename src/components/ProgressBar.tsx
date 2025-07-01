
import { Progress } from '@/components/ui/progress';
import { Trophy, Target } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
  projectName: string;
}

export const ProgressBar = ({ completed, total, projectName }: ProgressBarProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-coral-500" />
          <h3 className="font-semibold text-gray-800">{projectName}</h3>
        </div>
        
        {percentage === 100 && (
          <div className="flex items-center gap-1 text-sage-600 animate-float">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">완료!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <Progress 
          value={percentage} 
          className="h-3 bg-gray-100 rounded-full overflow-hidden"
        />
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {completed} / {total} 완료
          </span>
          <span className="font-medium text-coral-600">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};
