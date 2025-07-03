import { Team, TeamMember, TeamInvitation, Project } from '@/types/project';

// 팀 관리
export const createTeam = (teamData: {
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}): Team => {
  const newTeam: Team = {
    id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: teamData.name,
    description: teamData.description,
    createdAt: new Date().toISOString(),
    ownerId: teamData.ownerId,
    members: [
      {
        id: teamData.ownerId,
        name: teamData.ownerName,
        email: teamData.ownerEmail,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
    projects: [],
  };

  const teams = getTeams();
  teams.push(newTeam);
  localStorage.setItem('escape_lazy_teams', JSON.stringify(teams));

  return newTeam;
};

export const getTeams = (): Team[] => {
  const teams = localStorage.getItem('escape_lazy_teams');
  return teams ? JSON.parse(teams) : [];
};

export const getTeamById = (teamId: string): Team | null => {
  const teams = getTeams();
  return teams.find((team) => team.id === teamId) || null;
};

export const updateTeam = (teamId: string, updates: Partial<Team>): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) =>
    team.id === teamId ? { ...team, ...updates } : team
  );
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

export const deleteTeam = (teamId: string): void => {
  const teams = getTeams().filter((team) => team.id !== teamId);
  localStorage.setItem('escape_lazy_teams', JSON.stringify(teams));
};

// 멤버 관리
export const addTeamMember = (
  teamId: string,
  member: Omit<TeamMember, 'joinedAt'>
): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) => {
    if (team.id === teamId) {
      const newMember: TeamMember = {
        ...member,
        joinedAt: new Date().toISOString(),
      };
      return {
        ...team,
        members: [...team.members, newMember],
      };
    }
    return team;
  });
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

export const removeTeamMember = (teamId: string, memberId: string): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) => {
    if (team.id === teamId) {
      return {
        ...team,
        members: team.members.filter((member) => member.id !== memberId),
      };
    }
    return team;
  });
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

export const updateMemberRole = (
  teamId: string,
  memberId: string,
  role: 'owner' | 'admin' | 'member'
): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) => {
    if (team.id === teamId) {
      return {
        ...team,
        members: team.members.map((member) =>
          member.id === memberId ? { ...member, role } : member
        ),
      };
    }
    return team;
  });
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

// 초대 관리
export const createInvitation = (invitationData: {
  teamId: string;
  email: string;
  invitedBy: string;
}): TeamInvitation => {
  const newInvitation: TeamInvitation = {
    id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teamId: invitationData.teamId,
    email: invitationData.email,
    invitedBy: invitationData.invitedBy,
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
    status: 'pending',
  };

  const invitations = getInvitations();
  invitations.push(newInvitation);
  localStorage.setItem(
    'escape_lazy_team_invitations',
    JSON.stringify(invitations)
  );

  return newInvitation;
};

export const getInvitations = (): TeamInvitation[] => {
  const invitations = localStorage.getItem('escape_lazy_team_invitations');
  return invitations ? JSON.parse(invitations) : [];
};

export const acceptInvitation = (
  invitationId: string,
  memberData: {
    id: string;
    name: string;
    email: string;
  }
): void => {
  const invitations = getInvitations();
  const updatedInvitations = invitations.map((invitation) =>
    invitation.id === invitationId
      ? { ...invitation, status: 'accepted' }
      : invitation
  );
  localStorage.setItem(
    'escape_lazy_team_invitations',
    JSON.stringify(updatedInvitations)
  );

  // 팀에 멤버 추가
  const invitation = invitations.find((inv) => inv.id === invitationId);
  if (invitation) {
    addTeamMember(invitation.teamId, {
      ...memberData,
      role: 'member',
    });
  }
};

export const declineInvitation = (invitationId: string): void => {
  const invitations = getInvitations();
  const updatedInvitations = invitations.map((invitation) =>
    invitation.id === invitationId
      ? { ...invitation, status: 'expired' }
      : invitation
  );
  localStorage.setItem(
    'escape_lazy_team_invitations',
    JSON.stringify(updatedInvitations)
  );
};

// 프로젝트를 팀에 연결
export const addProjectToTeam = (teamId: string, projectId: string): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) => {
    if (team.id === teamId) {
      return {
        ...team,
        projects: [...team.projects, projectId],
      };
    }
    return team;
  });
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

export const removeProjectFromTeam = (
  teamId: string,
  projectId: string
): void => {
  const teams = getTeams();
  const updatedTeams = teams.map((team) => {
    if (team.id === teamId) {
      return {
        ...team,
        projects: team.projects.filter((id) => id !== projectId),
      };
    }
    return team;
  });
  localStorage.setItem('escape_lazy_teams', JSON.stringify(updatedTeams));
};

// 사용자가 속한 팀들 가져오기
export const getUserTeams = (userId: string): Team[] => {
  const teams = getTeams();
  return teams.filter((team) =>
    team.members.some((member) => member.id === userId)
  );
};

// 팀의 프로젝트들 가져오기
export const getTeamProjects = (teamId: string): Project[] => {
  const team = getTeamById(teamId);
  if (!team) return [];

  const allProjects = JSON.parse(
    localStorage.getItem('escape_lazy_projects') || '[]'
  );
  return allProjects.filter((project: Project) =>
    team.projects.includes(project.id)
  );
};
