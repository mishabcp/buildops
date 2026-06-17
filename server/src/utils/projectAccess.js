import prisma from './prisma.js';

export async function loadProjectForAccess(projectId) {
  const id = Number(projectId);
  if (Number.isNaN(id)) return { error: 'Invalid project id', status: 400 };
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { error: 'Project not found', status: 404 };
  return { project };
}

export function assertBranchAccess(req, project) {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const userBranchId = req.user.branchId;
  if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
    return { error: 'Forbidden', status: 403 };
  }
  return null;
}

export async function assertProjectAccess(req, projectId) {
  const loaded = await loadProjectForAccess(projectId);
  if (loaded.error) return loaded;
  const denied = assertBranchAccess(req, loaded.project);
  if (denied) return denied;
  return { project: loaded.project };
}

export function canDeleteProjectMedia(req) {
  return req.user.role === 'SUPER_ADMIN' || req.user.role === 'BRANCH_MANAGER';
}
