import { Edit3, Eye, FileText, LogOut, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Article, ArticleList, Category } from '../lib/api';
import { RichTextEditor } from './RichTextEditor';
import { ImageInput } from './ImageInput';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FormField, RequiredMark } from './ui/form-field';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';

type EditorForm = {
  title: string; excerpt: string; content: string; coverImage: string; coverImageAlt: string;
  categoryId: string; tags: string; status: 'draft' | 'published'; featured: boolean;
};

const emptyForm: EditorForm = {
  title: '', excerpt: '', content: '<p></p>',
  coverImage: '', coverImageAlt: '',
  categoryId: '', tags: '', status: 'draft', featured: false,
};

function hasMeaningfulContent(content: string) {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  return Boolean(text || /<img\b/i.test(content));
}

export function AdminPanel({ apiUrl }: { apiUrl: string }) {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('admin@pulseandpixel.dev');
  const [password, setPassword] = useState('Admin123!');
  const [loginError, setLoginError] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const [submitted, setSubmitted] = useState(false);

  const published = useMemo(() => articles.filter((item) => item.status === 'published').length, [articles]);

  useEffect(() => {
    const stored = localStorage.getItem('pulse_admin_token');
    if (stored) setToken(stored);
  }, []);

  useEffect(() => { if (token) void loadData(token); }, [token]);

  async function loadData(authToken = token) {
    const headers = { Authorization: `Bearer ${authToken}` };
    const [articleResponse, categoryResponse] = await Promise.all([
      fetch(`${apiUrl}/api/articles/admin/all?limit=50`, { headers }),
      fetch(`${apiUrl}/api/categories`),
    ]);
    if (articleResponse.status === 401) { logout(); return; }
    const articleData: ArticleList = await articleResponse.json();
    const categoryData: Category[] = await categoryResponse.json();
    setArticles(articleData.items);
    setCategories(categoryData);
  }

  async function login(event: { preventDefault(): void }) {
    event.preventDefault(); setLoginError('');
    const response = await fetch(`${apiUrl}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!response.ok) { setLoginError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); return; }
    const data = await response.json();
    localStorage.setItem('pulse_admin_token', data.accessToken);
    setToken(data.accessToken);
  }

  function logout() {
    localStorage.removeItem('pulse_admin_token'); setToken(''); setArticles([]); setShowEditor(false);
  }

  function openCreate() {
    setEditing(null); setForm({ ...emptyForm, categoryId: categories[0]?.id || '' }); setShowEditor(true); setNotice(''); setSubmitted(false);
  }

  function openEdit(article: Article) {
    setEditing(article);
    setForm({ title: article.title, excerpt: article.excerpt, content: article.content, coverImage: article.coverImage, coverImageAlt: article.coverImageAlt || '', categoryId: article.categoryId, tags: article.tags.join(', '), status: article.status, featured: article.featured });
    setShowEditor(true); setNotice(''); setSubmitted(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event: { preventDefault(): void }) {
    event.preventDefault();
    setSubmitted(true);
    setNotice('');
    if (!form.coverImage || !hasMeaningfulContent(form.content)) {
      setNotice('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วน');
      setNoticeType('error');
      return;
    }
    setSaving(true);
    const body = { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
    const response = await fetch(`${apiUrl}/api/articles${editing ? `/${editing.id}` : ''}`, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!response.ok) { const error = await response.json(); setNotice(Array.isArray(error.message) ? error.message.join(', ') : error.message || 'บันทึกไม่สำเร็จ'); setNoticeType('error'); return; }
    setNotice('บันทึกบทความเรียบร้อยแล้ว'); setNoticeType('success'); setShowEditor(false); setSubmitted(false); await loadData();
  }

  async function remove(article: Article) {
    if (!window.confirm(`ลบบทความ “${article.title}” ใช่ไหม?`)) return;
    await fetch(`${apiUrl}/api/articles/${article.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadData();
  }

  if (!token) return (
    <div className="mx-auto max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xl shadow-black/5 sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--ink)] text-xl text-white">✦</div>
      <h1 className="font-display mt-6 text-4xl font-semibold">Welcome back.</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">เข้าสู่ระบบเพื่อสร้างและจัดการเรื่องราวบน Pulse & Pixel</p>
      <p className="mt-3 text-xs text-[var(--muted)]"><RequiredMark /> ฟิลด์จำเป็น</p>
      <form onSubmit={login} className="mt-7 grid gap-4">
        <FormField label="อีเมล" htmlFor="login-email" required><Input id="login-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="รหัสผ่าน" htmlFor="login-password" required><Input id="login-password" required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField>
        {loginError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{loginError}</p>}
        <Button type="submit" className="mt-2 w-full">เข้าสู่ระบบ</Button>
      </form>
      <div className="mt-6 rounded-xl bg-[var(--surface-2)] p-4 text-xs leading-6 text-[var(--muted)]"><strong className="text-[var(--ink)]">Demo account</strong><br />admin@pulseandpixel.dev / Admin123!</div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--brand)]">Content studio</p><h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">จัดการเรื่องราว</h1></div>
        <div className="flex gap-2"><Button onClick={openCreate}><Plus size={17} /> บทความใหม่</Button><Button variant="outline" size="icon" onClick={logout} aria-label="ออกจากระบบ"><LogOut size={17} /></Button></div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[['บทความทั้งหมด', articles.length, FileText], ['เผยแพร่แล้ว', published, Eye], ['ฉบับร่าง', articles.length - published, Edit3]].map(([label, value, Icon]: any) => <div key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><Icon size={18} className="text-[var(--brand)]" /><p className="mt-5 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{label}</p></div>)}
      </div>

      {notice && <p className={noticeType === 'success' ? 'mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800' : 'mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700'} role={noticeType === 'error' ? 'alert' : 'status'}>{notice}</p>}

      {showEditor && <form onSubmit={save} className="mt-8 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-3xl font-semibold">{editing ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}</h2><p className="mt-2 text-xs text-[var(--muted)]"><RequiredMark /> ฟิลด์จำเป็น</p></div><button type="button" onClick={() => setShowEditor(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface-2)]" aria-label="ปิด"><X /></button></div>
        <div className="mt-7 grid gap-5">
          <FormField label="ชื่อบทความ" htmlFor="article-title" required><Input id="article-title" required maxLength={180} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="คำโปรย" htmlFor="article-excerpt" required hint={`${form.excerpt.length}/220 ตัวอักษร`}><Textarea id="article-excerpt" required maxLength={220} className="min-h-24" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></FormField>
          <FormField label="เนื้อหา" htmlFor="article-content" required hint="จัดรูปแบบได้ทันทีโดยไม่ต้องเขียน HTML" error={submitted && !hasMeaningfulContent(form.content) ? 'กรุณาเขียนเนื้อหาบทความ' : undefined}>
            <RichTextEditor id="article-content" required value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} apiUrl={apiUrl} token={token} disabled={saving} />
          </FormField>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="หมวดหมู่" htmlFor="article-category" required><Select id="article-category" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">เลือกหมวดหมู่</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField>
            <FormField label="สถานะ" htmlFor="article-status" required><Select id="article-status" required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EditorForm['status'] })}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option></Select></FormField>
          </div>
          <ImageInput id="article-cover" required value={form.coverImage} onChange={(coverImage) => setForm((current) => ({ ...current, coverImage }))} apiUrl={apiUrl} token={token} aspect={16 / 9} disabled={saving} label="รูปปก" validationError={submitted && !form.coverImage ? 'กรุณาอัปโหลดรูปปก' : undefined} />
          <FormField label="Alt text รูปปก" htmlFor="article-cover-alt" hint="แนะนำสำหรับ SEO และผู้ใช้ screen reader"><Input id="article-cover-alt" value={form.coverImageAlt} onChange={(e) => setForm({ ...form, coverImageAlt: e.target.value })} /></FormField>
          <FormField label="Tags" htmlFor="article-tags" hint="คั่นแต่ละ tag ด้วย comma"><Input id="article-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Design, UX, Research" /></FormField>
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> ตั้งเป็นบทความแนะนำ</label>
          <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={() => setShowEditor(false)}>ยกเลิก</Button><Button type="submit" disabled={saving}><Save size={17} /> {saving ? 'กำลังบันทึก…' : 'บันทึกบทความ'}</Button></div>
        </div>
      </form>}

      <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]">
        <div className="border-b border-[var(--line)] px-5 py-4"><h2 className="font-bold">บทความทั้งหมด</h2></div>
        <div className="divide-y divide-[var(--line)]">
          {articles.map((article) => <div key={article.id} className="grid gap-4 p-5 sm:grid-cols-[80px_1fr_auto] sm:items-center">
            <img src={article.coverImage} alt="" className="aspect-[4/3] h-16 w-20 rounded-xl object-cover" />
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge className={article.status === 'published' ? 'bg-emerald-50 text-emerald-700' : ''}>{article.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</Badge><span className="text-xs text-[var(--muted)]">{article.category.name}</span></div><h3 className="mt-2 truncate font-semibold">{article.title}</h3></div>
            <div className="flex gap-2"><a href={`/articles/${article.slug}`} target="_blank"><Button variant="ghost" size="icon" aria-label="ดูบทความ"><Eye size={17} /></Button></a><Button variant="ghost" size="icon" onClick={() => openEdit(article)} aria-label="แก้ไข"><Edit3 size={17} /></Button><Button variant="ghost" size="icon" onClick={() => remove(article)} aria-label="ลบ" className="text-red-600"><Trash2 size={17} /></Button></div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
