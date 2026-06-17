import prisma from './prisma.js';

/** Keep files in Site media tab when a linked row is deleted. */
export async function unlinkProjectMediaForEntity(linkType, linkId) {
  if (linkId == null) return;
  await prisma.projectMedia.updateMany({
    where: { linkType, linkId: Number(linkId) },
    data: { linkType: 'PROJECT', linkId: null },
  });
}
