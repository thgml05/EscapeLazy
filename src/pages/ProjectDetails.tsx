
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CalendarView } from '@/components/CalendarView';
import { getProjects, getProjectTasks, updateTaskStatus } from '@/utils/projectService';
import { Project, ProjectTask } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, List } from 'lucide-react';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    const projects = getProjects();
    const currentProject = projects.find(p => p.id === projectId);
    
    if (!currentProject) {
      navigate('/');
      return;
    }

    setProject(currentProject);
    const tasks = getProjectTasks(projectId);
    setProjectTasks(tasks);
  }, [projectId, navigate]);

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = projectTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setProjectTasks(updatedTasks);
    updateTaskStatus(taskId, !projectTasks.find(t => t.id === taskId)?.completed);
    
    const completedTask = updatedTasks.find(t => t.id === taskId);
    if (completedTask?.completed) {
      toast({
        title: "훌륭해요! 🎉",
        description: `"${completedTask.title}" 완료!`,
      });
    }
  };

  const todayTasks = projectTasks.filter(task => {
    const today = new Date();
    const todayString = today.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
    return task.dueDate === todayString;
  });

  const completedTasks = projectTasks.filter(task => task.completed).length;

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">마감일: {project.deadline}</p>
          </div>
        </div>

        {/* Progress Section */}
        <ProgressBar
          completed={completedTasks}
          total={projectTasks.length}
          projectName={project.name}
        />

        {/* Tabs for different views */}
        <Tabs defaultValue="tasks" className="w-full mt-8">
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
    </div>
  );
};

export default ProjectDetails;
