import { UserProfile, UserRole } from '../types/analytics';

const MOCK_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'usr_admin',
    name: 'Lucas Martins (Administrador)',
    email: 'lucas.admin@auraops.com',
    role: 'admin'
  },
  editor: {
    id: 'usr_editor',
    name: 'Analista de Operações (Editor)',
    email: 'editor@auraops.com',
    role: 'editor'
  },
  viewer: {
    id: 'usr_viewer',
    name: 'Gerente Regional (Leitor)',
    email: 'leitor@auraops.com',
    role: 'viewer'
  }
};

const SESSION_STORAGE_KEY = 'auraops_active_user_session';

export function getActiveUserSession(): UserProfile {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    // fallback
  }
  return MOCK_USERS.admin; // Default Admin
}

export function setActiveUserRole(role: UserRole): UserProfile {
  const profile = MOCK_USERS[role];
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    // fallback
  }
  return profile;
}

// RBAC Permissions Checkers
export function canEditOrgDefaults(user: UserProfile): boolean {
  return user.role === 'admin';
}

export function canEditOfficialKPIFormulas(user: UserProfile): boolean {
  return user.role === 'admin';
}

export function canEditProject(user: UserProfile): boolean {
  return user.role === 'admin' || user.role === 'editor';
}

export function isViewerOnly(user: UserProfile): boolean {
  return user.role === 'viewer';
}
