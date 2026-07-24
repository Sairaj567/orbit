export const DEFAULT_WORKSPACE_SLUG = 'home';

export function getWorkspaceBasePath(workspaceSlug: string) {
  return `/w/${workspaceSlug}`;
}

export function getWorkspaceDashboardPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/dashboard`;
}

export function getWorkspacePath(workspaceSlug: string, path: string) {
  const normalizedPath = path.replace(/^\//, '');

  return normalizedPath ? `${getWorkspaceBasePath(workspaceSlug)}/${normalizedPath}` : getWorkspaceBasePath(workspaceSlug);
}

export function stripWorkspaceBasePath(pathname: string, workspaceSlug: string) {
  const basePath = getWorkspaceBasePath(workspaceSlug);

  if (!pathname.startsWith(basePath)) {
    return pathname;
  }

  const remainder = pathname.slice(basePath.length);
  return remainder.length ? remainder : '/';
}
