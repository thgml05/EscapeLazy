import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Check,
  Wrench,
  Target,
  FileText,
  Star,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar as UiCalendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPriorityConfig } from '@/utils/rewardService';
import { ProjectTask } from '@/types/project';

interface TaskCardProps {
  task: ProjectTask;
  onToggle: (id: string) => void;
  onEdit?: (
    id: string,
    updates: { title: string; description: string; dueDate: string }
  ) => void;
  onDelete?: (id: string) => void;
  onPriorityChange?: (
    id: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ) => void;
}

// 설명을 구조화된 형태로 파싱하는 함수
const parseStructuredDescription = (description: string) => {
  const structured = {
    steps: [] as string[],
    tools: [] as string[],
    references: [] as string[],
    deliverables: [] as string[],
  };

  // 전체 텍스트에서 단계 패턴을 찾아보기
  const fullText = description;

  // "1단계:", "2단계:", "3단계:" 등의 패턴을 찾아서 분리
  const stepParts = fullText.split(/(\d+단계:)/);
  const foundSteps: string[] = [];

  for (let i = 1; i < stepParts.length; i += 2) {
    if (stepParts[i] && stepParts[i + 1]) {
      const stepContent = stepParts[i + 1].trim();
      if (stepContent.length > 0) {
        foundSteps.push(stepContent);
      }
    }
  }

  if (foundSteps.length > 0) {
    structured.steps = foundSteps;
  } else {
    // 기존 라인별 파싱 로직
    const lines = description.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();

      if (
        trimmed.match(/^\d+단계:/) ||
        trimmed.match(/^\d+\./) ||
        trimmed.includes('1단계:') ||
        trimmed.includes('2단계:') ||
        trimmed.includes('3단계:') ||
        trimmed.includes('4단계:') ||
        trimmed.includes('5단계:')
      ) {
        const stepMatch = trimmed.match(/(\d+단계:|^\d+\.)\s*(.+)/);
        if (stepMatch) {
          structured.steps.push(stepMatch[2].trim());
        } else {
          structured.steps.push(trimmed);
        }
      } else if (
        trimmed.includes('도구:') ||
        trimmed.includes('사용할 도구') ||
        trimmed.includes('사용 도구') ||
        trimmed.includes('사용할 도구/웹사이트/앱')
      ) {
        structured.tools.push(trimmed);
      } else if (
        trimmed.includes('참고:') ||
        trimmed.includes('예시:') ||
        trimmed.includes('참고할 자료/링크')
      ) {
        structured.references.push(trimmed);
      } else if (
        trimmed.includes('결과물:') ||
        trimmed.includes('예상 결과물') ||
        trimmed.includes('예상 결과물:')
      ) {
        structured.deliverables.push(trimmed);
      }
    });
  }

  // 단계가 여전히 없으면 문장 단위로 분할
  if (structured.steps.length === 0) {
    const sentences = fullText
      .split(/[.!?]\s+/)
      .filter((s) => s.trim().length > 10);
    if (sentences.length > 1) {
      structured.steps = sentences.slice(0, 5);
    }
  }

  return structured;
};

export const TaskCard = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onPriorityChange,
}: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepCompletion, setStepCompletion] = useState<boolean[]>([]);

  const difficultyColors = {
    easy: 'bg-sage-100 text-sage-700 border-sage-200',
    medium: 'bg-cream-100 text-cream-700 border-cream-200',
    hard: 'bg-coral-100 text-coral-700 border-coral-200',
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };

  const structuredDesc = parseStructuredDescription(task.description);
  const priorityConfig = getPriorityConfig(task.priority || 'medium');

  const handleStepToggle = (stepIndex: number) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);
  };

  // 체크리스트 렌더링 함수
  const renderChecklist = (task: ProjectTask) => {
    // 작업 제목에서 체크리스트 패턴 찾기 (예: "1단계:", "2단계:" 등)
    const checklistPattern = /(\d+단계:)(.*?)(?=\d+단계:|$)/g;
    const title = task.title;
    const description = task.description || '';
    const fullText = `${title}\n${description}`;

    const checklistItems: string[] = [];
    let match;

    // 제목과 설명에서 체크리스트 항목 추출
    while ((match = checklistPattern.exec(fullText)) !== null) {
      checklistItems.push(match[0].trim());
    }

    if (checklistItems.length === 0) {
      // 체크리스트가 없으면 일반 작업으로 표시
      return (
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${
              task.completed
                ? 'bg-sage-500 border-sage-500 text-white'
                : 'border-gray-300 hover:border-coral-500'
            }`}
          >
            {task.completed && <Check className="w-4 h-4" />}
          </button>
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

    // 체크리스트가 있으면 단계별로 표시
    // 각 단계의 완료 상태를 개별적으로 관리
    const [localStepCompletion, setLocalStepCompletion] = useState<boolean[]>(
      new Array(checklistItems.length).fill(task.completed)
    );

    // 전체 완료 상태 계산
    const allStepsCompleted = localStepCompletion.every((step) => step);

    // 전체 체크박스 변경 처리
    const handleMainCheckboxChange = (checked: boolean) => {
      setLocalStepCompletion(new Array(checklistItems.length).fill(checked));
      onToggle(task.id);
    };

    // 개별 단계 체크박스 변경 처리
    const handleStepCheckboxChange = (index: number, checked: boolean) => {
      const newStepCompletion = [...localStepCompletion];
      newStepCompletion[index] = checked;
      setLocalStepCompletion(newStepCompletion);

      // 모든 단계가 완료되면 전체 작업도 완료로 처리
      const allCompleted = newStepCompletion.every((step) => step);
      if (allCompleted !== task.completed) {
        onToggle(task.id);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMainCheckboxChange(!allStepsCompleted);
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${
              allStepsCompleted
                ? 'bg-sage-500 border-sage-500 text-white'
                : 'border-gray-300 hover:border-coral-500'
            }`}
          >
            {allStepsCompleted && <Check className="w-4 h-4" />}
          </button>
          <h4
            className={`font-semibold mb-2 ${
              allStepsCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}
          >
            {task.title.split('1단계:')[0].trim() || task.title}
          </h4>
        </div>
        <div className="space-y-2 ml-6">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStepCheckboxChange(index, !localStepCompletion[index]);
                }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                  localStepCompletion[index]
                    ? 'bg-sage-500 border-sage-500 text-white'
                    : 'border-gray-300 hover:border-coral-500'
                }`}
              >
                {localStepCompletion[index] && <Check className="w-3 h-3" />}
              </button>
              <span
                className={`text-sm ${
                  localStepCompletion[index]
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700'
                }`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`card-3d rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
        task.completed
          ? 'bg-sage-50 border-sage-200 opacity-90 scale-[0.98]'
          : 'bg-white border-gray-200 hover:border-coral-300 hover:shadow-lg hover:scale-[1.02]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onEdit)
              onEdit(task.id, {
                title: editTitle,
                description: editDescription,
                dueDate: editDueDate,
              });
            setIsEditing(false);
          }}
          className="space-y-2"
        >
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="mb-1"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="mb-1 min-h-[60px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">날짜:</span>
            <span className="text-sm text-gray-700">
              {editDueDate || '날짜를 선택하세요'}
            </span>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-1"
                  onClick={() => setShowDatePicker(true)}
                >
                  <CalendarIcon className="w-5 h-5 text-coral-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <UiCalendar
                  mode="single"
                  selected={editDueDate ? new Date(editDueDate) : undefined}
                  onSelect={(date) => {
                    if (date) setEditDueDate(format(date, 'yyyy-MM-dd'));
                  }}
                  className="rounded-xl border"
                />
                <div className="flex justify-end p-2">
                  <Button size="sm" onClick={() => setShowDatePicker(false)}>
                    확인
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="submit" size="sm" className="rounded-xl">
              저장
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-4">
          <div
            className={`p-0 h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center ${
              task.completed ? 'text-sage-600' : 'text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              {/* 제목과 우선순위 */}
              <div className="flex items-start justify-between">
                <h3
                  className={`font-semibold text-lg transition-all duration-200 ${
                    task.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-800'
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  {/* 사용자 추가 작업 표시 */}
                  {task.isUserAdded && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium border border-blue-200">
                      <Lightbulb className="w-3 h-3" />
                      <span>직접 추가</span>
                    </div>
                  )}

                  {/* 포인트 표시 */}
                  {task.points && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-medium border border-yellow-200">
                      <Star className="w-3 h-3" />
                      <span>{task.points}점</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 우선순위 표시 및 수정 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">우선순위:</span>
                {onPriorityChange ? (
                  <div className="flex gap-1">
                    {[
                      {
                        value: 'low',
                        icon: '🔽',
                        label: '낮음',
                        color: 'bg-gray-100 text-gray-700 border-gray-200',
                      },
                      {
                        value: 'medium',
                        icon: '➡️',
                        label: '보통',
                        color: 'bg-blue-100 text-blue-700 border-blue-200',
                      },
                      {
                        value: 'high',
                        icon: '🔼',
                        label: '높음',
                        color:
                          'bg-orange-100 text-orange-700 border-orange-200',
                      },
                      {
                        value: 'critical',
                        icon: '🚨',
                        label: '긴급',
                        color: 'bg-red-100 text-red-700 border-red-200',
                      },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() =>
                          onPriorityChange(task.id, priority.value as any)
                        }
                        className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                          task.priority === priority.value
                            ? priority.color + ' ring-2 ring-coral-300'
                            : 'bg-white border-gray-200 hover:border-coral-300'
                        }`}
                        title={`우선순위를 ${priority.label}으로 변경`}
                      >
                        {priority.icon} {priority.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium border ${priorityConfig.color}`}
                  >
                    {priorityConfig.icon} {priorityConfig.label}
                  </span>
                )}
              </div>

              {/* 구조화된 설명 표시 */}
              <div
                className={`space-y-3 transition-all duration-200 ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {renderChecklist(task)}

                {/* 사용 도구 */}
                {structuredDesc.tools.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Wrench className="w-4 h-4" />
                      <span>사용 도구</span>
                    </div>
                    <div className="ml-6">
                      {structuredDesc.tools.map((tool, index) => (
                        <div key={index} className="text-sm leading-relaxed">
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 참고 자료 */}
                {structuredDesc.references.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4" />
                      <span>참고 자료</span>
                    </div>
                    <div className="ml-6">
                      {structuredDesc.references.map((ref, index) => (
                        <div key={index} className="text-sm leading-relaxed">
                          {ref}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 예상 결과물 */}
                {structuredDesc.deliverables.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Check className="w-4 h-4" />
                      <span>예상 결과물</span>
                    </div>
                    <div className="ml-6">
                      {structuredDesc.deliverables.map((deliverable, index) => (
                        <div key={index} className="text-sm leading-relaxed">
                          {deliverable}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 구조화되지 않은 설명이 있는 경우 */}
                {structuredDesc.steps.length === 0 &&
                  structuredDesc.tools.length === 0 &&
                  structuredDesc.references.length === 0 &&
                  structuredDesc.deliverables.length === 0 && (
                    <p className="text-sm leading-relaxed">
                      {task.description}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{task.dueDate}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    difficultyColors[task.difficulty]
                  }`}
                >
                  {difficultyLabels[task.difficulty]}
                </span>
              </div>
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 text-coral-500" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 삭제 확인 모달 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-large bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              정말 이 작업을 삭제하시겠습니까?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              삭제된 작업은 복구할 수 없습니다. 계속 진행하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-xl border-2 border-gray-200 hover:bg-gray-50 h-12"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (onDelete) onDelete(task.id);
                setShowDeleteConfirm(false);
              }}
              className="flex-1 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 h-12 button-3d"
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
