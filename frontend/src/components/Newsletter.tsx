import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Newsletter() {
  const [done, setDone] = useState(false);
  function subscribe(event: { preventDefault(): void }) {
    event.preventDefault();
    setDone(true);
  }
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[var(--brand)] px-6 py-10 text-white sm:px-10 md:px-14 md:py-14">
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/10" />
      <div className="relative grid items-end gap-8 md:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">The Sunday Signal</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">ไอเดียดี ๆ ที่คัดมาแล้ว ส่งถึงคุณเดือนละสองครั้ง</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">ไม่มีสแปม ไม่มีเสียงรบกวน มีเพียงเรื่องที่เราอยากเก็บไว้อ่านและส่งต่อ</p>
        </div>
        {done ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white/12 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--brand)]"><Check size={18} /></span><p className="font-semibold">ขอบคุณ! แล้วพบกันในฉบับหน้า</p></div>
        ) : (
          <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">อีเมล</label>
            <Input id="newsletter-email" required type="email" placeholder="you@example.com" className="border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-white" />
            <Button type="submit" className="shrink-0 bg-white text-[var(--ink)] hover:bg-[#eeeae0]">Subscribe <ArrowRight size={16} /></Button>
          </form>
        )}
      </div>
    </section>
  );
}
