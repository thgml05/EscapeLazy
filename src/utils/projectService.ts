import { Project, ProjectTask } from '@/types/project';
import {
  updateStatsOnTaskComplete,
  calculateTaskPoints,
} from './rewardService';
import { addProjectToTeam } from './teamService';

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }

  localStorage.setItem('escape_lazy_projects', JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  const projects = localStorage.getItem('escape_lazy_projects');
  return projects ? JSON.parse(projects) : [];
};

export const getProjectById = (projectId: string): Project | null => {
  const projects = getProjects();
  return projects.find((project) => project.id === projectId) || null;
};

export const deleteProject = (projectId: string): void => {
  const projects = getProjects().filter((p) => p.id !== projectId);
  localStorage.setItem('escape_lazy_projects', JSON.stringify(projects));

  // 해당 프로젝트의 작업들도 삭제
  const tasks = getProjectTasks();
  const filteredTasks = tasks.filter((t) => t.projectId !== projectId);
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(filteredTasks)
  );
};

export const saveProjectTasks = (
  projectId: string,
  tasks: ProjectTask[]
): void => {
  const allTasks = getProjectTasks();
  const filteredTasks = allTasks.filter((t) => t.projectId !== projectId);
  const newTasks = [...filteredTasks, ...tasks];
  localStorage.setItem('escape_lazy_project_tasks', JSON.stringify(newTasks));
};

export const getProjectTasks = (projectId?: string): ProjectTask[] => {
  const tasks = localStorage.getItem('escape_lazy_project_tasks');
  const allTasks = tasks ? JSON.parse(tasks) : [];
  return projectId
    ? allTasks.filter((t: ProjectTask) => t.projectId === projectId)
    : allTasks;
};

export const updateTaskStatus = (taskId: string, completed: boolean): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed } : task
  );
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

export const updateTaskDueDate = (taskId: string, dueDate: string): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, dueDate } : task
  );
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

export const updateTask = (
  taskId: string,
  updates: Partial<ProjectTask>
): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

export const deleteTask = (taskId: string): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

// 새로운 기능: 사용자가 작업 추가
export const addUserTask = (
  projectId: string,
  taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy?: string;
  }
): ProjectTask => {
  const newTask: ProjectTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    title: taskData.title,
    description: taskData.description,
    dueDate: taskData.dueDate,
    completed: false,
    difficulty: taskData.difficulty,
    priority: taskData.priority,
    points: 0, // 포인트는 완료 시 계산
    isUserAdded: true,
    originalIndex: 0,
    createdBy: taskData.createdBy || 'user',
  };

  // 포인트 계산
  newTask.points = calculateTaskPoints(newTask);

  const tasks = getProjectTasks();
  tasks.push(newTask);
  localStorage.setItem('escape_lazy_project_tasks', JSON.stringify(tasks));

  return newTask;
};

// 새로운 기능: 작업 우선순위 수정
export const updateTaskPriority = (
  taskId: string,
  priority: 'low' | 'medium' | 'high' | 'critical'
): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      const updatedTask = { ...task, priority };
      // 우선순위 변경 시 포인트 재계산
      updatedTask.points = calculateTaskPoints(updatedTask);
      return updatedTask;
    }
    return task;
  });

  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

// 새로운 기능: 작업 완료 시 보상 시스템 통합
export const completeTaskWithRewards = (
  taskId: string,
  projectId: string
): {
  points: number;
  newBadges: any[];
  newLevel: number;
  streakDays: number;
} | null => {
  const tasks = getProjectTasks();
  const task = tasks.find((t) => t.id === taskId);
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!task || !project) return null;

  // 작업 완료 상태 업데이트
  const updatedTasks = tasks.map((t) =>
    t.id === taskId ? { ...t, completed: true } : t
  );
  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );

  // 보상 시스템 업데이트
  const rewardResult = updateStatsOnTaskComplete(task, project);

  // 프로젝트 진행률 업데이트
  const projectTasks = updatedTasks.filter((t) => t.projectId === projectId);
  const completedTasks = projectTasks.filter((t) => t.completed).length;
  const updatedProject = {
    ...project,
    completedTasks,
    totalTasks: projectTasks.length,
  };
  saveProject(updatedProject);

  return rewardResult;
};

export const syncProjectProgress = (): void => {
  const projects = getProjects();
  const allTasks = getProjectTasks();
  const updatedProjects = projects.map((project) => {
    const tasks = allTasks.filter((t) => t.projectId === project.id);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;

    // 포인트 계산 추가
    const totalPoints = tasks.reduce(
      (sum, task) => sum + (task.points || 0),
      0
    );
    const earnedPoints = tasks
      .filter((t) => t.completed)
      .reduce((sum, task) => sum + (task.points || 0), 0);

    return {
      ...project,
      totalTasks,
      completedTasks,
      totalPoints,
      earnedPoints,
    };
  });
  localStorage.setItem('escape_lazy_projects', JSON.stringify(updatedProjects));
};

// 새로운 기능: 프로젝트 정보 업데이트
export const updateProject = (
  projectId: string,
  updates: Partial<Project>
): void => {
  const projects = getProjects();
  const updatedProjects = projects.map((project) =>
    project.id === projectId ? { ...project, ...updates } : project
  );
  localStorage.setItem('escape_lazy_projects', JSON.stringify(updatedProjects));
};

// 새로운 기능: 미완료 작업을 다른 날짜로 미루기
export const postponeIncompleteTasks = (
  projectId: string,
  fromDate: string,
  toDate: string
): void => {
  const tasks = getProjectTasks(projectId);
  const updatedTasks = tasks.map((task) => {
    if (task.dueDate === fromDate && !task.completed) {
      return { ...task, dueDate: toDate };
    }
    return task;
  });

  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

// 새로운 기능: 특정 날짜의 미완료 작업들을 다음 날로 미루기
export const postponeTasksToNextDay = (
  projectId: string,
  date: string
): void => {
  const tasks = getProjectTasks(projectId);
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() + 1);
  const nextDay = targetDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const updatedTasks = tasks.map((task) => {
    if (task.dueDate === date && !task.completed) {
      return { ...task, dueDate: nextDay };
    }
    return task;
  });

  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

// 새로운 기능: 모든 미완료 작업을 다음 가능한 날짜로 미루기
export const postponeAllIncompleteTasks = (projectId: string): void => {
  const tasks = getProjectTasks(projectId);
  const today = new Date();
  const incompleteTasks = tasks.filter((task) => !task.completed);

  if (incompleteTasks.length === 0) return;

  // 다음 가능한 날짜 계산 (주말 제외)
  let nextAvailableDate = new Date(today);
  nextAvailableDate.setDate(today.getDate() + 1);

  while (nextAvailableDate.getDay() === 0 || nextAvailableDate.getDay() === 6) {
    nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
  }

  const nextDateString = nextAvailableDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const updatedTasks = tasks.map((task) => {
    if (!task.completed) {
      return { ...task, dueDate: nextDateString };
    }
    return task;
  });

  localStorage.setItem(
    'escape_lazy_project_tasks',
    JSON.stringify(updatedTasks)
  );
};

// 프로젝트를 팀 프로젝트로 변환
export const convertToTeamProject = (
  projectId: string,
  teamId: string
): void => {
  // 1. 프로젝트 정보 업데이트
  const projects = getProjects();
  const updatedProjects = projects.map((p) =>
    p.id === projectId ? { ...p, teamId, isTeamProject: true } : p
  );
  localStorage.setItem('escape_lazy_projects', JSON.stringify(updatedProjects));

  // 2. 팀 정보 업데이트
  addProjectToTeam(teamId, projectId);
};

// 단계별 체크리스트 상태 업데이트
export function updateTaskChecklist(
  taskId: string,
  checklist: { label: string; completed: boolean }[]
) {
  const tasks = getProjectTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].checklist = checklist;
    // 전체 완료 여부도 동기화
    tasks[idx].completed =
      checklist.length > 0 && checklist.every((item) => item.completed);
    saveProjectTasks(tasks[idx].projectId, tasks);
  }
}
