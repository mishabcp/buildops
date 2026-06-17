export const LINK_TYPE_LABELS = {
  PROJECT: 'Project gallery',
  PAYMENT_STAGE: 'Payment stage',
  LABOUR_PAYMENT: 'Labour',
  MATERIAL_ITEM: 'Materials',
  ASSOCIATE_PAYMENT: 'Associate',
  BILL: 'Bill',
  OTHER_EXPENSE: 'Other expense',
};

export const UPLOAD_LINK_OPTIONS = [
  { value: 'PROJECT', label: 'Project only (no link)' },
  { value: 'PAYMENT_STAGE', label: 'Payment stage' },
  { value: 'LABOUR_PAYMENT', label: 'Labour entry' },
  { value: 'MATERIAL_ITEM', label: 'Material entry' },
  { value: 'ASSOCIATE_PAYMENT', label: 'Associate entry' },
  { value: 'BILL', label: 'Bill' },
  { value: 'OTHER_EXPENSE', label: 'Other expense' },
];

export function linkBadgeLabel(item) {
  if (!item || item.linkType === 'PROJECT' || !item.linkId) {
    return 'Project gallery';
  }
  return LINK_TYPE_LABELS[item.linkType] || item.linkType;
}
