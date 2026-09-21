import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Article, ArticleList } from '../lib/api';
import { Input } from './ui/input';

export function SearchExperience({ apiUrl, initialQuery = '' }: { apiUrl: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) { setItems([]); return; }
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/articles?search=${encodeURIComponent(query)}&limit=20`);
        const data: ArticleList = await response.json();
        setItems(data.items);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, apiUrl]);

  return (
    <div>
      <div className="relative mx-auto max-w-3xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ลองค้นหา AI, Design, ชีวิต…" className="h-16 rounded-2xl pl-14 pr-14 text-lg shadow-xl shadow-black/5" />
        {query && <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-label="ล้างคำค้น"><X /></button>}
      </div>
      <div className="mt-10">
        {loading && <p className="text-center text-sm text-[var(--muted)]">กำลังค้นหา…</p>}
        {!loading && query.length >= 2 && <p className="mb-5 text-sm text-[var(--muted)]">พบ {items.length} บทความสำหรับ “{query}”</p>}
        <div className="grid gap-4">
          {items.map((item) => <a key={item.id} href={`/articles/${item.slug}`} className="group grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--brand)] sm:grid-cols-[150px_1fr]">
            <img src={item.coverImage} alt="" className="aspect-[16/9] h-full w-full rounded-xl object-cover sm:aspect-auto" />
            <div className="py-1"><p className="text-xs font-bold uppercase tracking-wider" style={{ color: item.category.color }}>{item.category.name}</p><h2 className="font-display mt-2 text-2xl font-semibold group-hover:text-[var(--brand)]">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{item.excerpt}</p></div>
          </a>)}
        </div>
        {!loading && query.length >= 2 && items.length === 0 && <div className="py-16 text-center"><p className="font-display text-3xl">ยังไม่พบเรื่องที่ตรงกัน</p><p className="mt-2 text-sm text-[var(--muted)]">ลองใช้คำที่สั้นลง หรือค้นหาด้วยชื่อหมวดหมู่</p></div>}
      </div>
    </div>
  );
}

