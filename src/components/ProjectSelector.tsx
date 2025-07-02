import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { Trash2, Calendar, Target, Plus } from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
}

export const ProjectSelector = ({
  projects,
  selectedProject,
  onSelectProject,
  onDeleteProject,
  onNewProject,
}: ProjectSelectorProps) => {
  return (
    <Card className="p-6 rounded-3xl border-2 border-gray-200 shadow-large bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">프로젝트</h3>
        <Button
          variant="outline"
          onClick={onNewProject}
          className="rounded-xl border-2 border-gray-200 hover:bg-gray-50 button-3d"
        >
          <Plus className="w-4 h-4 mr-2" />새 프로젝트
        </Button>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            아직 생성된 프로젝트가 없습니다.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 card-3d ${
                selectedProject?.id === project.id
                  ? 'border-coral-400 bg-coral-50'
                  : 'border-gray-200 bg-white hover:border-coral-300'
              }`}
              onClick={() => onSelectProject(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(project.deadline).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>
                        {project.completedTasks}/{project.totalTasks}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      진행률:{' '}
                      {project.totalTasks > 0
                        ? Math.round(
                            (project.completedTasks / project.totalTasks) * 100
                          )
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
