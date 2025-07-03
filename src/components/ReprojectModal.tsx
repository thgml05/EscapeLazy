import { useState, useEffect } from 'react';
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
import { RefreshCw, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { Project } from '@/types/project';
import { breakdownTask } from '@/utils/geminiService';
import { scheduleTasksToDeadline } from '@/utils/scheduleService';
import { saveProjectTasks, updateProject } from '@/utils/projectService';

interface ReprojectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  apiKey: string;
  onReproject: (newTasks: any[], updatedProject: Project) => void;
}

export const ReprojectModal = ({
  isOpen,
  onClose,
  project,
  apiKey,
  onReproject,
}: ReprojectModalProps) => {
  const [goalDesc, setGoalDesc] = useState('');
  const [goalContext, setGoalContext] = useState('');
  const [deadline, setDeadline] = useState(project.deadline);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // 모달이 열릴 때 기존 프로젝트 정보를 초기값으로 설정
  useEffect(() => {
    if (isOpen) {
      // 기존 프로젝트의 목표 설명과 특이사항을 가져오기 위해 localStorage에서 확인
      const projectData = localStorage.getItem(`project_data_${project.id}`);
      if (projectData) {
        try {
          const data = JSON.parse(projectData);
          setGoalDesc(data.goalDesc || '');
          setGoalContext(data.goalContext || '');
        } catch (error) {
          console.log('기존 프로젝트 데이터를 불러올 수 없습니다.');
        }
      }
      setDeadline(project.deadline);
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goalDesc.trim()) {
      alert('목표 설명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const geminiTasks = await breakdownTask(
        apiKey,
        project.name,
        goalDesc,
        goalContext,
        deadline
      );

      const scheduledTasks = scheduleTasksToDeadline(geminiTasks, deadline, {
        workDaysPerWeek: 5,
        hoursPerDay: 4,
        preferMorning: true,
        preferAfternoon: true,
        preferEvening: false,
        bufferDays: 1,
      });

      const newProjectTasks = scheduledTasks.map((task) => ({
        ...task,
        projectId: project.id,
        priority: 'medium' as const,
        points: 0,
        isUserAdded: false,
      }));

      // 프로젝트 정보 업데이트
      const updatedProject = {
        ...project,
        deadline,
        totalTasks: newProjectTasks.length,
        completedTasks: 0,
      };

      // 프로젝트 데이터 저장 (목표 설명과 특이사항 포함)
      localStorage.setItem(
        `project_data_${project.id}`,
        JSON.stringify({
          goalDesc,
          goalContext,
          deadline,
        })
      );

      onReproject(newProjectTasks, updatedProject);
      onClose();
    } catch (error) {
      alert(
        '재분해 중 오류가 발생했습니다: ' +
          (error instanceof Error ? error.message : '알 수 없는 오류')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-large bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-coral-500" />
            프로젝트 재분해
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            마감일이나 특이사항이 변경되었다면 AI로 작업을 다시 분해할 수
            있어요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              프로젝트명
            </Label>
            <Input
              value={project.name}
              disabled
              className="border-2 border-gray-200 rounded-xl bg-gray-50"
            />
          </div>

          <div>
            <Label
              htmlFor="goalDesc"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              목표 설명 (수정 가능)
            </Label>
            <Textarea
              id="goalDesc"
              placeholder="프로젝트에 대한 설명을 수정해주세요"
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              className="min-h-[80px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="goalContext"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              특이사항/키워드 (수정 가능)
            </Label>
            <Textarea
              id="goalContext"
              placeholder="새로운 특이사항이나 키워드를 입력해주세요"
              value={goalContext}
              onChange={(e) => setGoalContext(e.target.value)}
              className="min-h-[60px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
            />
          </div>

          <div>
            <Label
              htmlFor="deadline"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              마감일 (수정 가능)
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 h-12"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* 경고 메시지 */}
          <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ 주의사항</p>
                <p>
                  재분해하면 기존 작업들이 모두 새로운 작업으로 교체됩니다.
                  완료된 작업의 진행 상황은 초기화됩니다.
                </p>
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
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 h-12 button-3d"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  재분해 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI로 재분해하기
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
