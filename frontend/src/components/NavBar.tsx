import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '../lib/api';
import { Button } from './ui/button';

export function NavBar({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const links = categories.slice(0, 4);
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2" aria-label="Pulse & Pixel home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ink)] text-lg text-white">✦</span>
          <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Pulse <i className="text-[var(--accent)]">&</i> Pixel</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="เมนูหลัก">
          {links.map((item) => <a key={item.id} className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]" href={`/categories/${item.slug}`}>{item.name}</a>)}
          <a className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]" href="/about">About</a>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <a className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white" href="/search" aria-label="ค้นหา"><Search size={19} /></a>
          <a href="/admin"><Button size="sm" variant="outline">Admin</Button></a>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="เปิดเมนู">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="container-shell border-t border-[var(--line)] py-5 lg:hidden" aria-label="เมนูมือถือ">
          <div className="grid gap-1">
            {categories.map((item) => <a key={item.id} className="rounded-xl px-4 py-3 font-semibold hover:bg-white" href={`/categories/${item.slug}`}>{item.name}</a>)}
            <a className="rounded-xl px-4 py-3 font-semibold hover:bg-white" href="/search">ค้นหาบทความ</a>
            <a className="rounded-xl px-4 py-3 font-semibold hover:bg-white" href="/about">เกี่ยวกับเรา</a>
            <a className="mt-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-center font-semibold text-white" href="/admin">เข้าสู่ระบบ Admin</a>
          </div>
        </nav>
      )}
    </header>
  );
}

