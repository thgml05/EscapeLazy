
export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  originalIndex: number;
}

export const scheduleTasksToDeadline = (
  tasks: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedHours: number;
  }>,
  deadlineStr: string
): ScheduledTask[] => {
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline <= 0) {
    throw new Error('마감일이 이미 지났거나 오늘입니다.');
  }
  
  const scheduledTasks: ScheduledTask[] = [];
  const totalTasks = tasks.length;
  
  tasks.forEach((task, index) => {
    // 작업을 고르게 분배
    const dayIndex = Math.floor((index / totalTasks) * daysUntilDeadline);
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + dayIndex);
    
    scheduledTasks.push({
      id: `task-${index}`,
      title: task.title,
      description: task.description,
      dueDate: taskDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }),
      completed: false,
      difficulty: task.difficulty,
      originalIndex: index
    });
  });
  
  return scheduledTasks;
};

export const rescheduleIncompleteTasks = (tasks: ScheduledTask[]): ScheduledTask[] => {
  const today = new Date();
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  return tasks.map(task => {
    if (!task.completed) {
      // 미완료 작업은 다음 날로 이동
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      
      return {
        ...task,
        dueDate: nextDay.toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        })
      };
    }
    return task;
  });
};
