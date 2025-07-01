
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { breakdownTask } from '@/utils/geminiService';
import { scheduleTasksToDeadline, ScheduledTask } from '@/utils/scheduleService';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Calendar, 
  Settings, 
  Sparkles, 
  ChevronRight,
  PlusCircle,
  RefreshCw
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedTasks = localStorage.getItem('escape_lazy_tasks');
    const savedProject = localStorage.getItem('current_project');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedProject) {
      setCurrentProject(savedProject);
    }
  }, []);

  const handleApiKeySave = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
    toast({
      title: "API 키가 저장되었습니다",
      description: "이제 목표를 설정해보세요!",
    });
  };

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('escape_lazy_tasks', JSON.stringify(updatedTasks));
    
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
      
      setTasks(scheduledTasks);
      setCurrentProject(goal);
      localStorage.setItem('escape_lazy_tasks', JSON.stringify(scheduledTasks));
      localStorage.setItem('current_project', goal);
      
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

  const handleNewProject = () => {
    setTasks([]);
    setCurrentProject('');
    setGoal('');
    setDeadline('');
    localStorage.removeItem('escape_lazy_tasks');
    localStorage.removeItem('current_project');
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const todayTasks = tasks.filter(task => {
    const today = new Date().toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
    return task.dueDate === today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

        {/* Main Content */}
        {tasks.length === 0 ? (
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
          /* Task Management */
          <div className="space-y-8">
            {/* Progress Section */}
            <ProgressBar
              completed={completedTasks}
              total={tasks.length}
              projectName={currentProject}
            />

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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">전체 작업</h2>
                <Button
                  variant="outline"
                  onClick={handleNewProject}
                  className="rounded-xl border-2 border-gray-200 hover:bg-gray-50 button-3d"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  새 프로젝트
                </Button>
              </div>
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                  />
                ))}
              </div>
            </div>
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
