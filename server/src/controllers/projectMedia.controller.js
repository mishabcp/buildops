import { randomUUID } from 'crypto';
import path from 'path';
import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';
import {
  assertProjectAccess,
  canDeleteProjectMedia,
} from '../utils/projectAccess.js';
import {
  classifyMediaKind,
  maxBytesForKind,
  NOTE_MAX_LENGTH,
} from '../config/media.config.js';
import * as storage from '../services/storage/index.js';

const LINK_TYPES = new Set([
  'PROJECT',
  'PAYMENT_STAGE',
  'LABOUR_PAYMENT',
  'MATERIAL_ITEM',
  'ASSOCIATE_PAYMENT',
  'BILL',
  'OTHER_EXPENSE',
]);

function sanitizeFileName(name) {
  const base = path.basename(String(name || 'file'));
  return base.replace(/[^\w.\- ()]/gi, '_').slice(0, 200) || 'file';
}

async function resolveLink(projectId, linkType, linkIdRaw) {
  const linkTypeVal = linkType && LINK_TYPES.has(linkType) ? linkType : 'PROJECT';
  if (linkTypeVal === 'PROJECT') {
    return { linkType: 'PROJECT', linkId: null };
  }
  const linkId = Number(linkIdRaw);
  if (Number.isNaN(linkId)) {
    return { err: 'Valid linkId is required when linking media' };
  }

  switch (linkTypeVal) {
    case 'PAYMENT_STAGE': {
      const row = await prisma.paymentStage.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Payment stage not found on this project' };
      break;
    }
    case 'LABOUR_PAYMENT': {
      const row = await prisma.labourPayment.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Labour entry not found on this project' };
      break;
    }
    case 'MATERIAL_ITEM': {
      const row = await prisma.materialItem.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Material entry not found on this project' };
      break;
    }
    case 'ASSOCIATE_PAYMENT': {
      const row = await prisma.associatePayment.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Associate entry not found on this project' };
      break;
    }
    case 'BILL': {
      const row = await prisma.bill.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Bill not found on this project' };
      break;
    }
    case 'OTHER_EXPENSE': {
      const row = await prisma.otherExpense.findFirst({ where: { id: linkId, projectId } });
      if (!row) return { err: 'Expense not found on this project' };
      break;
    }
    default:
      return { err: 'Invalid link type' };
  }

  return { linkType: linkTypeVal, linkId };
}

function parseCapturedAt(value) {
  if (!value) return { err: 'Date is required' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { err: 'Invalid date' };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  if (d > tomorrow) return { err: 'Date cannot be in the future' };
  return { capturedAt: d };
}

function serializeMedia(row) {
  return {
    ...row,
    uploadedBy: row.uploadedBy
      ? { id: row.uploadedBy.id, name: row.uploadedBy.name, email: row.uploadedBy.email }
      : undefined,
  };
}

export async function listMedia(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);

    const access = await assertProjectAccess(req, projectId);
    if (access.error) return error(res, access.error, access.status);

    const { linkType, linkId, kind, page = '1', limit = '50' } = req.query;
    const where = { projectId };
    if (linkType && LINK_TYPES.has(linkType)) {
      where.linkType = linkType;
      if (linkId != null && linkId !== '') {
        const lid = Number(linkId);
        if (!Number.isNaN(lid)) where.linkId = lid;
      }
    }
    if (kind && ['IMAGE', 'PDF', 'VIDEO'].includes(kind)) {
      where.kind = kind;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.projectMedia.findMany({
        where,
        include: { uploadedBy: { select: { id: true, name: true, email: true } } },
        orderBy: { capturedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.projectMedia.count({ where }),
    ]);

    return success(res, { items: items.map(serializeMedia), total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('List project media error:', err);
    return error(res, 'Failed to list media', 500);
  }
}

export async function getMedia(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const mediaId = Number(req.params.mediaId);
    if (Number.isNaN(projectId) || Number.isNaN(mediaId)) {
      return error(res, 'Invalid id', 400);
    }

    const access = await assertProjectAccess(req, projectId);
    if (access.error) return error(res, access.error, access.status);

    const row = await prisma.projectMedia.findFirst({
      where: { id: mediaId, projectId },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    });
    if (!row) return error(res, 'Media not found', 404);
    return success(res, serializeMedia(row));
  } catch (err) {
    console.error('Get project media error:', err);
    return error(res, 'Failed to get media', 500);
  }
}

export async function createMedia(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);

    const access = await assertProjectAccess(req, projectId);
    if (access.error) return error(res, access.error, access.status);

    const file = req.file;
    if (!file || !file.buffer?.length) {
      return error(res, 'File is required', 400);
    }

    const note = String(req.body.note ?? '').trim();
    if (!note) return error(res, 'Note is required', 400);
    if (note.length > NOTE_MAX_LENGTH) {
      return error(res, `Note must be at most ${NOTE_MAX_LENGTH} characters`, 400);
    }

    const captured = parseCapturedAt(req.body.capturedAt);
    if (captured.err) return error(res, captured.err, 400);

    const kind = classifyMediaKind(file.mimetype);
    if (!kind) {
      return error(res, 'Unsupported file type. Use an image, PDF, or video.', 400);
    }
    if (file.size > maxBytesForKind(kind)) {
      return error(res, 'File exceeds size limit for this type', 400);
    }

    const link = await resolveLink(projectId, req.body.linkType, req.body.linkId);
    if (link.err) return error(res, link.err, 400);

    const storageKey = `projects/${projectId}/${randomUUID()}`;
    const originalFileName = sanitizeFileName(file.originalname);

    await storage.putObject(storageKey, file.buffer, file.mimetype);

    try {
      const created = await prisma.projectMedia.create({
        data: {
          projectId,
          uploadedById: req.user.userId,
          kind,
          mimeType: file.mimetype,
          originalFileName,
          sizeBytes: file.size,
          storageKey,
          capturedAt: captured.capturedAt,
          note,
          linkType: link.linkType,
          linkId: link.linkId,
        },
        include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      });
      return success(res, serializeMedia(created), 201);
    } catch (dbErr) {
      await storage.deleteObject(storageKey).catch(() => {});
      throw dbErr;
    }
  } catch (err) {
    console.error('Create project media error:', err);
    return error(res, 'Failed to upload media', 500);
  }
}

export async function streamMediaFile(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const mediaId = Number(req.params.mediaId);
    if (Number.isNaN(projectId) || Number.isNaN(mediaId)) {
      return error(res, 'Invalid id', 400);
    }

    const access = await assertProjectAccess(req, projectId);
    if (access.error) return error(res, access.error, access.status);

    const row = await prisma.projectMedia.findFirst({
      where: { id: mediaId, projectId },
    });
    if (!row) return error(res, 'Media not found', 404);

    const signed = await storage.getSignedDownloadUrl(row.storageKey);
    if (signed) {
      return res.redirect(302, signed);
    }

    const { body, contentType } = await storage.getObjectStream(row.storageKey);
    res.setHeader('Content-Type', contentType || row.mimeType);
    res.setHeader('Content-Length', body.length);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(row.originalFileName)}"`
    );
    return res.send(body);
  } catch (err) {
    console.error('Stream project media error:', err);
    return error(res, 'Failed to load file', 500);
  }
}

export async function removeMedia(req, res) {
  try {
    if (!canDeleteProjectMedia(req)) {
      return error(res, 'Staff cannot delete site media', 403);
    }

    const projectId = Number(req.params.projectId);
    const mediaId = Number(req.params.mediaId);
    if (Number.isNaN(projectId) || Number.isNaN(mediaId)) {
      return error(res, 'Invalid id', 400);
    }

    const access = await assertProjectAccess(req, projectId);
    if (access.error) return error(res, access.error, access.status);

    const row = await prisma.projectMedia.findFirst({
      where: { id: mediaId, projectId },
    });
    if (!row) return error(res, 'Media not found', 404);

    await prisma.projectMedia.delete({ where: { id: mediaId } });
    await storage.deleteObject(row.storageKey).catch(() => {});

    return success(res, { id: mediaId, deleted: true });
  } catch (err) {
    console.error('Delete project media error:', err);
    return error(res, 'Failed to delete media', 500);
  }
}

export async function deleteAllMediaForProject(projectId) {
  const rows = await prisma.projectMedia.findMany({
    where: { projectId },
    select: { storageKey: true },
  });
  if (rows.length) {
    await storage.deleteObjects(rows.map((r) => r.storageKey));
  }
}
