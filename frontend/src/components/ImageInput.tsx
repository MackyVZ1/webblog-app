import Cropper, { type Area } from 'react-easy-crop';
import { Crop, ImagePlus, LoaderCircle, RefreshCw, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface ImageInputProps {
  value?: string;
  id?: string;
  onChange: (url: string) => void;
  apiUrl: string;
  token: string;
  aspect?: number;
  disabled?: boolean;
  required?: boolean;
  compact?: boolean;
  label?: string;
  helpText?: string;
  validationError?: string;
}

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function createCroppedBlob(source: string, area: Area) {
  const image = await loadImage(source);
  const maxDimension = 2000;
  const scale = Math.min(1, maxDimension / Math.max(area.width, area.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('ไม่สามารถประมวลผลรูปภาพได้');
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('ไม่สามารถ crop รูปภาพได้')), 'image/jpeg', 0.92);
  });
}

export function ImageInput({
  value,
  id = 'image-input',
  onChange,
  apiUrl,
  token,
  aspect = 16 / 9,
  disabled = false,
  required = false,
  compact = false,
  label = 'เลือกรูปภาพ',
  helpText = 'JPEG, PNG, WebP หรือ AVIF ขนาดไม่เกิน 10 MB',
  validationError,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source);
  }, [source]);

  function closeCropper() {
    if (source) URL.revokeObjectURL(source);
    setSource('');
    setCropPixels(null);
    setZoom(1);
    if (inputRef.current) inputRef.current.value = '';
  }

  function selectFile(file?: File) {
    setError('');
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์ JPEG, PNG, WebP หรือ AVIF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ไฟล์ต้องมีขนาดไม่เกิน 10 MB');
      return;
    }
    setSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function cropAndUpload() {
    if (!source || !cropPixels) return;
    setUploading(true);
    setError('');
    try {
      const blob = await createCroppedBlob(source, cropPixels);
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      const response = await fetch(`${apiUrl}/api/uploads/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'อัปโหลดไม่สำเร็จ');
      }
      onChange(result.url);
      closeCropper();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      {!compact && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <label htmlFor={id} className="text-sm font-semibold">{label}{required && <span className="ml-1 text-[var(--accent)]" aria-hidden="true">*</span>}<span className="sr-only">{required ? ' (จำเป็น)' : ''}</span></label>
          <span className="text-xs font-normal text-[var(--muted)]">{helpText}</span>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={acceptedTypes.join(',')}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {value && !compact ? (
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]">
          <img src={value} alt="ตัวอย่างรูปที่เลือก" className="aspect-video w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
            <Button type="button" size="sm" className="bg-white text-[var(--ink)] hover:bg-white/90" onClick={() => inputRef.current?.click()} disabled={disabled}><RefreshCw size={15} /> เปลี่ยนรูป</Button>
            <Button type="button" size="icon" variant="destructive" onClick={() => onChange('')} disabled={disabled} aria-label="ลบรูป"><Trash2 size={16} /></Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          aria-required={required || undefined}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]); }}
          className={compact
            ? 'flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4 text-left transition hover:border-[var(--brand)] hover:bg-white disabled:opacity-50'
            : 'grid min-h-44 place-items-center rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--paper)] p-6 text-center transition hover:border-[var(--brand)] hover:bg-white disabled:opacity-50'}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--brand)]"><ImagePlus size={20} /></span>
          <span className={compact ? '' : 'mt-3'}><strong className="block text-sm text-[var(--ink)]">{compact ? label : 'เลือกไฟล์จากเครื่อง'}{required && compact && <span className="ml-1 text-[var(--accent)]" aria-hidden="true">*</span>}</strong><span className="mt-1 block text-xs font-normal leading-5 text-[var(--muted)]">คลิกหรือลากไฟล์มาวาง{compact ? ` · ${helpText}` : ''}</span></span>
        </button>
      )}

      {error && !source && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      {validationError && <p className="text-xs font-medium text-red-700" role="alert">{validationError}</p>}

      {source && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Crop รูปภาพ">
          <div className="w-full max-w-3xl overflow-hidden rounded-[1.5rem] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <div><h3 className="font-display text-2xl font-semibold">จัดวางรูปภาพ</h3><p className="mt-1 text-xs font-normal text-[var(--muted)]">ลากรูปเพื่อเลือกตำแหน่ง และปรับขนาดด้วยแถบ Zoom</p></div>
              <button type="button" onClick={closeCropper} disabled={uploading} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface-2)]" aria-label="ปิด"><X size={20} /></button>
            </div>
            <div className="relative h-[48vh] min-h-72 bg-[#111]">
              <Cropper image={source} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCropPixels(pixels)} showGrid />
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-xs font-semibold text-[var(--muted)]">Zoom
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-[var(--brand)]" />
              </label>
              <div className="flex gap-2 sm:justify-end"><Button type="button" variant="ghost" onClick={closeCropper} disabled={uploading}>ยกเลิก</Button><Button type="button" onClick={cropAndUpload} disabled={uploading || !cropPixels}>{uploading ? <LoaderCircle className="animate-spin" size={17} /> : <><Crop size={17} /> Crop และอัปโหลด</>}</Button></div>
              {error && <p className="text-xs font-medium text-red-700 sm:col-span-2">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
