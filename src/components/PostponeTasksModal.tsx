import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  postponeIncompleteTasks,
  postponeTasksToNextDay,
  postponeAllIncompleteTasks,
  getProjectTasks,
} from '@/utils/projectService';
import { ProjectTask } from '@/types/project';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface PostponeTasksModalProps {
  projectId: string;
  currentDate: string;
  onTasksPostponed: () => void;
}

export const PostponeTasksModal: React.FC<PostponeTasksModalProps> = ({
  projectId,
  currentDate,
  onTasksPostponed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [postponeType, setPostponeType] = useState<
    'next-day' | 'custom-date' | 'all-incomplete'
  >('next-day');
  const [customDate, setCustomDate] = useState('');

  const tasks = getProjectTasks(projectId);
  const incompleteTasks = tasks.filter(
    (task) => !task.completed && task.dueDate === currentDate
  );

  const getNextDay = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getNextAvailableDay = () => {
    let nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    // 주말 제외
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(incompleteTasks.map((task) => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const handlePostpone = () => {
    if (selectedTasks.length === 0) return;

    switch (postponeType) {
      case 'next-day':
        postponeTasksToNextDay(projectId, currentDate);
        break;
      case 'custom-date':
        if (customDate) {
          postponeIncompleteTasks(projectId, currentDate, customDate);
        }
        break;
      case 'all-incomplete':
        postponeAllIncompleteTasks(projectId);
        break;
    }

    setIsOpen(false);
    setSelectedTasks([]);
    onTasksPostponed();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'bg-purple-100 text-purple-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'easy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (incompleteTasks.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Clock className="w-4 h-4 mr-2" />
          미완료 작업 미루기 ({incompleteTasks.length}개)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>미완료 작업 미루기</DialogTitle>
          <DialogDescription>
            {currentDate}에 완료하지 못한 작업들을 다른 날짜로 미룰 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 미루기 옵션 */}
          <div className="space-y-3">
            <h4 className="font-medium">미루기 옵션</h4>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="next-day"
                  checked={postponeType === 'next-day'}
                  onCheckedChange={() => setPostponeType('next-day')}
                />
                <Label htmlFor="next-day" className="flex-1">
                  다음 날로 미루기 ({getNextDay()})
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-date"
                  checked={postponeType === 'custom-date'}
                  onCheckedChange={() => setPostponeType('custom-date')}
                />
                <Label htmlFor="custom-date" className="flex-1">
                  특정 날짜로 미루기
                </Label>
              </div>

              {postponeType === 'custom-date' && (
                <div className="ml-6">
                  <Select value={customDate} onValueChange={setCustomDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="날짜를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 14 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i + 1);
                        const dateString = date.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        });
                        return (
                          <SelectItem key={i} value={dateString}>
                            {dateString}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-incomplete"
                  checked={postponeType === 'all-incomplete'}
                  onCheckedChange={() => setPostponeType('all-incomplete')}
                />
                <Label htmlFor="all-incomplete" className="flex-1">
                  모든 미완료 작업을 다음 가능한 날짜로 미루기 (
                  {getNextAvailableDay()})
                </Label>
              </div>
            </div>
          </div>

          {/* 작업 목록 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">미완료 작업 목록</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedTasks.length === incompleteTasks.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  전체 선택
                </Label>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {incompleteTasks.map((task) => (
                <Card key={task.id} className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) =>
                        handleSelectTask(task.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm truncate">
                          {task.title}
                        </h5>
                        <div className="flex gap-1 ml-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge
                            className={getDifficultyColor(task.difficulty)}
                          >
                            {task.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>현재: {task.dueDate}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>
                          {postponeType === 'next-day' && getNextDay()}
                          {postponeType === 'custom-date' && customDate}
                          {postponeType === 'all-incomplete' &&
                            getNextAvailableDay()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handlePostpone}
              disabled={
                selectedTasks.length === 0 ||
                (postponeType === 'custom-date' && !customDate)
              }
            >
              선택한 작업 미루기 ({selectedTasks.length}개)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
