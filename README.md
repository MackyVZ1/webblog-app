# Pulse & Pixel — Full-stack Web Blog

เว็บบล็อก full-stack สำหรับใช้เป็นผลงานบน GitHub ออกแบบมาให้พร้อมทั้งฝั่งผู้อ่านและระบบจัดการเนื้อหา โดยเน้น SEO, ประสบการณ์เขียนบทความที่ใช้งานง่าย และ responsive design ตั้งแต่ mobile ถึง desktop

## จุดเด่นของโปรเจกต์

- หน้าเว็บสาธารณะสำหรับอ่านบทความ ค้นหา และเลือกดูตามหมวดหมู่
- Admin dashboard สำหรับสร้าง แก้ไข เผยแพร่ เก็บเป็นฉบับร่าง และลบบทความ
- Rich Text Editor รองรับหัวข้อ รายการ ลิงก์ รูปภาพ การจัดตำแหน่ง และรูปแบบข้อความ
- Image input แบบ reusable รองรับ drag & drop, preview, crop และ zoom
- อัปโหลดรูปปกและรูปในเนื้อหาจากไฟล์โดยตรง ไม่ต้องกรอก URL เอง
- Backend ตรวจสอบไฟล์และแปลงรูปเป็น WebP ก่อนบันทึกลง persistent volume
- Form components รองรับ required field, เครื่องหมาย `*`, validation message และ accessibility attributes
- Mock data พร้อมใช้งาน: ผู้ใช้ 3 บัญชี, 6 หมวดหมู่ และ 8 บทความ
- SEO ครบทั้ง metadata, canonical URL, Open Graph, Twitter Card, JSON-LD, sitemap, RSS และ robots.txt
- Responsive design ที่ breakpoints `sm`, `md` และ `lg`
- เปิดระบบทั้งหมดด้วย Docker Compose เพียงคำสั่งเดียว

## Tech stack

| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend | Astro SSR, React, TypeScript, Tailwind CSS, shadcn/ui patterns |
| Editor | Tiptap |
| Image crop | react-easy-crop |
| Backend | NestJS, TypeScript, TypeORM |
| Database | PostgreSQL 16 |
| Authentication | JWT, bcrypt |
| Image processing | Multer, Sharp |
| API documentation | Swagger / OpenAPI |
| Runtime | Docker, Docker Compose, Node.js 22 |

## เริ่มต้นใช้งาน

### สิ่งที่ต้องมี

- Docker Desktop หรือ Docker Engine ที่รองรับ Docker Compose
- พอร์ต `4321` และ `3000` ว่างสำหรับใช้งาน

### รันโปรเจกต์

```bash
git clone https://github.com/MackyVZ1/webblog-app.git
cd webblog-app
docker compose up --build
```

เมื่อทุก service พร้อมแล้ว เปิดใช้งานได้ที่:

| บริการ | URL |
| --- | --- |
| เว็บไซต์ | http://localhost:4321 |
| Admin dashboard | http://localhost:4321/admin |
| REST API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/api/health |
| Uploaded images | `http://localhost:3000/uploads/<filename>.webp` |

หยุดระบบด้วย:

```bash
docker compose down
```

ข้อมูล PostgreSQL และรูปที่อัปโหลดจะยังอยู่ใน Docker volumes หลังหยุดระบบ หากต้องการล้างข้อมูลทั้งหมดและเริ่ม seed ใหม่ ให้ใช้ `docker compose down -v` (คำสั่งนี้จะลบข้อมูลใน volumes)

## บัญชีทดลอง

| บทบาท | Email | Password | ใช้งาน |
| --- | --- | --- | --- |
| Admin | `admin@pulseandpixel.dev` | `Admin123!` | เข้าสู่ระบบ Admin และจัดการบทความ |
| Author | `author@pulseandpixel.dev` | `Author123!` | ข้อมูลผู้เขียนจำลอง |
| Reader | `reader@example.com` | `Reader123!` | ข้อมูลผู้อ่านจำลอง |

> บัญชีเหล่านี้มีไว้สำหรับ local development และ demo เท่านั้น กรุณาเปลี่ยน credentials และ `JWT_SECRET` ก่อนนำไป deploy จริง

ระบบจะสร้าง mock data อัตโนมัติเมื่อฐานข้อมูลยังไม่มีผู้ใช้ ประกอบด้วยหมวด Technology, Design, Business, Lifestyle, Sustainability และ Culture

## การใช้งานระบบ Admin

1. เปิด http://localhost:4321/admin และเข้าสู่ระบบด้วยบัญชี Admin
2. กรอกชื่อบทความ คำโปรย หมวดหมู่ สถานะ และเนื้อหา
3. เลือกรูปปกจากเครื่อง จากนั้น crop และ zoom ให้ได้สัดส่วนที่ต้องการ
4. แทรกรูปใน Rich Text Editor ได้ด้วยการเลือกไฟล์และ crop เช่นเดียวกัน
5. เลือกเผยแพร่ทันทีหรือบันทึกเป็นฉบับร่าง

ฟิลด์ที่จำเป็นจะแสดงเครื่องหมาย `*` พร้อม validation ทั้งจาก browser, frontend และ backend ก่อนบันทึกข้อมูล

### Image upload pipeline

```text
เลือกไฟล์ → Preview / Crop → ส่ง multipart/form-data
          → NestJS ตรวจชนิดและขนาด → Sharp แปลงเป็น WebP
          → เก็บใน uploads_data → บันทึก URL ลง PostgreSQL
```

- รองรับ JPEG, PNG, WebP และ AVIF
- จำกัดขนาดไฟล์ไม่เกิน 10 MB
- จำกัดความกว้าง/ความสูงสูงสุด 2,400 px โดยคงอัตราส่วน
- ไฟล์ถูกเก็บใน Docker volume `uploads_data`
- Endpoint อัปโหลดต้องใช้ Bearer token

## หน้าเว็บ

| Route | รายละเอียด |
| --- | --- |
| `/` | หน้าแรกและบทความแนะนำ |
| `/articles/[slug]` | รายละเอียดบทความพร้อม structured data |
| `/categories/[slug]` | บทความแยกตามหมวดหมู่ |
| `/search?q=...` | ค้นหาบทความ |
| `/about` | เกี่ยวกับเว็บไซต์และผู้เขียน |
| `/admin` | เข้าสู่ระบบและจัดการบทความ |
| `/rss.xml` | RSS feed |
| `/sitemap.xml` | XML sitemap |
| `/robots.txt` | คำแนะนำสำหรับ search engine crawlers |

## REST API

ทุก endpoint มี prefix เป็น `/api` และ endpoint ที่มีสัญลักษณ์ 🔒 ต้องส่ง header `Authorization: Bearer <token>`

| Method | Endpoint | รายละเอียด |
| --- | --- | --- |
| `POST` | `/api/auth/login` | เข้าสู่ระบบและรับ JWT |
| `GET` | `/api/articles` | แสดงบทความที่เผยแพร่ รองรับ pagination และ filter |
| `GET` | `/api/articles/:slug` | อ่านบทความจาก slug |
| `GET` | `/api/articles/admin/all` 🔒 | แสดงบทความรวมฉบับร่าง |
| `POST` | `/api/articles` 🔒 | สร้างบทความ |
| `PATCH` | `/api/articles/:id` 🔒 | แก้ไขบทความ |
| `DELETE` | `/api/articles/:id` 🔒 | ลบบทความ |
| `GET` | `/api/categories` | แสดงหมวดหมู่ทั้งหมด |
| `GET` | `/api/categories/:slug` | แสดงข้อมูลหมวดหมู่จาก slug |
| `GET` | `/api/users/authors` | แสดงข้อมูลผู้เขียนแบบ public |
| `POST` | `/api/uploads/images` 🔒 | อัปโหลดและ optimize รูปภาพ |
| `GET` | `/api/health` | ตรวจสอบสถานะ Backend |

รายละเอียด request/response และทดลองเรียก API ได้จาก Swagger UI ที่ http://localhost:3000/api/docs

ตัวอย่าง query สำหรับบทความ:

```text
GET /api/articles?page=1&limit=6&category=technology&search=AI&featured=true
```

## โครงสร้างโปรเจกต์

```text
webblog-app/
├── frontend/
│   ├── src/
│   │   ├── components/     # React/Astro components และ UI primitives
│   │   ├── layouts/        # Layout และ SEO metadata
│   │   ├── lib/            # API client และ utilities
│   │   └── pages/          # Astro file-based routes
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── articles/       # Article CRUD และ DTO validation
│   │   ├── auth/           # JWT authentication
│   │   ├── categories/     # Category API
│   │   ├── database/       # Mock data seeder
│   │   ├── uploads/        # Upload และ image processing
│   │   └── users/          # User/author API
│   ├── Dockerfile
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## Environment variables

Docker Compose มีค่าเริ่มต้นสำหรับ local development อยู่แล้ว หากต้องการกำหนดค่าเอง ให้คัดลอกไฟล์ตัวอย่าง:

```bash
cp .env.example .env
```

| Variable | ค่าเริ่มต้น/ตัวอย่าง | รายละเอียด |
| --- | --- | --- |
| `POSTGRES_DB` | `webblog` | ชื่อฐานข้อมูล |
| `POSTGRES_USER` | `webblog` | ผู้ใช้ PostgreSQL |
| `POSTGRES_PASSWORD` | `webblog_secret` | รหัสผ่าน PostgreSQL |
| `JWT_SECRET` | `change-me-in-production` | secret สำหรับลงนาม JWT |
| `PUBLIC_API_URL` | `http://localhost:3000` | URL API ที่ browser เข้าถึงได้ |
| `PUBLIC_BACKEND_URL` | `http://localhost:3000` | base URL สำหรับ URL รูปที่ backend ส่งกลับ |
| `PUBLIC_SITE_URL` | `http://localhost:4321` | canonical origin ของเว็บไซต์ |
| `INTERNAL_API_URL` | `http://backend:3000` | URL ที่ Astro SSR ใช้เรียก backend ภายใน Docker network |
| `UPLOAD_DIR` | `./uploads` | โฟลเดอร์เก็บรูปเมื่อรัน backend นอก Docker |

หลังเปลี่ยนตัวแปรที่ขึ้นต้นด้วย `PUBLIC_` ควร build frontend image ใหม่ เพราะบางค่าจะถูกฝังใน build output

## พัฒนาแบบไม่ใช้ Docker

ต้องมี Node.js `22.12+` และ PostgreSQL ที่กำลังทำงานอยู่ จากนั้นติดตั้ง dependency แยกในแต่ละ service:

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run start:dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

คำสั่งตรวจสอบคุณภาพโค้ด:

```bash
# Frontend type-check และ production build
cd frontend
npm run build

# Backend lint, test และ build
cd backend
npm run lint
npm test
npm run build
```

## หมายเหตุสำหรับ Production

- เปลี่ยน `JWT_SECRET` และ database credentials เป็นค่าที่ปลอดภัย
- ตั้ง `PUBLIC_SITE_URL`, `PUBLIC_API_URL` และ `PUBLIC_BACKEND_URL` เป็น HTTPS URL จริง
- จำกัด `FRONTEND_ORIGIN` ให้ตรงกับ domain ที่อนุญาต
- ใช้ object storage เช่น S3-compatible storage แทน local volume หากต้อง scale หลาย instance
- ใช้ database migrations แทน schema synchronization และปิด demo seeder
- วาง reverse proxy/CDN ด้านหน้า frontend, API และ uploaded images

---

สร้างขึ้นเพื่อสาธิตการพัฒนาเว็บ full-stack ด้วย Astro, React, NestJS และ PostgreSQL ในรูปแบบที่เริ่มใช้งานได้ด้วย Docker Compose
