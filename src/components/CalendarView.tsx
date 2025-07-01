
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectTask } from '@/types/project';
import { format, isSameDay, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarViewProps {
  tasks: ProjectTask[];
  onTaskToggle: (taskId: string) => void;
}

export const CalendarView = ({ tasks, onTaskToggle }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 날짜 파싱 헬퍼 함수
  const parseTaskDate = (dateString: string): Date | null => {
    try {
      // ISO 형식인지 확인
      if (dateString.includes('-') && dateString.length === 10) {
        const parsed = parseISO(dateString);
        return isValid(parsed) ? parsed : null;
      }
      
      // 한국어 형식 파싱 시도
      const parsed = new Date(dateString);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  // 선택된 날짜의 작업들
  const selectedDateTasks = tasks.filter(task => {
    const taskDate = parseTaskDate(task.dueDate);
    return taskDate && isSameDay(taskDate, selectedDate);
  });

  // 작업이 있는 날짜들
  const tasksData = tasks.reduce((acc, task) => {
    const taskDate = parseTaskDate(task.dueDate);
    if (taskDate) {
      const dateKey = format(taskDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  const difficultyColors = {
    easy: 'bg-sage-100 text-sage-700',
    medium: 'bg-cream-100 text-cream-700',
    hard: 'bg-coral-100 text-coral-700'
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 달력 */}
      <Card className="p-6 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90">
        <h3 className="text-xl font-bold text-gray-800 mb-4">작업 달력</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-2xl"
          modifiers={{
            hasTask: (date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              return !!tasksData[dateKey];
            }
          }}
          modifiersStyles={{
            hasTask: {
              backgroundColor: 'hsl(15 75% 55%)',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
        />
      </Card>

      {/* 선택된 날짜의 작업들 */}
      <Card className="p-6 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {format(selectedDate, 'M월 d일 (E)', { locale: ko })} 작업
        </h3>
        
        <div className="space-y-3">
          {selectedDateTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              이 날짜에는 예정된 작업이 없습니다.
            </p>
          ) : (
            selectedDateTasks.map(task => (
              <div 
                key={task.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  task.completed 
                    ? 'bg-sage-50 border-sage-200 opacity-80' 
                    : 'bg-white border-gray-200 hover:border-coral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onTaskToggle(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-sage-500 border-sage-500 text-white' 
                        : 'border-gray-300 hover:border-coral-500'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      task.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                    <Badge className={`text-xs ${difficultyColors[task.difficulty]}`}>
                      {difficultyLabels[task.difficulty]}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
