import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectTask } from '@/types/project';
import { format, isSameDay, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  updateTaskDueDate,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskChecklist,
} from '@/utils/projectService';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  List,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface CalendarViewProps {
  projectId: string;
  tasks: ProjectTask[];
  onTaskUpdate: () => void;
  onDateSelect: (date: string) => void;
}

export const CalendarView = ({
  projectId,
  tasks,
  onTaskUpdate,
  onDateSelect,
}: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);

  // tasks가 변경될 때마다 localTasks 업데이트
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

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

  // 날짜 리스트 뷰에서 dateKey를 사용할 때도 항상 safeDateKey로 사용
  const safeDateKey = (key: string) => key.replace(/^date-/, '');

  // 선택된 날짜의 작업들
  const selectedDateTasks = localTasks.filter((task) => {
    const taskDate = parseTaskDate(safeDateKey(task.dueDate));
    return taskDate && isSameDay(taskDate, selectedDate);
  });

  // 작업이 있는 날짜들
  const tasksData = localTasks.reduce((acc, task) => {
    const taskDate = parseTaskDate(safeDateKey(task.dueDate));
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
    dateCompletion[safeDateKey(dateKey)] =
      total === 0 ? 0 : Math.round((done / total) * 100);
  });

  // modifiers 및 styles 동적 생성
  const modifiers: Record<string, (date: Date) => boolean> = {
    notStarted: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return dateCompletion[safeDateKey(key)] === 0;
    },
    inProgress: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return (
        dateCompletion[safeDateKey(key)] > 0 &&
        dateCompletion[safeDateKey(key)] < 100
      );
    },
    completed: (date) => {
      const key = format(date, 'yyyy-MM-dd');
      return dateCompletion[safeDateKey(key)] === 100;
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

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '긴급',
  };

  const priorityIcons = {
    low: null,
    medium: null,
    high: <AlertTriangle className="w-3 h-3" />,
    critical: <AlertTriangle className="w-3 h-3 fill-red-600 text-red-600" />,
  };

  // 작업 완료 상태 변경
  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      updateTaskStatus(taskId, completed);
      // 로컬 상태 즉시 업데이트
      setLocalTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, completed } : task))
      );
      onTaskUpdate();
    } catch (error) {
      console.error('작업 완료 상태 업데이트 실패:', error);
    }
  };

  // 날짜 변경 처리
  const handleDateChange = async (taskId: string, newDate: string) => {
    try {
      updateTaskDueDate(taskId, newDate);
      // 로컬 상태 즉시 업데이트
      setLocalTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, dueDate: newDate } : task
        )
      );
      setEditingTaskId(null);
      setNewDate('');
      onTaskUpdate();
    } catch (error) {
      console.error('날짜 변경 실패:', error);
    }
  };

  // 긴급도 변경 처리
  const handlePriorityChange = async (
    taskId: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    try {
      updateTaskPriority(taskId, priority);
      // 로컬 상태 즉시 업데이트 및 리스트 재정렬
      setLocalTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, priority } : task))
      );
      // 즉시 리스트 업데이트
      onTaskUpdate();
    } catch (error) {
      console.error('긴급도 변경 실패:', error);
    }
  };

  // 날짜별 작업 그룹화 (리스트 뷰용)
  const groupedTasks = localTasks.reduce((acc, task) => {
    const taskDate = parseTaskDate(safeDateKey(task.dueDate));
    if (taskDate) {
      const dateKey = format(taskDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  // 날짜순으로 정렬
  const sortedDates = Object.keys(groupedTasks).sort();

  // 우선순위 정렬 함수
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  function sortByPriority(tasks: ProjectTask[]) {
    return [...tasks].sort((a, b) => {
      const pa = priorityOrder[a.priority || 'medium'];
      const pb = priorityOrder[b.priority || 'medium'];
      if (pa !== pb) return pb - pa;
      return 0;
    });
  }

  // Checklist 컴포넌트 분리
  function Checklist({
    task,
    onTaskCompletion,
  }: {
    task: ProjectTask;
    onTaskCompletion: (id: string, completed: boolean) => void;
  }) {
    // checklist가 없으면 최초 한 번만 생성해서 저장 + onTaskUpdate 호출
    if (!task.checklist || task.checklist.length === 0) {
      const checklistPattern = /(\d+단계:)(.*?)(?=\d+단계:|$)/g;
      const fullText = `${task.title}\n${task.description || ''}`;
      const items: { label: string; completed: boolean }[] = [];
      let match;
      while ((match = checklistPattern.exec(fullText)) !== null) {
        items.push({ label: match[0].trim(), completed: false });
      }
      if (items.length > 0) {
        // 최초 한 번만 저장
        updateTaskChecklist(task.id, items);
        // 상위 상태 즉시 갱신
        if (typeof onTaskCompletion === 'function') {
          // 전체 완료 여부는 false로 전달
          onTaskCompletion(task.id, false);
        }
        return null;
      }
    }
    // checklist가 있으면 항상 task.checklist만 사용
    const checklist = task.checklist || [];
    if (checklist.length === 0) {
      // 체크리스트가 없으면 일반 작업으로 표시
      return (
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) =>
              onTaskCompletion(task.id, checked as boolean)
            }
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1">
            <h4
              className={`font-semibold mb-1 ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p
                className={`text-sm mb-2 ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    // 전체 완료 상태 계산
    const allStepsCompleted = checklist.every((item) => item.completed);

    // 전체 체크박스 변경 처리
    const handleMainCheckboxChange = (checked: boolean) => {
      const newChecklist = checklist.map((item) => ({
        ...item,
        completed: checked,
      }));
      updateTaskChecklist(task.id, newChecklist);
      onTaskCompletion(task.id, checked);
    };

    // 개별 단계 체크박스 변경 처리
    const handleStepCheckboxChange = (index: number, checked: boolean) => {
      const newChecklist = checklist.map((item, idx) =>
        idx === index ? { ...item, completed: checked } : item
      );
      updateTaskChecklist(task.id, newChecklist);
      // 전체 완료 여부 동기화
      const allCompleted = newChecklist.every((item) => item.completed);
      onTaskCompletion(task.id, allCompleted);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={allStepsCompleted}
            onCheckedChange={handleMainCheckboxChange}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          <h4
            className={`font-semibold mb-2 ${
              allStepsCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}
          >
            {task.title.split('1단계:')[0].trim() || task.title}
          </h4>
        </div>
        <div className="space-y-2 ml-6">
          {checklist.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) =>
                  handleStepCheckboxChange(index, checked as boolean)
                }
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className={`text-sm ${
                  item.completed
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // renderChecklist 함수 제거
  // renderTaskCard에서 Checklist 컴포넌트 사용
  const renderTaskCard = (task: ProjectTask, showDateChange = true) => (
    <div
      key={task.id}
      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
        task.completed
          ? 'bg-sage-50 border-sage-200 opacity-80'
          : 'bg-white border-gray-200 hover:border-coral-300 hover:shadow-md'
      }`}
    >
      <Checklist task={task} onTaskCompletion={handleTaskCompletion} />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${difficultyColors[task.difficulty]}`}>
            {difficultyLabels[task.difficulty]}
          </Badge>
          <Badge
            className={`text-xs ${
              priorityColors[task.priority]
            } flex items-center gap-1`}
          >
            {priorityIcons[task.priority]}
            {priorityLabels[task.priority]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* 긴급도 조절 */}
          <Select
            value={task.priority}
            onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
              handlePriorityChange(task.id, value)
            }
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">낮음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="critical">긴급</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // DnD 핸들러 추가
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (!activeId.startsWith('task-') || !overId.startsWith('date-')) return;
    const taskId = activeId.replace('task-', '');
    const overDateKey = overId.replace('date-', '');

    // 작업 찾기
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;
    // 날짜가 다르면 이동
    const newDueDate = format(parseISO(overDateKey), 'yyyy-MM-dd');
    if (task.dueDate !== newDueDate) {
      // dueDate 변경
      const updatedTasks = localTasks.map((t) =>
        t.id === task.id ? { ...t, dueDate: newDueDate } : t
      );
      setLocalTasks(updatedTasks);
      updateTaskDueDate(task.id, newDueDate);
      onTaskUpdate();
    }
  };

  // Draggable 래퍼 컴포넌트
  function DraggableTask({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: `task-${id}` });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'grab',
        }}
        {...attributes}
        {...listeners}
      >
        {children}
      </div>
    );
  }

  // Droppable 래퍼 컴포넌트
  function DroppableDate({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const { setNodeRef, isOver } = useDroppable({ id: `date-${id}` });
    return (
      <div
        ref={setNodeRef}
        style={{
          background: isOver ? '#fef3c7' : undefined, // 드롭 영역 강조
          borderRadius: 16,
          transition: 'background 0.2s',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 뷰 모드 선택 */}
      <div className="flex justify-center">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              달력 뷰
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              날짜 리스트 뷰
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 달력 */}
              <Card className="p-6 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  작업 달력
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date && !isNaN(date.getTime())) setSelectedDate(date);
                  }}
                  className="rounded-2xl [&_.rdp-day]:p-1 [&_.rdp-button]:rounded-lg [&_.rdp-button]:transition-all [&_.rdp-button]:duration-200"
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                />
              </Card>

              {/* 선택된 날짜의 작업들 */}
              <Card className="p-6 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {selectedDate && !isNaN(selectedDate.getTime())
                    ? format(selectedDate, 'M월 d일 (E)', { locale: ko }) +
                      ' 작업'
                    : '작업 목록'}
                </h3>
                <div className="space-y-3">
                  {Array.isArray(selectedDateTasks) &&
                  selectedDateTasks.length > 0 ? (
                    selectedDateTasks.map((task) => renderTaskCard(task, true))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      이 날짜에는 예정된 작업이 없습니다.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 날짜 리스트 뷰는 달력 없이 오직 날짜별 작업 카드만 나열 + DnD */}
          <TabsContent value="list" className="space-y-6">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={useSensors(useSensor(PointerSensor))}
            >
              <div className="space-y-8">
                {sortedDates.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    예정된 작업이 없습니다.
                  </div>
                ) : (
                  sortedDates.map((dateKey) => {
                    const pureDateKey = safeDateKey(dateKey);
                    const date = parseISO(pureDateKey);
                    // 긴급도 기준 정렬 적용
                    const dayTasks = sortByPriority(
                      groupedTasks[pureDateKey] || groupedTasks[dateKey] || []
                    );
                    const completedCount = dayTasks.filter(
                      (t) => t.completed
                    ).length;
                    const totalCount = dayTasks.length;
                    return (
                      <DroppableDate key={pureDateKey} id={pureDateKey}>
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {format(date, 'M월 d일 (E)', { locale: ko })}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {completedCount}/{totalCount} 완료
                            </span>
                          </div>
                          <SortableContext
                            items={dayTasks.map((t) => `task-${t.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3 min-h-[40px]">
                              {dayTasks.map((task) => (
                                <DraggableTask key={task.id} id={task.id}>
                                  {renderTaskCard(task, true)}
                                </DraggableTask>
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      </DroppableDate>
                    );
                  })
                )}
              </div>
            </DndContext>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
