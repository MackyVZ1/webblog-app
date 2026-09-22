# Pulse & Pixel — Web Blog

เว็บบล็อก full-stack สำหรับ portfolio ที่เน้น SEO, responsive design และ content management สร้างด้วย Astro + React + Tailwind CSS + shadcn/ui และ NestJS + PostgreSQL

## เริ่มใช้งาน

ต้องมี Docker Desktop แล้วรันคำสั่งเดียวจากโฟลเดอร์นี้:

```bash
docker compose up --build
```

- เว็บไซต์: http://localhost:4321
- Admin: http://localhost:4321/admin
- REST API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- Uploaded images: `http://localhost:3000/uploads/<filename>.webp`

บัญชีแอดมินจำลอง:

- Email: `admin@pulseandpixel.dev`
- Password: `Admin123!`

ระบบ seed หมวดหมู่ บทความ ผู้ใช้ และแอดมินให้อัตโนมัติเมื่อฐานข้อมูลว่าง

## โครงสร้าง

```text
webblog-app/
├── frontend/        # Astro SSR + React islands + Tailwind + shadcn/ui
├── backend/         # NestJS REST API + TypeORM
└── docker-compose.yml
```

## ฟีเจอร์สำคัญ

- หน้า Home, หมวดหมู่, รายละเอียดบทความ และค้นหา
- Admin login พร้อม Rich Text Editor สำหรับเพิ่ม แก้ไข จัดรูปแบบ เผยแพร่ และลบบทความ
- Image input แบบ reusable: เลือกไฟล์, drag & drop, crop/zoom และใช้ได้ทั้งรูปปกกับรูปในบทความ
- รูปถูกตรวจสอบและ optimize เป็น WebP ก่อนเก็บใน Docker volume โดย URL จะถูกบันทึกกับบทความใน PostgreSQL
- Metadata, canonical URL, Open Graph, Twitter card, JSON-LD, sitemap และ robots.txt
- REST API พร้อม Swagger และ health check
- Responsive ที่ breakpoints `sm`, `md`, `lg`
- PostgreSQL volume สำหรับเก็บข้อมูลข้ามการ restart

## คำสั่งสำหรับพัฒนาแบบไม่ใช้ Docker

ต้องใช้ Node.js 22.12 ขึ้นไป และ PostgreSQL ที่กำลังทำงานอยู่

```bash
# backend
cd backend && npm install && npm run start:dev

# frontend (อีก terminal)
cd frontend && npm install && npm run dev
```

สำหรับ production ให้เปลี่ยน `JWT_SECRET`, database credentials และ `site` ใน `frontend/astro.config.mjs`
