import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createTeam,
  getTeams,
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  createInvitation,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  getUserTeams,
  addProjectToTeam,
  removeProjectFromTeam,
} from '@/utils/teamService';
import { getProjects, getProjectTasks } from '@/utils/projectService';
import {
  Team,
  TeamMember,
  TeamInvitation,
  Project,
  ProjectTask,
} from '@/types/project';
import {
  Plus,
  Users,
  Mail,
  Trash2,
  Crown,
  Shield,
  User,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  ExternalLink,
  CheckCircle,
  Circle,
  AlertCircle,
  Star,
} from 'lucide-react';

interface TeamManagementProps {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  currentUserId,
  currentUserName,
  currentUserEmail,
}) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState<string | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);

  // 폼 상태
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userTeams = getUserTeams(currentUserId);
    setTeams(userTeams);
    setInvitations(getInvitations());
    setProjects(getProjects());
  };

  const handleCreateTeam = () => {
    if (!newTeamData.name.trim()) return;

    const newTeam = createTeam({
      name: newTeamData.name,
      description: newTeamData.description,
      ownerId: currentUserId,
      ownerName: currentUserName,
      ownerEmail: currentUserEmail,
    });

    setTeams([...teams, newTeam]);
    setNewTeamData({ name: '', description: '' });
    setShowCreateTeam(false);
  };

  const handleInviteMember = (teamId: string) => {
    if (!inviteEmail.trim()) return;

    createInvitation({
      teamId,
      email: inviteEmail,
      invitedBy: currentUserId,
    });

    setInviteEmail('');
    setShowInviteMember(null);
    loadData();
  };

  const handleAcceptInvitation = (invitationId: string) => {
    acceptInvitation(invitationId, {
      id: currentUserId,
      name: currentUserName,
      email: currentUserEmail,
    });
    loadData();
  };

  const handleDeclineInvitation = (invitationId: string) => {
    declineInvitation(invitationId);
    loadData();
  };

  const handleAddProjectToTeam = (teamId: string) => {
    if (!selectedProjectId) return;

    addProjectToTeam(teamId, selectedProjectId);
    setSelectedProjectId('');
    setShowAddProject(null);
    loadData();
  };

  const handleRemoveProjectFromTeam = (teamId: string, projectId: string) => {
    removeProjectFromTeam(teamId, projectId);
    loadData();
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    removeTeamMember(teamId, memberId);
    loadData();
  };

  const handleUpdateMemberRole = (
    teamId: string,
    memberId: string,
    role: 'owner' | 'admin' | 'member'
  ) => {
    updateMemberRole(teamId, memberId, role);
    loadData();
  };

  const handleProjectClick = (project: Project) => {
    // 프로젝트 상세 페이지로 이동
    navigate(`/project/${project.id}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-orange-600';
      case 3:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Star className="w-3 h-3 fill-red-600 text-red-600" />;
      case 'high':
        return <Star className="w-3 h-3 fill-orange-600 text-orange-600" />;
      case 'medium':
        return <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTaskStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Circle className="w-4 h-4 text-gray-400" />
    );
  };

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === 'pending' && inv.email === currentUserEmail
  );

  return (
    <div className="space-y-6">
      {/* 초대 알림 */}
      {pendingInvitations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">새로운 팀 초대</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map((invitation) => {
              const team = teams.find((t) => t.id === invitation.teamId);
              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {team?.name || '알 수 없는 팀'}
                    </p>
                    <p className="text-sm text-gray-600">
                      초대자: {invitation.invitedBy}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                    >
                      수락
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                    >
                      거절
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 팀 생성 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">내 팀</h2>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />새 팀 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 팀 만들기</DialogTitle>
              <DialogDescription>
                새로운 팀을 생성하고 멤버들을 초대하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">팀 이름</Label>
                <Input
                  id="teamName"
                  value={newTeamData.name}
                  onChange={(e) =>
                    setNewTeamData({ ...newTeamData, name: e.target.value })
                  }
                  placeholder="팀 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">팀 설명</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeamData.description}
                  onChange={(e) =>
                    setNewTeamData({
                      ...newTeamData,
                      description: e.target.value,
                    })
                  }
                  placeholder="팀에 대한 설명을 입력하세요"
                />
              </div>
              <Button onClick={handleCreateTeam} className="w-full">
                팀 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 팀 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {team.name}
              </CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 멤버 목록 */}
              <div>
                <h4 className="font-medium mb-2">
                  멤버 ({team.members.length})
                </h4>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role}</span>
                        </Badge>
                      </div>
                      {team.ownerId === currentUserId &&
                        member.id !== currentUserId && (
                          <div className="flex gap-1">
                            <Select
                              value={member.role}
                              onValueChange={(
                                value: 'owner' | 'admin' | 'member'
                              ) =>
                                handleUpdateMemberRole(
                                  team.id,
                                  member.id,
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-20 h-6">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">멤버</SelectItem>
                                <SelectItem value="admin">관리자</SelectItem>
                                <SelectItem value="owner">소유자</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveMember(team.id, member.id)
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 프로젝트 목록 */}
              <div>
                <h4 className="font-medium mb-2">
                  프로젝트 ({team.projects.length})
                </h4>
                <div className="space-y-3">
                  {team.projects.map((projectId) => {
                    const project = projects.find((p) => p.id === projectId);
                    return project ? (
                      <Card
                        key={projectId}
                        className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleProjectClick(project)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                <h5 className="font-medium text-sm">
                                  {project.name}
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  {project.totalTasks > 0
                                    ? `${project.completedTasks}/${project.totalTasks}`
                                    : '작업 없음'}
                                </Badge>
                              </div>

                              {/* 진행률 */}
                              {project.totalTasks > 0 && (
                                <div className="mb-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>진행률</span>
                                    <span>
                                      {Math.round(
                                        (project.completedTasks /
                                          project.totalTasks) *
                                          100
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      (project.completedTasks /
                                        project.totalTasks) *
                                      100
                                    }
                                    className="h-2"
                                  />
                                </div>
                              )}

                              {/* 프로젝트 정보 */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    마감일:{' '}
                                    {new Date(
                                      project.deadline
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>
                                    포인트: {project.earnedPoints}/
                                    {project.totalPoints}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    생성일:{' '}
                                    {new Date(
                                      project.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    멤버: {project.members?.length || 0}명
                                  </span>
                                </div>
                              </div>

                              {/* 레벨 및 칭호 */}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  Lv.{project.level}
                                </Badge>
                                {project.badges &&
                                  project.badges.length > 0 && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                      {String(project.badges[0])}
                                      {project.badges.length > 1 &&
                                        ` +${project.badges.length - 1}`}
                                    </Badge>
                                  )}
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex flex-col gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/project/${project.id}`,
                                    '_blank'
                                  );
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                              {team.ownerId === currentUserId && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveProjectFromTeam(
                                      team.id,
                                      projectId
                                    );
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div
                        key={projectId}
                        className="p-2 bg-gray-50 rounded text-sm text-gray-500"
                      >
                        삭제된 프로젝트
                      </div>
                    );
                  })}

                  {team.projects.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>아직 프로젝트가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <Dialog
                  open={showInviteMember === team.id}
                  onOpenChange={(open) =>
                    setShowInviteMember(open ? team.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-1" />
                      멤버 초대
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>멤버 초대</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="inviteEmail">이메일</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="초대할 멤버의 이메일을 입력하세요"
                        />
                      </div>
                      <Button
                        onClick={() => handleInviteMember(team.id)}
                        className="w-full"
                      >
                        초대 보내기
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showAddProject === team.id}
                  onOpenChange={(open) =>
                    setShowAddProject(open ? team.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      프로젝트 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>프로젝트 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="projectSelect">프로젝트 선택</Label>
                        <Select
                          value={selectedProjectId}
                          onValueChange={setSelectedProjectId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="프로젝트를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects
                              .filter(
                                (project) => !team.projects.includes(project.id)
                              )
                              .map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => handleAddProjectToTeam(team.id)}
                        className="w-full"
                      >
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">아직 팀이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              팀을 생성하고 멤버들과 함께 프로젝트를 관리해보세요.
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />첫 번째 팀 만들기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
