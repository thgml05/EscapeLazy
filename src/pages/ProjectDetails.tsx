import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CalendarView } from '@/components/CalendarView';
import {
  getProjects,
  getProjectTasks,
  updateTaskStatus,
  saveProjectTasks,
  updateTaskDueDate,
  updateTask,
  deleteTask,
} from '@/utils/projectService';
import { Project, ProjectTask } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, List } from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';

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
    const currentProject = projects.find((p) => p.id === projectId);

    if (!currentProject) {
      navigate('/');
      return;
    }

    setProject(currentProject);
    const tasks = getProjectTasks(projectId);
    setProjectTasks(tasks);
  }, [projectId, navigate]);

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = projectTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setProjectTasks(updatedTasks);
    updateTaskStatus(
      taskId,
      !projectTasks.find((t) => t.id === taskId)?.completed
    );

    const completedTask = updatedTasks.find((t) => t.id === taskId);
    if (completedTask?.completed) {
      toast({
        title: '훌륭해요! 🎉',
        description: `"${completedTask.title}" 완료!`,
      });
    }
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

  // 날짜별 그룹핑
  const tasksByDate = projectTasks.reduce((acc, task) => {
    if (!acc[task.dueDate]) acc[task.dueDate] = [];
    acc[task.dueDate].push(task);
    return acc;
  }, {} as Record<string, ProjectTask[]>);
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

  // 전체 작업 날짜순 정렬
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
    return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
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
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white border-2 border-gray-200 p-1">
            <TabsTrigger
              value="bydate"
              className="rounded-xl flex items-center gap-2"
            >
              📅 날짜별 보기
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-xl flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              전체 작업
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-xl flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              달력 뷰
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bydate" className="mt-6">
            <DragDropContext onDragEnd={handleByDateDragEnd}>
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <Droppable droppableId={date} key={date}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`mb-8 p-4 rounded-2xl border-2 ${
                          snapshot.isDraggingOver
                            ? 'border-coral-400 bg-coral-50'
                            : 'border-gray-200 bg-white/90'
                        }`}
                      >
                        <div className="font-bold text-lg text-coral-700 mb-2">
                          {date}
                        </div>
                        <div className="space-y-2">
                          {tasksByDate[date].map((task, idx) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={idx}
                            >
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`transition-all ${
                                    snap.isDragging ? 'scale-105 shadow-lg' : ''
                                  }`}
                                >
                                  <TaskCard
                                    task={task}
                                    onToggle={handleTaskToggle}
                                    onEdit={handleTaskEdit}
                                    onDelete={handleTaskDelete}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </TabsContent>
          <TabsContent value="tasks" className="space-y-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              전체 작업 (날짜순)
            </h2>
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleTaskToggle}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                />
              ))}
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
