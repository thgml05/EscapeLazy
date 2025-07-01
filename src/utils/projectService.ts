
import { Project, ProjectTask } from '@/types/project';

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
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

export const deleteProject = (projectId: string): void => {
  const projects = getProjects().filter(p => p.id !== projectId);
  localStorage.setItem('escape_lazy_projects', JSON.stringify(projects));
  
  // 해당 프로젝트의 작업들도 삭제
  const tasks = getProjectTasks();
  const filteredTasks = tasks.filter(t => t.projectId !== projectId);
  localStorage.setItem('escape_lazy_project_tasks', JSON.stringify(filteredTasks));
};

export const saveProjectTasks = (projectId: string, tasks: ProjectTask[]): void => {
  const allTasks = getProjectTasks();
  const filteredTasks = allTasks.filter(t => t.projectId !== projectId);
  const newTasks = [...filteredTasks, ...tasks];
  localStorage.setItem('escape_lazy_project_tasks', JSON.stringify(newTasks));
};

export const getProjectTasks = (projectId?: string): ProjectTask[] => {
  const tasks = localStorage.getItem('escape_lazy_project_tasks');
  const allTasks = tasks ? JSON.parse(tasks) : [];
  return projectId ? allTasks.filter((t: ProjectTask) => t.projectId === projectId) : allTasks;
};

export const updateTaskStatus = (taskId: string, completed: boolean): void => {
  const tasks = getProjectTasks();
  const updatedTasks = tasks.map(task => 
    task.id === taskId ? { ...task, completed } : task
  );
  localStorage.setItem('escape_lazy_project_tasks', JSON.stringify(updatedTasks));
};
