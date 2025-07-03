import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectSelector } from '@/components/ProjectSelector';
import { QuickStartTemplates } from '@/components/QuickStartTemplates';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { RewardSystem } from '@/components/RewardSystem';
import { TeamManagement } from '@/components/TeamManagement';
import {
  getProjects,
  saveProject,
  syncProjectProgress,
} from '@/utils/projectService';
import { getUserTeams } from '@/utils/teamService';
import { Project } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Trophy,
  Users,
  Settings,
  User,
} from 'lucide-react';

export const Index: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [apiKey, setApiKey] = useState('');

  // 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const [currentUser, setCurrentUser] = useState({
    id: 'user-1',
    name: '사용자',
    email: 'user@example.com',
  });

  useEffect(() => {
    loadProjects();
    loadUserInfo();
  }, []);

  const loadProjects = () => {
    const projectData = getProjects();
    setProjects(projectData);
  };

  const loadUserInfo = () => {
    // 로컬 스토리지에서 사용자 정보 로드
    const savedUser = localStorage.getItem('escape_lazy_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  };

  const saveUserInfo = (userInfo: any) => {
    localStorage.setItem('escape_lazy_user', JSON.stringify(userInfo));
    setCurrentUser(userInfo);
  };

  const handleCreateProject = (projectData: {
    name: string;
    description: string;
    deadline: string;
    goalDescription?: string;
    specialNotes?: string;
  }) => {
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: projectData.name,
      deadline: projectData.deadline,
      createdAt: new Date().toISOString(),
      completedTasks: 0,
      totalTasks: 0,
      totalPoints: 0,
      earnedPoints: 0,
      level: 1,
      badges: [],
      ownerId: currentUser.id,
      members: [],
    };

    saveProject(newProject);
    setProjects([...projects, newProject]);

    toast({
      title: '프로젝트 생성 완료!',
      description: `${projectData.name} 프로젝트가 성공적으로 생성되었습니다.`,
    });

    // 프로젝트 상세 페이지로 이동
    navigate(`/project/${newProject.id}`);
  };

  const handleProjectSelect = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getTotalProgress = () => {
    if (projects.length === 0) return 0;
    const totalTasks = projects.reduce((sum, p) => sum + p.totalTasks, 0);
    const completedTasks = projects.reduce(
      (sum, p) => sum + p.completedTasks,
      0
    );
    return totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);
  };

  const getTotalPoints = () => {
    return projects.reduce((sum, p) => sum + p.earnedPoints, 0);
  };

  const getTotalLevel = () => {
    if (projects.length === 0) return 1;
    const totalLevel = projects.reduce((sum, p) => sum + p.level, 0);
    return Math.round(totalLevel / projects.length);
  };

  const userTeams = getUserTeams(currentUser.id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            안녕하세요, {currentUser.name}님! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 목표를 향해 한 걸음씩 나아가보세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowApiKeyModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              전체 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalProgress()}%</div>
            <Progress value={getTotalProgress()} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {projects.reduce((sum, p) => sum + p.completedTasks, 0)} /{' '}
              {projects.reduce((sum, p) => sum + p.totalTasks, 0)} 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              활성 프로젝트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">진행 중인 프로젝트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              총 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {getTotalPoints()}
            </div>
            <p className="text-xs text-gray-600 mt-1">획득한 포인트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              평균 레벨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Lv.{getTotalLevel()}
            </div>
            <p className="text-xs text-gray-600 mt-1">프로젝트 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            프로젝트
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />팀 관리
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            보상 시스템
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            프로필
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">내 프로젝트</h2>
            <Button onClick={() => setActiveTab('projects')}>
              <Plus className="w-4 h-4 mr-2" />새 프로젝트
            </Button>
          </div>

          <ProjectSelector
            projects={projects}
            selectedProject={null}
            onSelectProject={(project) =>
              project && handleProjectSelect(project.id)
            }
            onDeleteProject={(projectId) => {
              // 삭제 로직 구현
              console.log('Delete project:', projectId);
            }}
            onNewProject={() => {
              // 새 프로젝트 생성 로직
              console.log('Create new project');
            }}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamManagement
            currentUserId={currentUser.id}
            currentUserName={currentUser.name}
            currentUserEmail={currentUser.email}
          />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardSystem />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                프로필 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userName">이름</Label>
                <Input
                  id="userName"
                  value={currentUser.name}
                  onChange={(e) =>
                    saveUserInfo({ ...currentUser, name: e.target.value })
                  }
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">이메일</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    saveUserInfo({ ...currentUser, email: e.target.value })
                  }
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="userBio">자기소개</Label>
                <Textarea
                  id="userBio"
                  placeholder="자기소개를 입력하세요"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API 키 모달 */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={setApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
};
