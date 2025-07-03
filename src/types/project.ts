export interface Project {
  id: string;
  name: string;
  deadline: string;
  createdAt: string;
  completedTasks: number;
  totalTasks: number;
  totalPoints: number;
  earnedPoints: number;
  level: number;
  badges: Badge[];
  isTeamProject?: boolean;
  teamId?: string;
  ownerId: string;
  members: TeamMember[];
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
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  isUserAdded?: boolean;
  assignedTo?: string;
  createdBy: string;
  checklist?: { label: string; completed: boolean }[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  ownerId: string;
  members: TeamMember[];
  projects: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  avatar?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'achievement' | 'streak' | 'milestone' | 'special';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  currentLevel: number;
  badges: Badge[];
  achievements: Achievement[];
  streakDays: number;
  lastCompletedDate?: string;
  teamProjects: number;
  teamTasks: number;
}
