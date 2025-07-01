
import { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  onToggle: (id: string) => void;
}

export const TaskCard = ({ task, onToggle }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors = {
    easy: 'bg-sage-100 text-sage-700 border-sage-200',
    medium: 'bg-cream-100 text-cream-700 border-cream-200',
    hard: 'bg-coral-100 text-coral-700 border-coral-200'
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움'
  };

  return (
    <div 
      className={`card-3d rounded-2xl p-6 border-2 transition-all duration-300 ${
        task.completed 
          ? 'bg-sage-50 border-sage-200 opacity-80' 
          : 'bg-white border-gray-200 hover:border-coral-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(task.id)}
          className={`p-0 h-8 w-8 rounded-full transition-all duration-200 ${
            task.completed 
              ? 'text-sage-600 hover:text-sage-700' 
              : 'text-gray-400 hover:text-coral-500'
          }`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </Button>
        
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <h3 className={`font-semibold text-lg transition-all duration-200 ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            
            <p className={`text-sm leading-relaxed transition-all duration-200 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{task.dueDate}</span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[task.difficulty]}`}>
                {difficultyLabels[task.difficulty]}
              </span>
            </div>
            
            {!task.completed && isHovered && (
              <div className="flex items-center gap-1 text-xs text-gray-400 animate-pulse-soft">
                <Clock className="w-3 h-3" />
                <span>완료하려면 클릭</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
