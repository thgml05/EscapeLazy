
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CalendarView } from '@/components/CalendarView';
import { ProjectSelector } from '@/components/ProjectSelector';
import { breakdownTask } from '@/utils/geminiService';
import { scheduleTasksToDeadline, ScheduledTask } from '@/utils/scheduleService';
import { saveProject, getProjects, deleteProject, saveProjectTasks, getProjectTasks, updateTaskStatus } from '@/utils/projectService';
import { Project, ProjectTask } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Calendar, 
  Settings, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  List
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 프로젝트 관리 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // 프로젝트 로드
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    
    // 마지막으로 선택된 프로젝트 로드
    const lastProjectId = localStorage.getItem('last_selected_project');
    if (lastProjectId && loadedProjects.length > 0) {
      const lastProject = loadedProjects.find(p => p.id === lastProjectId);
      if (lastProject) {
        setSelectedProject(lastProject);
        loadProjectTasks(lastProjectId);
      }
    }
  }, []);

  const loadProjectTasks = (projectId: string) => {
    const tasks = getProjectTasks(projectId);
    setProjectTasks(tasks);
  };

  const handleApiKeySave = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
    toast({
      title: "API 키가 저장되었습니다",
      description: "이제 목표를 설정해보세요!",
    });
  };

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project);
    if (project) {
      localStorage.setItem('last_selected_project', project.id);
      loadProjectTasks(project.id);
    } else {
      localStorage.removeItem('last_selected_project');
      setProjectTasks([]);
      setGoal('');
      setDeadline('');
    }
  };

  const handleProjectDelete = (projectId: string) => {
    deleteProject(projectId);
    const updatedProjects = getProjects();
    setProjects(updatedProjects);
    
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setProjectTasks([]);
    }
    
    toast({
      title: "프로젝트가 삭제되었습니다",
    });
  };

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = projectTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setProjectTasks(updatedTasks);
    updateTaskStatus(taskId, !projectTasks.find(t => t.id === taskId)?.completed);
    
    // 프로젝트 진행률 업데이트
    if (selectedProject) {
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const updatedProject = {
        ...selectedProject,
        completedTasks: completedCount
      };
      setSelectedProject(updatedProject);
      saveProject(updatedProject);
      setProjects(getProjects());
    }
    
    const completedTask = updatedTasks.find(t => t.id === taskId);
    if (completedTask?.completed) {
      toast({
        title: "훌륭해요! 🎉",
        description: `"${completedTask.title}" 완료!`,
      });
    }
  };

  const handleGoalSubmit = async () => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }
    
    if (!goal.trim() || !deadline) {
      toast({
        title: "입력을 확인해주세요",
        description: "목표와 마감일을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const geminiTasks = await breakdownTask(apiKey, goal, deadline);
      const scheduledTasks = scheduleTasksToDeadline(geminiTasks, deadline);
      
      // 새 프로젝트 생성
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: goal,
        deadline,
        createdAt: new Date().toISOString(),
        completedTasks: 0,
        totalTasks: scheduledTasks.length
      };
      
      // 프로젝트 작업들 변환
      const newProjectTasks: ProjectTask[] = scheduledTasks.map(task => ({
        ...task,
        projectId: newProject.id
      }));
      
      // 저장
      saveProject(newProject);
      saveProjectTasks(newProject.id, newProjectTasks);
      
      // 상태 업데이트
      setProjects(getProjects());
      setSelectedProject(newProject);
      setProjectTasks(newProjectTasks);
      localStorage.setItem('last_selected_project', newProject.id);
      
      toast({
        title: "목표가 분해되었습니다! ✨",
        description: `${scheduledTasks.length}개의 작업으로 나누어졌어요.`,
      });
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const todayTasks = projectTasks.filter(task => {
    const today = new Date().toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
    return task.dueDate === today;
  });

  const completedTasks = projectTasks.filter(task => task.completed).length;

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
          <p className="text-gray-600 text-lg">
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
            API 설정
          </Button>
        </div>

        {/* Project Selector */}
        <div className="mb-8">
          <ProjectSelector
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={handleProjectSelect}
            onDeleteProject={handleProjectDelete}
          />
        </div>

        {/* Main Content */}
        {!selectedProject ? (
          /* Goal Input Form */
          <Card className="p-8 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90 backdrop-blur-sm">
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
                  <Label htmlFor="goal" className="text-sm font-medium text-gray-700 mb-2 block">
                    목표 또는 과제
                  </Label>
                  <Textarea
                    id="goal"
                    placeholder="예: 객체지향 프로그래밍 과제 완성하기"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-coral-400 focus:ring-0 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 mb-2 block">
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
              </div>

              <Button
                onClick={handleGoalSubmit}
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 text-lg font-semibold button-3d"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    AI가 작업을 나누는 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    목표 분해하기
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          /* Project Management with Tabs */
          <div className="space-y-8">
            {/* Progress Section */}
            <ProgressBar
              completed={completedTasks}
              total={projectTasks.length}
              projectName={selectedProject.name}
            />

            {/* Tabs for different views */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white border-2 border-gray-200 p-1">
                <TabsTrigger value="tasks" className="rounded-xl flex items-center gap-2">
                  <List className="w-4 h-4" />
                  작업 목록
                </TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  달력 뷰
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="space-y-6 mt-6">
                {/* Today's Tasks */}
                {todayTasks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-coral-500" />
                      <h2 className="text-xl font-bold text-gray-800">오늘 할 일</h2>
                      <span className="px-3 py-1 bg-coral-100 text-coral-700 rounded-full text-sm font-medium">
                        {todayTasks.filter(t => !t.completed).length}개 남음
                      </span>
                    </div>
                    <div className="space-y-3">
                      {todayTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleTaskToggle}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Tasks */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">전체 작업</h2>
                  <div className="space-y-3">
                    {projectTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleTaskToggle}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-6">
                <CalendarView
                  tasks={projectTasks}
                  onTaskToggle={handleTaskToggle}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSave={handleApiKeySave}
          currentApiKey={apiKey}
        />
      </div>
    </div>
  );
};

export default Index;
