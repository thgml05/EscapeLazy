
export interface Project {
  id: string;
  name: string;
  deadline: string;
  createdAt: string;
  completedTasks: number;
  totalTasks: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  originalIndex: number;
}
