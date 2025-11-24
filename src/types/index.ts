// Enums from backend
export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  MANAGER = 'MANAGER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// User Types
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: Role;
  
  // GitHub OAuth fields
  githubId?: number;
  githubUsername?: string;
  githubAvatarUrl?: string;
  
  // Google OAuth fields
  googleId?: string;
  googleEmail?: string;
  googleName?: string;
  googlePictureUrl?: string;
  
  // Trello OAuth fields
  trelloId?: string;
  trelloUsername?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: Role;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

// Team Types
export interface TeamDto {
  id: number;
  name: string;
  memberIds: number[];
}

// Project Types
export interface ProjectDto {
  id: number;
  name: string;
  teamId: number;
  trelloBoardId?: string | null;
}

// Task Types
export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  projectId: number;
  assignedUserId?: number;
  status: TaskStatus;
  dueDate?: string; // LocalDate as ISO string
}

// Issue Types
export interface IssueDto {
  id: number;
  projectId: number;
  userId: number;
  description: string;
  status: IssueStatus;
}

// Commit Types
export interface CommitDto {
  id: number;
  projectId: number;
  userId: number;
  message: string;
  timestamp: string; // Instant as ISO string
}

// Deployment Types
export interface DeploymentDto {
  id: number;
  projectId: number;
  status: DeploymentStatus;
  timestamp: string; // Instant as ISO string
}

// Dashboard Types
export interface ProjectMetricsDto {
  projectId: number;
  projectName: string;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalCommits: number;
  commitsOverTime: Record<string, number>; // ISO date -> count
  commitsPerUser: Record<string, number>; // userId -> count
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesAssignedPerUser: Record<string, number>; // userId -> count
  totalDeployments: number;
  deploymentsByStatus: Record<string, number>;
  lastDeploymentStatus?: string;
  lastDeploymentTimestamp?: string;
}

export interface UserMetricsDto {
  userId: number;
  userName: string;
  userEmail: string;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalCommits: number;
  totalIssuesAssigned: number;
  issuesByStatus: Record<string, number>;
}

export interface DashboardDto {
  totalProjects: number;
  totalUsers: number;
  totalTeams: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalCommits: number;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  totalDeployments: number;
  deploymentsByStatus: Record<string, number>;
  projects: ProjectMetricsDto[];
  users: UserMetricsDto[];
}

// API Error Response
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
