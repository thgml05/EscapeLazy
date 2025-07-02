import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectTask } from '@/types/project';
import { format, isSameDay, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { updateTaskDueDate } from '@/utils/projectService';
import { Input } from '@/components/ui/input';

interface CalendarViewProps {
  tasks: ProjectTask[];
  onTaskToggle: (taskId: string) => void;
}

export const CalendarView = ({ tasks, onTaskToggle }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');

  // 날짜 파싱 헬퍼 함수 - 한국어 날짜 형식도 처리
  const parseTaskDate = (dateString: string): Date | null => {
    try {
      // ISO 형식 (YYYY-MM-DD)
      if (dateString.includes('-') && dateString.length === 10) {
        const parsed = parseISO(dateString);
        return isValid(parsed) ? parsed : null;
      }

      // 한국어 형식 파싱 (예: "12월 25일 (수)")
      if (dateString.includes('월') && dateString.includes('일')) {
        const currentYear = new Date().getFullYear();
        const monthMatch = dateString.match(/(\d+)월/);
        const dayMatch = dateString.match(/(\d+)일/);

        if (monthMatch && dayMatch) {
          const month = parseInt(monthMatch[1]) - 1; // JS Date는 0부터 시작
          const day = parseInt(dayMatch[1]);
          const parsed = new Date(currentYear, month, day);
          return isValid(parsed) ? parsed : null;
        }
      }

      // 일반적인 날짜 파싱 시도
      const parsed = new Date(dateString);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  // 선택된 날짜의 작업들
  const selectedDateTasks = tasks.filter((task) => {
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

  // 날짜별 완료율 계산
  const dateCompletion: Record<string, number> = {};
  Object.entries(tasksData).forEach(([dateKey, tasks]) => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    dateCompletion[dateKey] =
      total === 0 ? 0 : Math.round((done / total) * 100);
  });

  // modifiers 및 styles 동적 생성
  const modifiers: Record<string, (date: Date) => boolean> = {
    notStarted: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return dateCompletion[key] === 0;
    },
    inProgress: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return dateCompletion[key] > 0 && dateCompletion[key] < 100;
    },
    completed: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return dateCompletion[key] === 100;
    },
  };
  const modifiersStyles = {
    notStarted: {
      backgroundColor: '#ef4444', // 빨간색
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '8px',
      margin: '2px',
      width: 'calc(100% - 4px)',
      height: 'calc(100% - 4px)',
    },
    inProgress: {
      backgroundColor: '#facc15', // 노란색
      color: '#333',
      fontWeight: 'bold',
      borderRadius: '8px',
      margin: '2px',
      width: 'calc(100% - 4px)',
      height: 'calc(100% - 4px)',
    },
    completed: {
      backgroundColor: '#22c55e', // 초록색
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '8px',
      margin: '2px',
      width: 'calc(100% - 4px)',
      height: 'calc(100% - 4px)',
    },
  };

  const difficultyColors = {
    easy: 'bg-sage-100 text-sage-700',
    medium: 'bg-cream-100 text-cream-700',
    hard: 'bg-coral-100 text-coral-700',
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
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
          className="rounded-2xl [&_.rdp-day]:p-1 [&_.rdp-button]:rounded-lg [&_.rdp-button]:transition-all [&_.rdp-button]:duration-200"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
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
            selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  task.completed
                    ? 'bg-sage-50 border-sage-200 opacity-80'
                    : 'bg-white border-gray-200 hover:border-coral-300 hover:shadow-md'
                }`}
                onClick={() => onTaskToggle(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-sage-500 border-sage-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {task.completed && '✓'}
                  </div>

                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-1 ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p
                      className={`text-sm mb-2 ${
                        task.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {task.description}
                    </p>
                    <Badge
                      className={`text-xs ${difficultyColors[task.difficulty]}`}
                    >
                      {difficultyLabels[task.difficulty]}
                    </Badge>
                  </div>
                  {/* 날짜 변경 버튼 */}
                  <div>
                    {editingTaskId === task.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newDate) {
                            updateTaskDueDate(task.id, newDate);
                            setEditingTaskId(null);
                          }
                        }}
                        className="flex gap-2 items-center"
                      >
                        <Input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="h-8 px-2 text-xs"
                        />
                        <button
                          type="submit"
                          className="text-coral-600 text-xs font-bold"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="text-gray-400 text-xs"
                        >
                          취소
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setNewDate('');
                        }}
                        className="text-xs text-coral-600 underline ml-2"
                      >
                        날짜 변경
                      </button>
                    )}
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
