import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';
import { ImageInput } from './ImageInput';
import { FormField } from './ui/form-field';
import { Input } from './ui/input';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  apiUrl: string;
  token: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-35',
        active && 'bg-[var(--ink)] text-white hover:bg-[var(--ink)] hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-[var(--line)]" aria-hidden="true" />;
}

export function RichTextEditor({ value, onChange, apiUrl, token, id, required = false, disabled = false }: RichTextEditorProps) {
  const [, setRevision] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageAlt, setImageAlt] = useState('');
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
      }),
      Image.configure({ allowBase64: false, inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-editor min-h-80 px-5 py-6 outline-none sm:px-7',
        id: id || 'rich-text-editor',
        role: 'textbox',
        'aria-label': 'เนื้อหาบทความ',
        'aria-required': required ? 'true' : 'false',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
      setRevision((revision) => revision + 1);
    },
    onSelectionUpdate: () => setRevision((revision) => revision + 1),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return <div className="min-h-80 animate-pulse rounded-xl border border-[var(--line)] bg-[var(--surface-2)]" />;
  }

  const setLink = () => {
    const current = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('ใส่ URL ที่ต้องการลิงก์', current || 'https://');
    if (input === null) return;
    if (!input.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = /^(https?:\/\/|mailto:|tel:)/i.test(input) ? input : `https://${input}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const insertUploadedImage = (src: string) => {
    editor.chain().focus().setImage({ src, alt: imageAlt, title: imageAlt }).run();
    setShowImageUpload(false);
    setImageAlt('');
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--brand)_15%,transparent)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--line)] bg-[var(--surface-2)]/70 p-2" role="toolbar" aria-label="เครื่องมือจัดรูปแบบเนื้อหา">
        <ToolbarButton label="ย่อหน้าปกติ" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={17} /></ToolbarButton>
        <ToolbarButton label="หัวข้อระดับ 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></ToolbarButton>
        <ToolbarButton label="หัวข้อระดับ 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={18} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="ตัวหนา" active={editor.isActive('bold')} disabled={!editor.can().chain().focus().toggleBold().run()} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></ToolbarButton>
        <ToolbarButton label="ตัวเอียง" active={editor.isActive('italic')} disabled={!editor.can().chain().focus().toggleItalic().run()} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></ToolbarButton>
        <ToolbarButton label="ขีดทับ" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></ToolbarButton>
        <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 size={17} /></ToolbarButton>
        <ToolbarButton label="ล้างรูปแบบ" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={17} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="รายการหัวข้อ" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></ToolbarButton>
        <ToolbarButton label="รายการลำดับเลข" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></ToolbarButton>
        <ToolbarButton label="ข้อความอ้างอิง" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></ToolbarButton>
        <ToolbarButton label="เส้นคั่น" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={18} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="เพิ่มหรือแก้ไขลิงก์" active={editor.isActive('link')} onClick={setLink}><Link2 size={17} /></ToolbarButton>
        <ToolbarButton label="อัปโหลดรูปภาพ" onClick={() => setShowImageUpload(true)}><ImagePlus size={18} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="จัดชิดซ้าย" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={17} /></ToolbarButton>
        <ToolbarButton label="จัดกึ่งกลาง" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={17} /></ToolbarButton>
        <ToolbarButton label="จัดชิดขวา" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={17} /></ToolbarButton>
        <span className="grow" />
        <ToolbarButton label="ย้อนกลับ" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></ToolbarButton>
        <ToolbarButton label="ทำซ้ำ" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[11px] text-[var(--muted)]">
        <span>เลือกข้อความเพื่อจัดรูปแบบ · วางข้อความจากเอกสารได้โดยตรง</span>
        <span>{editor.storage.characterCount?.characters?.() || editor.getText().length} ตัวอักษร</span>
      </div>
      {showImageUpload && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="แทรกรูปภาพในเนื้อหา">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="font-display text-2xl font-semibold">แทรกรูปในบทความ</h3><p className="mt-1 text-xs font-normal leading-5 text-[var(--muted)]">เลือกรูป Crop แล้วระบบจะแทรกไว้ตรงตำแหน่ง cursor</p></div>
              <button type="button" onClick={() => setShowImageUpload(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-[var(--surface-2)]" aria-label="ปิด"><span aria-hidden="true">×</span></button>
            </div>
            <div className="mt-5 grid gap-4">
              <FormField label="คำอธิบายรูปภาพ (Alt text)" htmlFor="editor-image-alt" hint="แนะนำสำหรับ SEO และ accessibility"><Input id="editor-image-alt" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="อธิบายสิ่งที่อยู่ในภาพ" /></FormField>
              <ImageInput onChange={insertUploadedImage} apiUrl={apiUrl} token={token} aspect={16 / 9} compact label="เลือกไฟล์จากเครื่อง" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
