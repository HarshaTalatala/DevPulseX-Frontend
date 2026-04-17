import {
  DashboardDto,
  DeploymentDto,
  DeploymentStatus,
  IssueDto,
  IssueStatus,
  ProjectDto,
  ProjectMetricsDto,
  Role,
  TaskDto,
  TaskStatus,
  TeamDto,
  UserDto,
  UserMetricsDto,
  CommitDto,
} from '@/types';
import { GithubInsights, GithubRepository } from '@/lib/api/github';

const now = new Date();

const isoDaysAgo = (days: number, hours = 10): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const demoUsers: UserDto[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@devpulsex.demo', role: Role.ADMIN, githubUsername: 'alicej' },
  { id: 2, name: 'Bob Chen', email: 'bob@devpulsex.demo', role: Role.MANAGER, githubUsername: 'bobchen' },
  { id: 3, name: 'Charlie Rao', email: 'charlie@devpulsex.demo', role: Role.DEVELOPER, githubUsername: 'charliera' },
  { id: 4, name: 'Diana Kim', email: 'diana@devpulsex.demo', role: Role.DEVELOPER, githubUsername: 'dianakim' },
  { id: 5, name: 'Eve Park', email: 'eve@devpulsex.demo', role: Role.DEVELOPER, githubUsername: 'evepark' },
];

export const demoCurrentUser: UserDto = demoUsers[0];

export const demoTeams: TeamDto[] = [
  { id: 1, name: 'Backend Core', memberIds: [1, 2, 3] },
  { id: 2, name: 'Frontend Experience', memberIds: [1, 4, 5] },
  { id: 3, name: 'DevOps Platform', memberIds: [2, 3] },
];

export const demoProjects: ProjectDto[] = [
  { id: 1, name: 'API Service', teamId: 1, trelloBoardId: 'demo-board-api' },
  { id: 2, name: 'Dashboard UI', teamId: 2, trelloBoardId: 'demo-board-ui' },
  { id: 3, name: 'Analytics Engine', teamId: 3, trelloBoardId: null },
];

export const demoTasks: TaskDto[] = [
  { id: 1, title: 'Rate limiting middleware', description: 'Protect auth endpoints', projectId: 1, assignedUserId: 3, status: TaskStatus.IN_PROGRESS, dueDate: isoDaysAgo(-2) },
  { id: 2, title: 'Dashboard onboarding flow', description: 'Improve first run guidance', projectId: 2, assignedUserId: 4, status: TaskStatus.REVIEW, dueDate: isoDaysAgo(-1) },
  { id: 3, title: 'Hotfix deployment rollback', description: 'Post-mortem + patch', projectId: 3, assignedUserId: 2, status: TaskStatus.DONE, dueDate: isoDaysAgo(1) },
  { id: 4, title: 'Trello sync parity', description: 'Map labels to task fields', projectId: 1, assignedUserId: 5, status: TaskStatus.TODO, dueDate: isoDaysAgo(3) },
  { id: 5, title: 'Chart performance pass', description: 'Trim expensive renders', projectId: 2, assignedUserId: 4, status: TaskStatus.BLOCKED, dueDate: isoDaysAgo(0) },
  { id: 6, title: 'Pipeline audit', description: 'Harden CI quality gates', projectId: 3, assignedUserId: 3, status: TaskStatus.IN_PROGRESS, dueDate: isoDaysAgo(2) },
];

export const demoIssues: IssueDto[] = [
  { id: 1, projectId: 1, userId: 3, description: 'Intermittent 429 handling on GitHub API', status: IssueStatus.IN_PROGRESS },
  { id: 2, projectId: 2, userId: 4, description: 'Mobile nav overlap at 375px width', status: IssueStatus.OPEN },
  { id: 3, projectId: 3, userId: 2, description: 'Failed migration script in staging run', status: IssueStatus.RESOLVED },
  { id: 4, projectId: 2, userId: 5, description: 'Theme flash on first paint', status: IssueStatus.CLOSED },
  { id: 5, projectId: 1, userId: 1, description: 'Trello token re-link edge case', status: IssueStatus.OPEN },
];

export const demoCommits: CommitDto[] = [
  { id: 1, projectId: 1, userId: 3, message: 'Add auth rate limiter and integration tests', timestamp: isoDaysAgo(0, 9) },
  { id: 2, projectId: 2, userId: 4, message: 'Improve dashboard loading skeletons', timestamp: isoDaysAgo(0, 11) },
  { id: 3, projectId: 3, userId: 2, message: 'Fix pipeline cache key invalidation', timestamp: isoDaysAgo(1, 13) },
  { id: 4, projectId: 1, userId: 1, message: 'Refactor OAuth callback error handling', timestamp: isoDaysAgo(2, 10) },
  { id: 5, projectId: 2, userId: 5, message: 'Tighten responsive spacing in project list', timestamp: isoDaysAgo(3, 16) },
  { id: 6, projectId: 3, userId: 3, message: 'Add smoke test for deployment status path', timestamp: isoDaysAgo(4, 14) },
  { id: 7, projectId: 1, userId: 2, message: 'Sanitize OAuth logs and remove code tracing', timestamp: isoDaysAgo(5, 15) },
  { id: 8, projectId: 2, userId: 4, message: 'Replace hardcoded localhost OAuth URL', timestamp: isoDaysAgo(6, 12) },
];

export const demoDeployments: DeploymentDto[] = [
  { id: 1, projectId: 1, status: DeploymentStatus.SUCCESS, timestamp: isoDaysAgo(0, 8) },
  { id: 2, projectId: 2, status: DeploymentStatus.SUCCESS, timestamp: isoDaysAgo(1, 9) },
  { id: 3, projectId: 3, status: DeploymentStatus.FAILED, timestamp: isoDaysAgo(2, 10) },
  { id: 4, projectId: 3, status: DeploymentStatus.SUCCESS, timestamp: isoDaysAgo(2, 14) },
  { id: 5, projectId: 1, status: DeploymentStatus.IN_PROGRESS, timestamp: isoDaysAgo(0, 13) },
  { id: 6, projectId: 2, status: DeploymentStatus.PENDING, timestamp: isoDaysAgo(0, 15) },
];

export const demoProjectMetrics: ProjectMetricsDto[] = [
  {
    projectId: 1,
    projectName: 'API Service',
    totalTasks: 2,
    tasksByStatus: { TODO: 1, IN_PROGRESS: 1, REVIEW: 0, DONE: 0, BLOCKED: 0 },
    totalCommits: 3,
    commitsOverTime: { '2026-04-11': 0, '2026-04-12': 1, '2026-04-13': 0, '2026-04-14': 1, '2026-04-15': 0, '2026-04-16': 0, '2026-04-17': 1 },
    commitsPerUser: { '1': 1, '2': 1, '3': 1 },
    totalIssues: 2,
    issuesByStatus: { OPEN: 1, IN_PROGRESS: 1, RESOLVED: 0, CLOSED: 0 },
    issuesAssignedPerUser: { '1': 1, '3': 1 },
    totalDeployments: 2,
    deploymentsByStatus: { PENDING: 0, IN_PROGRESS: 1, SUCCESS: 1, FAILED: 0 },
    lastDeploymentStatus: 'SUCCESS',
    lastDeploymentTimestamp: isoDaysAgo(0, 8),
  },
  {
    projectId: 2,
    projectName: 'Dashboard UI',
    totalTasks: 2,
    tasksByStatus: { TODO: 0, IN_PROGRESS: 0, REVIEW: 1, DONE: 0, BLOCKED: 1 },
    totalCommits: 3,
    commitsOverTime: { '2026-04-11': 1, '2026-04-12': 0, '2026-04-13': 0, '2026-04-14': 0, '2026-04-15': 1, '2026-04-16': 0, '2026-04-17': 1 },
    commitsPerUser: { '4': 2, '5': 1 },
    totalIssues: 2,
    issuesByStatus: { OPEN: 1, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 1 },
    issuesAssignedPerUser: { '4': 1, '5': 1 },
    totalDeployments: 2,
    deploymentsByStatus: { PENDING: 1, IN_PROGRESS: 0, SUCCESS: 1, FAILED: 0 },
    lastDeploymentStatus: 'SUCCESS',
    lastDeploymentTimestamp: isoDaysAgo(1, 9),
  },
  {
    projectId: 3,
    projectName: 'Analytics Engine',
    totalTasks: 2,
    tasksByStatus: { TODO: 0, IN_PROGRESS: 1, REVIEW: 0, DONE: 1, BLOCKED: 0 },
    totalCommits: 2,
    commitsOverTime: { '2026-04-11': 0, '2026-04-12': 0, '2026-04-13': 1, '2026-04-14': 0, '2026-04-15': 0, '2026-04-16': 1, '2026-04-17': 0 },
    commitsPerUser: { '2': 1, '3': 1 },
    totalIssues: 1,
    issuesByStatus: { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 1, CLOSED: 0 },
    issuesAssignedPerUser: { '2': 1 },
    totalDeployments: 2,
    deploymentsByStatus: { PENDING: 0, IN_PROGRESS: 0, SUCCESS: 1, FAILED: 1 },
    lastDeploymentStatus: 'SUCCESS',
    lastDeploymentTimestamp: isoDaysAgo(2, 14),
  },
];

export const demoUserMetrics: UserMetricsDto[] = demoUsers.map((u) => ({
  userId: u.id,
  userName: u.name,
  userEmail: u.email,
  totalTasks: demoTasks.filter((t) => t.assignedUserId === u.id).length,
  tasksByStatus: {
    TODO: demoTasks.filter((t) => t.assignedUserId === u.id && t.status === TaskStatus.TODO).length,
    IN_PROGRESS: demoTasks.filter((t) => t.assignedUserId === u.id && t.status === TaskStatus.IN_PROGRESS).length,
    REVIEW: demoTasks.filter((t) => t.assignedUserId === u.id && t.status === TaskStatus.REVIEW).length,
    DONE: demoTasks.filter((t) => t.assignedUserId === u.id && t.status === TaskStatus.DONE).length,
    BLOCKED: demoTasks.filter((t) => t.assignedUserId === u.id && t.status === TaskStatus.BLOCKED).length,
  },
  totalCommits: demoCommits.filter((c) => c.userId === u.id).length,
  totalIssuesAssigned: demoIssues.filter((i) => i.userId === u.id).length,
  issuesByStatus: {
    OPEN: demoIssues.filter((i) => i.userId === u.id && i.status === IssueStatus.OPEN).length,
    IN_PROGRESS: demoIssues.filter((i) => i.userId === u.id && i.status === IssueStatus.IN_PROGRESS).length,
    RESOLVED: demoIssues.filter((i) => i.userId === u.id && i.status === IssueStatus.RESOLVED).length,
    CLOSED: demoIssues.filter((i) => i.userId === u.id && i.status === IssueStatus.CLOSED).length,
  },
}));

export const demoDashboardSummary: DashboardDto = {
  totalProjects: demoProjects.length,
  totalUsers: demoUsers.length,
  totalTeams: demoTeams.length,
  totalTasks: demoTasks.length,
  tasksByStatus: {
    TODO: demoTasks.filter((t) => t.status === TaskStatus.TODO).length,
    IN_PROGRESS: demoTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    REVIEW: demoTasks.filter((t) => t.status === TaskStatus.REVIEW).length,
    DONE: demoTasks.filter((t) => t.status === TaskStatus.DONE).length,
    BLOCKED: demoTasks.filter((t) => t.status === TaskStatus.BLOCKED).length,
  },
  totalCommits: demoCommits.length,
  totalIssues: demoIssues.length,
  issuesByStatus: {
    OPEN: demoIssues.filter((i) => i.status === IssueStatus.OPEN).length,
    IN_PROGRESS: demoIssues.filter((i) => i.status === IssueStatus.IN_PROGRESS).length,
    RESOLVED: demoIssues.filter((i) => i.status === IssueStatus.RESOLVED).length,
    CLOSED: demoIssues.filter((i) => i.status === IssueStatus.CLOSED).length,
  },
  totalDeployments: demoDeployments.length,
  deploymentsByStatus: {
    PENDING: demoDeployments.filter((d) => d.status === DeploymentStatus.PENDING).length,
    IN_PROGRESS: demoDeployments.filter((d) => d.status === DeploymentStatus.IN_PROGRESS).length,
    SUCCESS: demoDeployments.filter((d) => d.status === DeploymentStatus.SUCCESS).length,
    FAILED: demoDeployments.filter((d) => d.status === DeploymentStatus.FAILED).length,
  },
  projects: demoProjectMetrics,
  users: demoUserMetrics,
};

export const demoGithubInsights: GithubInsights = {
  username: 'devpulsex-demo',
  repoCount: 12,
  totalPullRequests: 84,
  recentCommits: 18,
  totalIssues: 46,
  openIssues: 9,
  closedIssues: 37,
  totalStars: 320,
  followers: 157,
  following: 41,
  publicGists: 12,
  recentPRs: 7,
  recentIssues: 5,
  mostActiveRepo: 'devpulsex/dashboard-ui',
  fetchedAt: new Date().toISOString(),
  avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
  profileUrl: 'https://github.com/github',
};

export const demoGithubRepositories: GithubRepository[] = [
  {
    id: 101,
    name: 'dashboard-ui',
    fullName: 'devpulsex/dashboard-ui',
    description: 'Next.js frontend for engineering analytics',
    url: 'https://api.github.com/repos/devpulsex/dashboard-ui',
    language: 'TypeScript',
    stars: 94,
    forks: 17,
    openIssues: 6,
    isPrivate: false,
    createdAt: isoDaysAgo(200),
    updatedAt: isoDaysAgo(0),
    defaultBranch: 'main',
    topics: ['nextjs', 'analytics', 'dashboard'],
  },
  {
    id: 102,
    name: 'backend-service',
    fullName: 'devpulsex/backend-service',
    description: 'Spring Boot backend APIs and integrations',
    url: 'https://api.github.com/repos/devpulsex/backend-service',
    language: 'Java',
    stars: 121,
    forks: 22,
    openIssues: 4,
    isPrivate: false,
    createdAt: isoDaysAgo(280),
    updatedAt: isoDaysAgo(1),
    defaultBranch: 'main',
    topics: ['spring-boot', 'api', 'oauth'],
  },
  {
    id: 103,
    name: 'infra-observability',
    fullName: 'devpulsex/infra-observability',
    description: 'Deployment and telemetry configs',
    url: 'https://api.github.com/repos/devpulsex/infra-observability',
    language: 'HCL',
    stars: 54,
    forks: 8,
    openIssues: 2,
    isPrivate: false,
    createdAt: isoDaysAgo(320),
    updatedAt: isoDaysAgo(2),
    defaultBranch: 'main',
    topics: ['terraform', 'infra', 'monitoring'],
  },
];
