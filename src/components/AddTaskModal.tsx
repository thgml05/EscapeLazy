import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Target, Zap } from 'lucide-react';
import { addUserTask } from '@/utils/projectService';

interface AddTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  createdBy: string;
}

export const AddTaskModal = ({
  projectId,
  isOpen,
  onClose,
  onTaskAdded,
  createdBy,
}: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<
    'low' | 'medium' | 'high' | 'critical'
  >('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      return;
    }

    addUserTask(projectId, {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      difficulty,
      createdBy,
    });

    onTaskAdded();

    // 폼 초기화
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setDifficulty('medium');
    onClose();
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { color: 'text-gray-600', icon: '🔽', label: '낮음' };
      case 'medium':
        return { color: 'text-blue-600', icon: '➡️', label: '보통' };
      case 'high':
        return { color: 'text-orange-600', icon: '🔼', label: '높음' };
      case 'critical':
        return { color: 'text-red-600', icon: '🚨', label: '긴급' };
      default:
        return { color: 'text-blue-600', icon: '➡️', label: '보통' };
    }
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { color: 'text-green-600', icon: '🌱', label: '쉬움' };
      case 'medium':
        return { color: 'text-blue-600', icon: '🌿', label: '보통' };
      case 'hard':
        return { color: 'text-red-600', icon: '🌳', label: '어려움' };
      default:
        return { color: 'text-blue-600', icon: '🌿', label: '보통' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-large bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-coral-500" />
            새로운 작업 추가
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            직접 추가한 작업은 보너스 포인트를 받을 수 있어요!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="taskTitle"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              작업 제목
            </Label>
            <Input
              id="taskTitle"
              placeholder="예: 자료 조사하기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="taskDescription"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              작업 설명
            </Label>
            <Textarea
              id="taskDescription"
              placeholder="이 작업에 대한 자세한 설명을 입력해주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="taskDueDate"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              마감일
            </Label>
            <Input
              id="taskDueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 h-12"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                우선순위
              </Label>
              <Select
                value={priority}
                onValueChange={(value: any) => setPriority(value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span>🔽</span>
                      <span>낮음</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span>➡️</span>
                      <span>보통</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span>🔼</span>
                      <span>높음</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <span>🚨</span>
                      <span>긴급</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                난이도
              </Label>
              <Select
                value={difficulty}
                onValueChange={(value: any) => setDifficulty(value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex items-center gap-2">
                      <span>🌱</span>
                      <span>쉬움</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span>🌿</span>
                      <span>보통</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex items-center gap-2">
                      <span>🌳</span>
                      <span>어려움</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 선택된 설정 미리보기 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">우선순위:</span>
                <span
                  className={`font-medium ${getPriorityConfig(priority).color}`}
                >
                  {getPriorityConfig(priority).icon}{' '}
                  {getPriorityConfig(priority).label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">난이도:</span>
                <span
                  className={`font-medium ${
                    getDifficultyConfig(difficulty).color
                  }`}
                >
                  {getDifficultyConfig(difficulty).icon}{' '}
                  {getDifficultyConfig(difficulty).label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-gray-200 hover:bg-gray-50 h-12"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 h-12 button-3d"
            >
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
