import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { ProjectSelector } from '@/components/ProjectSelector';
import {
  ScheduleSettings,
  ScheduleSettings as ScheduleSettingsType,
} from '@/components/ScheduleSettings';
import { QuickStartTemplates } from '@/components/QuickStartTemplates';
import { breakdownTask, breakdownTaskWithoutAPI } from '@/utils/geminiService';
import { scheduleTasksToDeadline } from '@/utils/scheduleService';
import {
  saveProject,
  getProjects,
  deleteProject,
  saveProjectTasks,
  syncProjectProgress,
} from '@/utils/projectService';
import { Project } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import {
  Target,
  Settings,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalContext, setGoalContext] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettingsType>({
      workDaysPerWeek: 5,
      hoursPerDay: 4,
      preferMorning: true,
      preferAfternoon: true,
      preferEvening: false,
      bufferDays: 1,
    });

  // 프로젝트 관리 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);

  useEffect(() => {
    // API 키 로드 (만료 시간 확인)
    const savedApiKeyData = localStorage.getItem('gemini_api_key_data');
    if (savedApiKeyData) {
      try {
        const apiKeyData = JSON.parse(savedApiKeyData);
        const expiresAt = new Date(apiKeyData.expiresAt);
        const now = new Date();

        if (now < expiresAt) {
          // API 키가 유효한 경우
          setApiKey(apiKeyData.key);
        } else {
          // API 키가 만료된 경우
          localStorage.removeItem('gemini_api_key_data');
          localStorage.removeItem('gemini_api_key'); // 기존 방식과의 호환성
        }
      } catch (error) {
        // 기존 방식으로 저장된 API 키 확인
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
      }
    } else {
      // 기존 방식으로 저장된 API 키 확인
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    }

    // 프로젝트 진행률 동기화
    syncProjectProgress();
    // 프로젝트 로드
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length === 0) setShowGoalInput(true);
  }, []);

  const handleApiKeySave = (newApiKey: string) => {
    // API 키와 함께 만료 시간 저장 (7일 후)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const apiKeyData = {
      key: newApiKey,
      expiresAt: expiresAt.toISOString(),
    };

    localStorage.setItem('gemini_api_key_data', JSON.stringify(apiKeyData));
    localStorage.setItem('gemini_api_key', newApiKey); // 기존 방식과의 호환성

    setApiKey(newApiKey);
    toast({
      title: 'API 키가 저장되었습니다',
      description: '7일간 유지됩니다. 이제 목표를 설정해보세요!',
    });
  };

  const handleProjectSelect = (project: Project | null) => {
    if (project) {
      navigate(`/project/${project.id}`);
    }
  };

  const handleNewProject = () => {
    setShowGoalInput(true);
  };

  const handleProjectDelete = (projectId: string) => {
    setDeleteTargetId(projectId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteProject(deleteTargetId);
      const updatedProjects = getProjects();
      setProjects(updatedProjects);
      toast({ title: '프로젝트가 삭제되었습니다' });
    }
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const handleTemplateSelect = (templateGoal: string) => {
    setGoalTitle(templateGoal);
    // 기본 마감일을 2주 후로 설정
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 14);
    setDeadline(defaultDeadline.toISOString().split('T')[0]);
  };

  const handleGoalSubmit = async () => {
    if (!goalTitle.trim() || !goalDesc.trim() || !deadline) {
      toast({
        title: '입력을 확인해주세요',
        description: '과제명, 목표 설명, 마감일을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    // API 키가 없으면 API 키 입력 모달을 열고 중단
    if (!apiKey) {
      toast({
        title: 'API 키가 필요합니다',
        description: 'AI 기능을 사용하기 위해 Gemini API 키를 입력해주세요.',
        variant: 'destructive',
      });
      setShowApiModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const geminiTasks = await breakdownTask(
        apiKey,
        goalTitle,
        goalDesc,
        goalContext,
        deadline
      );
      const scheduledTasks = scheduleTasksToDeadline(
        geminiTasks,
        deadline,
        scheduleSettings
      );
      const newProject = {
        id: `project-${Date.now()}`,
        name: goalTitle,
        deadline,
        createdAt: new Date().toISOString(),
        completedTasks: 0,
        totalTasks: scheduledTasks.length,
      };
      const newProjectTasks = scheduledTasks.map((task) => ({
        ...task,
        projectId: newProject.id,
      }));
      saveProject(newProject);
      saveProjectTasks(newProject.id, newProjectTasks);
      setProjects(getProjects());
      toast({
        title: '목표가 분해되었습니다! ✨',
        description: `${scheduledTasks.length}개의 작업으로 나누어졌어요.`,
      });
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        description:
          error instanceof Error ? error.message : '다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-coral-400 to-coral-600 rounded-2xl flex items-center justify-center shadow-medium animate-float">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-coral-600 to-sage-600 bg-clip-text text-transparent">
              EscapeLazy
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            막막한 과제를 작은 단계로 나누어 쉽게 시작해보세요
          </p>
        </div>

        {/* API Key Settings */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiModal(true)}
            className="rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white button-3d"
          >
            <Settings className="w-4 h-4 mr-2" />
            {apiKey ? 'AI 설정' : '고급 AI 설정'}
          </Button>
        </div>

        {/* 내 목표 보기 섹션 */}
        <div className="mb-8">
          <ProjectSelector
            projects={projects}
            selectedProject={null}
            onSelectProject={handleProjectSelect}
            onDeleteProject={handleProjectDelete}
            onNewProject={handleNewProject}
          />
        </div>

        {/* 목표 작성 플로팅 버튼 */}
        {projects.length > 0 && !showGoalInput && (
          <button
            className="fixed bottom-8 right-8 z-50 bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition-all"
            onClick={() => setShowGoalInput(true)}
            aria-label="목표 작성 열기"
          >
            <Plus className="w-8 h-8" />
          </button>
        )}

        {/* 목표 입력 폼 */}
        {showGoalInput && (
          <Card className="p-8 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90 backdrop-blur-sm mb-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-coral-500 text-2xl"
              onClick={() => setShowGoalInput(false)}
              aria-label="목표 작성 닫기"
            >
              ×
            </button>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-coral-100 to-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-coral-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  어떤 목표를 달성하고 싶나요?
                </h2>
                <p className="text-gray-600">
                  AI가 여러분의 목표를 달성 가능한 단계로 나누어드릴게요
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="goalTitle"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    과제명/프로젝트명
                  </Label>
                  <Input
                    id="goalTitle"
                    placeholder="예: 유연성 강화 스터디 기획"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    예시: "유연성 강화 스터디 기획", "포트폴리오 웹사이트 제작"
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="goalDesc"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    목표 설명 (이 과제가 무엇인지, 목적/의도)
                  </Label>
                  <Textarea
                    id="goalDesc"
                    placeholder="예: 유연성 강화 스터디란 무엇인지, 어떤 방식으로 진행할지 설명"
                    value={goalDesc}
                    onChange={(e) => setGoalDesc(e.target.value)}
                    className="min-h-[60px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    예시: "유연성 강화 스터디는 조직 내 협업 유연성을 높이기
                    위한 프로그램입니다. 온라인으로 주 1회 진행 예정입니다."
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="goalContext"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    맥락/키워드/특이사항 (자유롭게)
                  </Label>
                  <Textarea
                    id="goalContext"
                    placeholder="예: 운동이 아니라 조직 내 협업 유연성, 팀원들과의 소통 강화, 온라인 진행 등"
                    value={goalContext}
                    onChange={(e) => setGoalContext(e.target.value)}
                    className="min-h-[40px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    예시: "운동이 아니라 협업 유연성, 팀원들과의 소통 강화,
                    온라인 진행, 참고자료: ..."
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="deadline"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    마감일
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 h-12"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    주 {scheduleSettings.workDaysPerWeek}일, 일일{' '}
                    {scheduleSettings.hoursPerDay}시간
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScheduleSettings(true)}
                    className="rounded-xl border-2 border-gray-200 hover:border-coral-300"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    일정 조정
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleGoalSubmit}
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 text-lg font-semibold button-3d"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {apiKey
                      ? 'AI가 작업을 나누는 중...'
                      : '작업을 나누는 중...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {apiKey ? 'AI로 목표 분해하기' : '목표 분해하기'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* 빠른 시작 템플릿 */}
        {projects.length === 0 && !showGoalInput && (
          <div className="mb-8">
            <QuickStartTemplates onSelectTemplate={handleTemplateSelect} />
          </div>
        )}

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSave={handleApiKeySave}
          currentApiKey={apiKey}
        />

        {/* Schedule Settings Modal */}
        <ScheduleSettings
          isOpen={showScheduleSettings}
          onClose={() => setShowScheduleSettings(false)}
          onSave={setScheduleSettings}
          currentSettings={scheduleSettings}
        />

        {/* 삭제 확인 모달 */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-large bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                정말 이 프로젝트를 삭제하시겠습니까?
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                삭제된 프로젝트는 복구할 수 없습니다. 계속 진행하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 hover:bg-gray-50 h-12"
              >
                취소
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 h-12 button-3d"
              >
                삭제
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
