export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  originalIndex: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  points?: number;
  isUserAdded?: boolean;
}

export interface ScheduleSettings {
  workDaysPerWeek: number;
  hoursPerDay: number;
  preferMorning: boolean;
  preferAfternoon: boolean;
  preferEvening: boolean;
  bufferDays: number;
}

const defaultSettings: ScheduleSettings = {
  workDaysPerWeek: 5,
  hoursPerDay: 4,
  preferMorning: true,
  preferAfternoon: true,
  preferEvening: false,
  bufferDays: 1,
};

export const scheduleTasksToDeadline = (
  tasks: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedHours: number;
  }>,
  deadlineStr: string,
  settings: ScheduleSettings = defaultSettings
): ScheduledTask[] => {
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 버퍼 일수를 고려한 실제 작업 가능 일수 계산
  const totalDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const availableDays = Math.max(1, totalDays - settings.bufferDays);

  if (availableDays <= 0) {
    throw new Error('마감일이 이미 지났거나 오늘입니다.');
  }

  // 주당 작업일 수를 고려한 실제 작업 가능 일수 계산
  const workDaysInPeriod = Math.floor(
    (availableDays / 7) * settings.workDaysPerWeek
  );
  const effectiveDays = Math.max(1, workDaysInPeriod);

  // 작업을 논리적 순서로 정렬
  const sortedTasks = sortTasksByLogicalOrder(tasks);

  const scheduledTasks: ScheduledTask[] = [];
  const totalTasks = sortedTasks.length;

  sortedTasks.forEach((task, index) => {
    // 작업을 고르게 분배하되, 논리적 순서 유지
    const dayIndex = Math.floor((index / totalTasks) * effectiveDays);
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + dayIndex);

    // 주말을 피해서 배치 (workDaysPerWeek가 5일인 경우)
    if (settings.workDaysPerWeek <= 5) {
      while (taskDate.getDay() === 0 || taskDate.getDay() === 6) {
        taskDate.setDate(taskDate.getDate() + 1);
      }
    }

    scheduledTasks.push({
      id: `task-${index}`,
      title: task.title,
      description: task.description,
      dueDate: taskDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
      completed: false,
      difficulty: task.difficulty,
      originalIndex: index,
      priority: 'medium',
      points: 0,
      isUserAdded: false,
    });
  });

  return scheduledTasks;
};

// 작업을 논리적 순서로 정렬하는 함수
const sortTasksByLogicalOrder = (
  tasks: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedHours: number;
  }>
) => {
  // 작업 유형별 우선순위 정의
  const taskPriorities = {
    // 환경 설정 및 준비 작업 (가장 먼저)
    setup: ['설치', '세팅', '환경', '준비', '계획', '분석', '조사', '수집'],

    // 설계 및 기획 작업
    design: ['설계', '기획', '와이어프레임', '구조', '개요', '아키텍처'],

    // 핵심 기능 구현 (기본부터)
    core: ['기능', '구현', '코딩', '개발', '작성', '만들기'],

    // UI/UX 작업
    ui: ['UI', '디자인', '스타일링', '화면', '버튼', '레이아웃'],

    // 테스트 및 검토
    test: ['테스트', '검토', '수정', '디버깅', '점검', '완성'],

    // 배포 및 정리
    deploy: ['배포', '업로드', '제출', '정리', '문서화', '완료'],
  };

  return [...tasks].sort((a, b) => {
    const getTaskPriority = (task: (typeof tasks)[0]) => {
      const title = task.title.toLowerCase();
      const description = task.description.toLowerCase();
      const text = `${title} ${description}`;

      // 각 우선순위 그룹별 점수 계산
      const scores = {
        setup: taskPriorities.setup.some((keyword) => text.includes(keyword))
          ? 1
          : 0,
        design: taskPriorities.design.some((keyword) => text.includes(keyword))
          ? 2
          : 0,
        core: taskPriorities.core.some((keyword) => text.includes(keyword))
          ? 3
          : 0,
        ui: taskPriorities.ui.some((keyword) => text.includes(keyword)) ? 4 : 0,
        test: taskPriorities.test.some((keyword) => text.includes(keyword))
          ? 5
          : 0,
        deploy: taskPriorities.deploy.some((keyword) => text.includes(keyword))
          ? 6
          : 0,
      };

      // 가장 높은 우선순위 반환
      const maxScore = Math.max(...Object.values(scores));
      return maxScore > 0 ? maxScore : 3; // 기본값은 core (3)
    };

    const priorityA = getTaskPriority(a);
    const priorityB = getTaskPriority(b);

    // 우선순위가 같으면 난이도로 정렬 (쉬운 것부터)
    if (priorityA === priorityB) {
      const difficultyWeight = { easy: 1, medium: 2, hard: 3 };
      return difficultyWeight[a.difficulty] - difficultyWeight[b.difficulty];
    }

    return priorityA - priorityB;
  });
};

export const rescheduleIncompleteTasks = (
  tasks: ScheduledTask[]
): ScheduledTask[] => {
  const today = new Date();
  const incompleteTasks = tasks.filter((task) => !task.completed);

  return tasks.map((task) => {
    if (!task.completed) {
      // 미완료 작업은 다음 날로 이동
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);

      return {
        ...task,
        dueDate: nextDay.toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        }),
      };
    }
    return task;
  });
};

// 같은 날짜의 작업들을 우선순위에 따라 재배치
export const sortTasksByPriority = (
  tasks: ScheduledTask[]
): ScheduledTask[] => {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  return [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority || 'medium'];
    const priorityB = priorityOrder[b.priority || 'medium'];

    // 우선순위가 같으면 원래 순서 유지
    if (priorityA === priorityB) {
      return a.originalIndex - b.originalIndex;
    }

    // 우선순위가 높은 것이 먼저
    return priorityB - priorityA;
  });
};

// 날짜별로 작업을 그룹화하고 각 그룹 내에서 우선순위에 따라 정렬
export const groupAndSortTasksByDate = (
  tasks: ScheduledTask[]
): Record<string, ScheduledTask[]> => {
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.dueDate]) acc[task.dueDate] = [];
    acc[task.dueDate].push(task);
    return acc;
  }, {} as Record<string, ScheduledTask[]>);

  // 각 날짜별로 우선순위에 따라 정렬
  Object.keys(tasksByDate).forEach((date) => {
    tasksByDate[date] = sortTasksByPriority(tasksByDate[date]);
  });

  return tasksByDate;
};
