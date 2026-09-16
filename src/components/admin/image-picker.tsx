'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Link2, Plus, X } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

/** Longest edge we keep. The storefront never renders a product photo wider. */
const MAX_EDGE = 1600;
const QUALITY = 0.82;
/** Files already small and correctly sized are uploaded byte-for-byte. */
const SKIP_REENCODE_BYTES = 320 * 1024;

let outputTypeCache = '';

/** WebP where the browser can encode it, JPEG everywhere else. */
function outputType() {
  if (!outputTypeCache) {
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    outputTypeCache = probe.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  }
  return outputTypeCache;
}

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decodeImage(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` applies the EXIF rotation phones write, instead of baking
      // in a sideways photo.
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Older Safari and a few codecs — fall through to an <img> decode.
    }
  }

  const url = URL.createObjectURL(file);
  const img = new window.Image();
  img.src = url;
  await img.decode();
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  };
}

/**
 * Phone cameras hand back 3-8 MB frames. Shrinking them here keeps uploads
 * quick on mobile data and the stored rows small. Anything that will not decode
 * is sent through untouched and left to the server's own checks.
 */
async function prepare(file: File): Promise<File> {
  if (file.type === 'image/gif') return file; // never flatten an animation

  try {
    const { source, width, height, release } = await decodeImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

    if (scale === 1 && file.size <= SKIP_REENCODE_BYTES) {
      release();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      release();
      return file;
    }
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    release();

    const type = outputType();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], base + (type === 'image/webp' ? '.webp' : '.jpg'), { type });
  } catch {
    return file;
  }
}

export function ImagePicker({
  images,
  onChange,
  onError,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  onError: (message: string) => void;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isTouch, setIsTouch] = useState(false);

  // `capture` only means anything on a device whose picker is a camera; on a
  // desktop it silently degrades to a second file dialog, so the button is
  // offered only where it does something.
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  async function upload(fileList: FileList | File[] | null) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    onError('');
    setProgress({ done: 0, total: files.length });

    const added: string[] = [];
    try {
      // One request per photo: each stays well inside the serverless body
      // limit, and a slow connection shows real progress instead of stalling.
      for (const [i, file] of files.entries()) {
        const body = new FormData();
        body.append('file', await prepare(file));

        const res = await fetch('/api/admin/uploads', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'That photo could not be uploaded');

        added.push(...(data.urls as string[]));
        setProgress({ done: i + 1, total: files.length });
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'That photo could not be uploaded');
    } finally {
      if (added.length) onChange([...images, ...added]);
      setProgress(null);
    }
  }

  function addUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      onError('Image URLs must start with http:// or https://');
      return;
    }
    onChange([...images, url]);
    setImageUrl('');
    onError('');
  }

  const busy = progress !== null;

  return (
    <div>
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          'border border-dashed px-4 py-6 transition-colors',
          dragging ? 'border-gold bg-gold-pale' : 'border-line bg-canvas-2/40',
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
            className="btn-outline px-6 py-3"
          >
            <ImagePlus size={14} strokeWidth={1.8} /> {isTouch ? 'Gallery' : 'Choose photos'}
          </button>

          {isTouch ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => cameraRef.current?.click()}
              className="btn-outline px-6 py-3"
            >
              <Camera size={14} strokeWidth={1.8} /> Camera
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => setShowUrl((v) => !v)}
            className="btn-ghost px-5 py-3"
          >
            <Link2 size={13} strokeWidth={1.8} /> Paste a link
          </button>
        </div>

        <p className="mt-3 text-center text-[12px] text-ink-3">
          {progress ? (
            <span className="inline-flex items-center gap-2 text-ink-2">
              <Spinner className="h-3.5 w-3.5" />
              Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}…
            </span>
          ) : isTouch ? (
            'Pick photos from your phone or shoot a new one. They are resized before uploading.'
          ) : (
            'Drag photos here, or choose them from this device. They are resized before uploading.'
          )}
        </p>
      </div>

      {showUrl ? (
        <div className="mt-3 flex gap-2">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            className="field flex-1"
            placeholder="https://images.pexels.com/photos/…"
          />
          <button type="button" onClick={addUrl} className="btn-outline shrink-0 px-5 py-3">
            <Plus size={13} strokeWidth={2} /> Add
          </button>
        </div>
      ) : null}

      {images.length > 0 ? (
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <li key={url + i} className="group relative aspect-[4/5] overflow-hidden bg-canvas-2">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5 bg-ink/85 px-1.5 py-0.5 text-[8.5px] uppercase tracking-label text-canvas">
                  Main
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, k) => k !== i))}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center bg-white/90 text-ink-2 transition-opacity hover:text-wine sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 border border-dashed border-line px-4 py-8 text-center text-[13px] text-ink-3">
          No images yet. The first image becomes the main product photo.
        </p>
      )}
    </div>
  );
}
