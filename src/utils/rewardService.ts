import {
  Badge,
  Achievement,
  UserStats,
  Project,
  ProjectTask,
} from '@/types/project';

// 기본 칭호 데이터
export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first-task',
    name: '첫 걸음',
    description: '첫 번째 작업을 완료했습니다!',
    icon: '🎯',
    earnedAt: '',
    category: 'achievement',
  },
  {
    id: 'first-project',
    name: '프로젝트 마스터',
    description: '첫 번째 프로젝트를 완료했습니다!',
    icon: '🏆',
    earnedAt: '',
    category: 'milestone',
  },
  {
    id: 'streak-3',
    name: '열정의 불꽃',
    description: '3일 연속으로 작업을 완료했습니다!',
    icon: '🔥',
    earnedAt: '',
    category: 'streak',
  },
  {
    id: 'streak-7',
    name: '일주일의 전사',
    description: '7일 연속으로 작업을 완료했습니다!',
    icon: '⚡',
    earnedAt: '',
    category: 'streak',
  },
  {
    id: 'high-priority',
    name: '우선순위 마스터',
    description: '높은 우선순위 작업을 완료했습니다!',
    icon: '⭐',
    earnedAt: '',
    category: 'achievement',
  },
  {
    id: 'user-added',
    name: '창의적 사고',
    description: '직접 추가한 작업을 완료했습니다!',
    icon: '💡',
    earnedAt: '',
    category: 'special',
  },
];

// 업적 데이터
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'complete-10-tasks',
    name: '작업 완료자',
    description: '10개의 작업을 완료했습니다',
    icon: '✅',
    points: 50,
    condition: '10개 작업 완료',
    unlocked: false,
  },
  {
    id: 'complete-50-tasks',
    name: '작업 마스터',
    description: '50개의 작업을 완료했습니다',
    icon: '🎖️',
    points: 200,
    condition: '50개 작업 완료',
    unlocked: false,
  },
  {
    id: 'complete-project',
    name: '프로젝트 완성자',
    description: '프로젝트를 완료했습니다',
    icon: '🏁',
    points: 100,
    condition: '프로젝트 완료',
    unlocked: false,
  },
  {
    id: 'high-priority-complete',
    name: '중요도 관리자',
    description: '높은 우선순위 작업을 완료했습니다',
    icon: '🎯',
    points: 75,
    condition: '높은 우선순위 작업 완료',
    unlocked: false,
  },
  {
    id: 'user-task-complete',
    name: '자기주도형',
    description: '직접 추가한 작업을 완료했습니다',
    icon: '💪',
    points: 60,
    condition: '사용자 추가 작업 완료',
    unlocked: false,
  },
];

// 사용자 통계 관리
export const getUserStats = (): UserStats => {
  const saved = localStorage.getItem('user_stats');
  if (saved) {
    return JSON.parse(saved);
  }

  return {
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalPoints: 0,
    currentLevel: 1,
    badges: [],
    achievements: [...DEFAULT_ACHIEVEMENTS],
    streakDays: 0,
  };
};

export const saveUserStats = (stats: UserStats) => {
  localStorage.setItem('user_stats', JSON.stringify(stats));
};

// 포인트 계산
export const calculateTaskPoints = (task: ProjectTask): number => {
  let basePoints = 10;

  // 난이도에 따른 포인트
  switch (task.difficulty) {
    case 'easy':
      basePoints = 10;
      break;
    case 'medium':
      basePoints = 20;
      break;
    case 'hard':
      basePoints = 30;
      break;
  }

  // 우선순위에 따른 보너스
  switch (task.priority) {
    case 'low':
      basePoints *= 0.8;
      break;
    case 'medium':
      basePoints *= 1.0;
      break;
    case 'high':
      basePoints *= 1.5;
      break;
    case 'critical':
      basePoints *= 2.0;
      break;
  }

  // 사용자가 추가한 작업 보너스
  if (task.isUserAdded) {
    basePoints *= 1.2;
  }

  return Math.round(basePoints);
};

// 레벨 계산
export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / 100) + 1;
};

// 칭호 획득 체크
export const checkBadgeEligibility = (
  stats: UserStats,
  task: ProjectTask
): Badge[] => {
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  // 첫 작업 완료
  if (stats.completedTasks === 1) {
    const firstTaskBadge = DEFAULT_BADGES.find((b) => b.id === 'first-task');
    if (firstTaskBadge && !stats.badges.find((b) => b.id === 'first-task')) {
      newBadges.push({ ...firstTaskBadge, earnedAt: now });
    }
  }

  // 높은 우선순위 작업 완료
  if (task.priority === 'high' || task.priority === 'critical') {
    const highPriorityBadge = DEFAULT_BADGES.find(
      (b) => b.id === 'high-priority'
    );
    if (
      highPriorityBadge &&
      !stats.badges.find((b) => b.id === 'high-priority')
    ) {
      newBadges.push({ ...highPriorityBadge, earnedAt: now });
    }
  }

  // 사용자가 추가한 작업 완료
  if (task.isUserAdded) {
    const userAddedBadge = DEFAULT_BADGES.find((b) => b.id === 'user-added');
    if (userAddedBadge && !stats.badges.find((b) => b.id === 'user-added')) {
      newBadges.push({ ...userAddedBadge, earnedAt: now });
    }
  }

  return newBadges;
};

// 업적 체크
export const checkAchievementEligibility = (
  stats: UserStats
): Achievement[] => {
  const updatedAchievements = [...stats.achievements];
  const now = new Date().toISOString();

  // 10개 작업 완료
  if (stats.completedTasks >= 10) {
    const achievement = updatedAchievements.find(
      (a) => a.id === 'complete-10-tasks'
    );
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = now;
    }
  }

  // 50개 작업 완료
  if (stats.completedTasks >= 50) {
    const achievement = updatedAchievements.find(
      (a) => a.id === 'complete-50-tasks'
    );
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = now;
    }
  }

  return updatedAchievements;
};

// 연속 완료 체크
export const updateStreak = (stats: UserStats): number => {
  const today = new Date().toDateString();
  const lastCompleted = stats.lastCompletedDate
    ? new Date(stats.lastCompletedDate).toDateString()
    : null;

  if (lastCompleted === today) {
    return stats.streakDays; // 이미 오늘 완료했음
  }

  if (
    lastCompleted === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  ) {
    // 어제 완료했으면 연속 증가
    return stats.streakDays + 1;
  } else {
    // 연속이 끊어짐
    return 1;
  }
};

// 작업 완료 시 통계 업데이트
export const updateStatsOnTaskComplete = (
  task: ProjectTask,
  project: Project
) => {
  const stats = getUserStats();
  const points = calculateTaskPoints(task);

  // 기본 통계 업데이트
  stats.completedTasks += 1;
  stats.totalPoints += points;
  stats.currentLevel = calculateLevel(stats.totalPoints);
  stats.lastCompletedDate = new Date().toISOString();
  stats.streakDays = updateStreak(stats);

  // 칭호 체크
  const newBadges = checkBadgeEligibility(stats, task);
  stats.badges.push(...newBadges);

  // 업적 체크
  stats.achievements = checkAchievementEligibility(stats);

  // 프로젝트 완료 체크
  const projectTasks = JSON.parse(
    localStorage.getItem(`project_tasks_${project.id}`) || '[]'
  );
  const completedProjectTasks = projectTasks.filter(
    (t: ProjectTask) => t.completed
  ).length;

  if (
    completedProjectTasks === projectTasks.length &&
    projectTasks.length > 0
  ) {
    // 프로젝트 완료
    stats.completedProjects += 1;
    const projectAchievement = stats.achievements.find(
      (a) => a.id === 'complete-project'
    );
    if (projectAchievement && !projectAchievement.unlocked) {
      projectAchievement.unlocked = true;
      projectAchievement.unlockedAt = new Date().toISOString();
    }
  }

  saveUserStats(stats);

  return {
    points,
    newBadges,
    newLevel: stats.currentLevel,
    streakDays: stats.streakDays,
  };
};

// 우선순위별 색상 및 라벨
export const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'low':
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: '낮음',
        icon: '🔽',
      };
    case 'medium':
      return {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        label: '보통',
        icon: '➡️',
      };
    case 'high':
      return {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        label: '높음',
        icon: '🔼',
      };
    case 'critical':
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        label: '긴급',
        icon: '🚨',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: '보통',
        icon: '➡️',
      };
  }
};
