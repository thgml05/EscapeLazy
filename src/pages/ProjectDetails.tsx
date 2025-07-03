import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CalendarView } from '@/components/CalendarView';
import { RewardSystem } from '@/components/RewardSystem';
import { AddTaskModal } from '@/components/AddTaskModal';
import { ReprojectModal } from '@/components/ReprojectModal';
import { TeamManagement } from '@/components/TeamManagement';
import { PostponeTasksModal } from '@/components/PostponeTasksModal';
import {
  getProjects,
  getProjectTasks,
  updateTaskStatus,
  saveProjectTasks,
  updateTaskDueDate,
  updateTask,
  deleteTask,
  addUserTask,
  updateTaskPriority,
  completeTaskWithRewards,
  updateProject,
  getProjectById,
  syncProjectProgress,
  convertToTeamProject,
} from '@/utils/projectService';
import { getUserTeams } from '@/utils/teamService';
import { Project, ProjectTask } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Calendar,
  List,
  Plus,
  Trophy,
  RefreshCw,
  Users,
  Target,
  Settings,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  scheduleTasksToDeadline,
  groupAndSortTasksByDate,
} from '@/utils/scheduleService';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showReprojectModal, setShowReprojectModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState('');
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const currentUser = {
    id: 'user-1',
    name: '사용자',
    email: 'user@example.com',
  };

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    // API 키 로드
    const savedApiKeyData = localStorage.getItem('gemini_api_key_data');
    if (savedApiKeyData) {
      try {
        const apiKeyData = JSON.parse(savedApiKeyData);
        const expiresAt = new Date(apiKeyData.expiresAt);
        const now = new Date();

        if (now < expiresAt) {
          setApiKey(apiKeyData.key);
        } else {
          localStorage.removeItem('gemini_api_key_data');
          const savedApiKey = localStorage.getItem('gemini_api_key');
          if (savedApiKey) {
            setApiKey(savedApiKey);
          }
        }
      } catch (error) {
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
      }
    } else {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    }

    const projects = getProjects();
    const currentProject = projects.find((p) => p.id === projectId);

    if (!currentProject) {
      navigate('/');
      return;
    }

    setProject(currentProject);
    const tasks = getProjectTasks(projectId);
    setProjectTasks(tasks);
  }, [projectId, navigate]);

  const handleTaskToggle = (taskId: string, completed?: boolean) => {
    if (!project) return;

    const task = projectTasks.find((t) => t.id === taskId);
    if (!task) return;

    // completed 파라미터가 명시적으로 들어오면 그 값으로, 아니면 기존 로직 유지
    const willComplete =
      typeof completed === 'boolean' ? completed : !task.completed;

    if (willComplete) {
      // 작업 완료 시 보상 시스템 적용
      const rewardResult = completeTaskWithRewards(taskId, project.id);
      if (rewardResult) {
        toast({
          title: '훌륭해요! 🎉',
          description: `"${task.title}" 완료! +${rewardResult.points}점 획득!`,
        });
        if (rewardResult.newBadges.length > 0) {
          rewardResult.newBadges.forEach((badge: any) => {
            toast({
              title: '새로운 칭호 획득! 🏆',
              description: `${badge.name} - ${badge.description}`,
            });
          });
        }
        if (rewardResult.newLevel > (project.level || 1)) {
          toast({
            title: '레벨업! ⭐',
            description: `레벨 ${rewardResult.newLevel} 달성!`,
          });
        }
      }
    } else {
      // 작업 취소 시
      const updatedTasks = projectTasks.map((task) =>
        task.id === taskId ? { ...task, completed: false } : task
      );
      setProjectTasks(updatedTasks);
      updateTaskStatus(taskId, false);
    }

    // 프로젝트 정보 새로고침
    const updatedProjects = getProjects();
    const updatedProject = updatedProjects.find((p) => p.id === projectId);
    if (updatedProject) {
      setProject(updatedProject);
    }

    // 작업 목록 새로고침
    const updatedTasks = getProjectTasks(projectId);
    setProjectTasks(updatedTasks);
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    if (!project) return;

    const newTask = addUserTask(project.id, taskData);
    setProjectTasks([...projectTasks, newTask]);

    toast({
      title: '작업이 추가되었습니다! ✨',
      description: '직접 추가한 작업은 보너스 포인트를 받을 수 있어요!',
    });
  };

  const handlePriorityChange = (
    taskId: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    updateTaskPriority(taskId, priority);

    // 로컬 상태 업데이트
    const updatedTasks = projectTasks.map((task) =>
      task.id === taskId ? { ...task, priority } : task
    );
    setProjectTasks(updatedTasks);

    toast({
      title: '우선순위가 변경되었습니다!',
      description: '포인트가 재계산되었어요.',
    });
  };

  const handleReproject = (
    newTasks: ProjectTask[],
    updatedProject: Project
  ) => {
    if (!project) return;

    // 기존 작업들을 새로운 작업으로 교체
    setProjectTasks(newTasks);
    saveProjectTasks(project.id, newTasks);

    // 프로젝트 정보 업데이트
    setProject(updatedProject);
    updateProject(project.id, updatedProject);

    toast({
      title: '프로젝트가 재분해되었습니다! 🔄',
      description: `${newTasks.length}개의 새로운 작업으로 분해되었어요.`,
    });
  };

  const todayTasks = projectTasks.filter((task) => {
    const today = new Date();
    const todayString = today.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    return task.dueDate === todayString;
  });

  const completedTasks = projectTasks.filter((task) => task.completed).length;

  // DnD 핸들러
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(projectTasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setProjectTasks(reordered);
    // 순서 변경을 localStorage에도 반영
    if (project) saveProjectTasks(project.id, reordered);
  };

  // 날짜별 그룹핑 (우선순위에 따라 정렬)
  const tasksByDate = groupAndSortTasksByDate(projectTasks);
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    // 날짜 오름차순 정렬
    const parseDate = (d: string) => {
      // "2025년 7월 2일 (수)" 또는 ISO
      if (d.includes('-')) return new Date(d);
      try {
        const match = d.match(/(\d+)월 (\d+)일/);
        if (match)
          return new Date(
            new Date().getFullYear(),
            Number(match[1]) - 1,
            Number(match[2])
          );
      } catch {}
      return new Date(d);
    };
    return parseDate(a).getTime() - parseDate(b).getTime();
  });

  // 날짜별 보기에서 드래그 앤 드롭 핸들러
  const handleByDateDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceDate = result.source.droppableId;
    const destDate = result.destination.droppableId;
    const taskId = result.draggableId;
    if (sourceDate === destDate) return;
    // 날짜 변경
    const updatedTasks = projectTasks.map((task) =>
      task.id === taskId ? { ...task, dueDate: destDate } : task
    );
    setProjectTasks(updatedTasks);
    if (project) saveProjectTasks(project.id, updatedTasks);
    updateTaskDueDate(taskId, destDate);
  };

  // 전체 작업 날짜순 정렬 (같은 날짜 내에서는 우선순위순)
  const sortedTasks = [...projectTasks].sort((a, b) => {
    const parseDate = (d: string) => {
      if (d.includes('-')) return new Date(d);
      try {
        const match = d.match(/(\d+)월 (\d+)일/);
        if (match)
          return new Date(
            new Date().getFullYear(),
            Number(match[1]) - 1,
            Number(match[2])
          );
      } catch {}
      return new Date(d);
    };

    const dateA = parseDate(a.dueDate);
    const dateB = parseDate(b.dueDate);

    // 날짜가 다르면 날짜순 정렬
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // 같은 날짜면 우선순위순 정렬
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityA = priorityOrder[a.priority || 'medium'];
    const priorityB = priorityOrder[b.priority || 'medium'];

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // 높은 우선순위가 먼저
    }

    // 우선순위도 같으면 원래 순서 유지
    return a.originalIndex - b.originalIndex;
  });

  const handleTaskEdit = (
    taskId: string,
    updates: { title: string; description: string; dueDate: string }
  ) => {
    const updatedTasks = projectTasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setProjectTasks(updatedTasks);
    updateTask(taskId, updates);
    if (project) saveProjectTasks(project.id, updatedTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    const updatedTasks = projectTasks.filter((task) => task.id !== taskId);
    setProjectTasks(updatedTasks);
    deleteTask(taskId);
    if (project) saveProjectTasks(project.id, updatedTasks);
  };

  const handleTaskUpdate = () => {
    loadProject();
    syncProjectProgress();
  };

  const handleTasksPostponed = () => {
    loadProject();
  };

  const getProgressPercentage = () => {
    if (!project || project.totalTasks === 0) return 0;
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

  const getDaysUntilDeadline = () => {
    if (!project) return 0;
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = () => {
    const daysLeft = getDaysUntilDeadline();
    if (daysLeft < 0) return { text: '마감일 지남', color: 'text-red-600' };
    if (daysLeft === 0) return { text: '오늘 마감', color: 'text-orange-600' };
    if (daysLeft <= 3)
      return { text: `${daysLeft}일 남음`, color: 'text-yellow-600' };
    return { text: `${daysLeft}일 남음`, color: 'text-green-600' };
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

  const loadProject = () => {
    if (!projectId) return;

    const projectData = getProjectById(projectId);
    const projectTasks = getProjectTasks(projectId);

    setProject(projectData);
    setProjectTasks(projectTasks);
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus();
  const userTeams = getUserTeams(currentUser.id);
  const isTeamProject = project.isTeamProject && project.teamId;

  // 우선순위 정렬 함수 추가
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  function sortByPriority(tasks: ProjectTask[]) {
    return [...tasks].sort((a, b) => {
      const pa = priorityOrder[a.priority || 'medium'];
      const pb = priorityOrder[b.priority || 'medium'];
      if (pa !== pb) return pb - pa;
      return 0;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white button-3d"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">마감일: {project.deadline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRewards(!showRewards)}
              className="rounded-xl border-2 border-gray-200 hover:border-coral-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              성과 보기
            </Button>
            {apiKey && (
              <Button
                variant="outline"
                onClick={() => setShowReprojectModal(true)}
                className="rounded-xl border-2 border-gray-200 hover:border-orange-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재분해
              </Button>
            )}
            <Button
              onClick={() => setShowAddTaskModal(true)}
              className="rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white border-0 button-3d"
            >
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>
          </div>
        </div>

        {/* 보상 시스템 */}
        {showRewards && (
          <div className="mb-8">
            <RewardSystem />
          </div>
        )}

        {/* Progress Section */}
        <ProgressBar
          completed={completedTasks}
          total={projectTasks.length}
          projectName={project.name}
        />

        {/* Tabs for different views */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-8"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white border-2 border-gray-200 p-1">
            <TabsTrigger
              value="calendar"
              className="rounded-xl flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              달력 뷰
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-xl flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              전체 작업
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="rounded-xl flex items-center gap-2"
            >
              <Users className="w-4 h-4" />팀 관리
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="rounded-xl flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              보상 시스템
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView
              projectId={project.id}
              tasks={projectTasks}
              onTaskUpdate={handleTaskUpdate}
              onDateSelect={setCurrentDate}
            />
            {currentDate && (
              <PostponeTasksModal
                projectId={project.id}
                currentDate={currentDate}
                onTasksPostponed={handleTasksPostponed}
              />
            )}
          </TabsContent>
          <TabsContent value="tasks" className="space-y-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              전체 작업 (날짜순)
            </h2>
            <div className="space-y-3">
              {sortByPriority(sortedTasks).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleTaskToggle}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="team" className="space-y-4">
            {isTeamProject ? (
              <TeamManagement
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                currentUserEmail={currentUser.email}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    팀 프로젝트가 아닙니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    이 프로젝트는 개인 프로젝트입니다. 팀 기능을 사용하려면 팀
                    프로젝트로 변환하세요.
                  </p>
                  {showTeamSelect ? (
                    <div className="space-y-4">
                      <Select
                        value={selectedTeamId}
                        onValueChange={setSelectedTeamId}
                      >
                        <SelectTrigger className="w-64 mx-auto">
                          <SelectValue placeholder="팀 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!selectedTeamId}
                        onClick={() => {
                          if (!project || !selectedTeamId) return;
                          convertToTeamProject(project.id, selectedTeamId);
                          // 프로젝트 정보 새로고침
                          const updatedProjects = getProjects();
                          const updatedProject = updatedProjects.find(
                            (p) => p.id === project.id
                          );
                          if (updatedProject) setProject(updatedProject);
                          setShowTeamSelect(false);
                          setSelectedTeamId('');
                          toast({
                            title: '팀 프로젝트로 변환 완료!',
                            description: '이제 팀 기능을 사용할 수 있습니다.',
                          });
                        }}
                        className="w-64"
                      >
                        팀 프로젝트로 변환
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowTeamSelect(true)}>
                      팀 프로젝트로 변환
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="rewards" className="space-y-4">
            <RewardSystem project={project} />
          </TabsContent>
        </Tabs>

        {/* 작업 추가 모달 */}
        <AddTaskModal
          projectId={project.id}
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onTaskAdded={handleTaskUpdate}
          createdBy={currentUser.id}
        />

        {/* 재분해 모달 */}
        {project && (
          <ReprojectModal
            isOpen={showReprojectModal}
            onClose={() => setShowReprojectModal(false)}
            project={project}
            apiKey={apiKey}
            onReproject={handleReproject}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
