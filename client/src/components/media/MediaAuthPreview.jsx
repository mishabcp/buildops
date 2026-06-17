import { useState, useEffect } from 'react';
import { fetchProjectMediaFile } from '../../api/projectMedia.api.js';
import { FileText, Film, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function MediaAuthPreview({ projectId, media, className, onOpen }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl = null;
    setLoading(true);
    setFailed(false);

    fetchProjectMediaFile(projectId, media.id)
      .then((blob) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!revoked) setFailed(true);
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectId, media.id]);

  const kind = media.kind;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center bg-slate-100 text-slate-400', className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center bg-slate-100 text-slate-400', className)}>
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }

  if (kind === 'IMAGE') {
    return (
      <button type="button" onClick={() => onOpen?.(blobUrl)} className={cn('block overflow-hidden', className)}>
        <img src={blobUrl} alt="" className="h-full w-full object-cover" />
      </button>
    );
  }

  if (kind === 'VIDEO') {
    return (
      <div className={cn('relative bg-slate-900', className)}>
        <video src={blobUrl} className="h-full w-full object-cover" controls preload="metadata" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen?.(blobUrl)}
      className={cn('flex flex-col items-center justify-center gap-1 bg-rose-50 text-rose-700', className)}
    >
      <FileText className="h-8 w-8" />
      <span className="text-[10px] font-bold uppercase">PDF</span>
    </button>
  );
}

export function MediaKindIcon({ kind, className }) {
  if (kind === 'PDF') return <FileText className={className} />;
  if (kind === 'VIDEO') return <Film className={className} />;
  return <ImageIcon className={className} />;
}
