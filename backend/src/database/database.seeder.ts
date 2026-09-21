import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Article, ArticleStatus } from '../articles/article.entity';
import { Category } from '../categories/category.entity';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
  ) {}

  async onModuleInit() {
    if ((await this.users.count()) > 0) return;
    this.logger.log('Seeding demo users, categories and articles…');

    const passwordHash = await hash('Admin123!', 10);
    const [admin, author, reader] = await this.users.save([
      this.users.create({
        name: 'มินตรา วัฒนกุล',
        email: 'admin@pulseandpixel.dev',
        role: UserRole.ADMIN,
        passwordHash,
        bio: 'บรรณาธิการที่เชื่อว่าเทคโนโลยีที่ดีต้องช่วยให้ชีวิตมีพื้นที่หายใจ',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      }),
      this.users.create({
        name: 'ธันวา ศรีพงษ์',
        email: 'author@pulseandpixel.dev',
        role: UserRole.AUTHOR,
        passwordHash: await hash('Author123!', 10),
        bio: 'นักออกแบบผลิตภัณฑ์ นักเขียน และคนชอบทดลองเครื่องมือใหม่',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      }),
      this.users.create({
        name: 'พิมพ์ชนก ใจดี',
        email: 'reader@example.com',
        role: UserRole.USER,
        passwordHash: await hash('Reader123!', 10),
        bio: 'นักอ่านตัวยงและสมาชิกชุมชน Pulse & Pixel',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      }),
    ]);

    const categoryRows = await this.categories.save([
      { name: 'Technology', slug: 'technology', description: 'เทคโนโลยีที่กำลังเปลี่ยนวิธีคิดและวิธีทำงานของเรา', color: '#2f7d73', icon: 'Cpu' },
      { name: 'Design', slug: 'design', description: 'งานออกแบบที่สวย ใช้ได้จริง และเคารพผู้ใช้', color: '#d66345', icon: 'PenTool' },
      { name: 'Business', slug: 'business', description: 'กลยุทธ์ ธุรกิจ และบทเรียนจากคนลงมือสร้าง', color: '#8771b6', icon: 'Briefcase' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'ใช้ชีวิตอย่างตั้งใจในโลกที่เคลื่อนไหวไม่หยุด', color: '#cf9540', icon: 'Coffee' },
      { name: 'Sustainability', slug: 'sustainability', description: 'ไอเดียเล็กและใหญ่เพื่ออนาคตที่ยั่งยืน', color: '#5c8b51', icon: 'Leaf' },
      { name: 'Culture', slug: 'culture', description: 'สำรวจผู้คน เมือง หนังสือ และวัฒนธรรมร่วมสมัย', color: '#b55c75', icon: 'BookOpen' },
    ].map((item) => this.categories.create(item)));
    const category = Object.fromEntries(categoryRows.map((item) => [item.slug, item]));

    const stories = [
      {
        title: 'AI ไม่ได้มาแทนที่ความคิดสร้างสรรค์ แต่มาขยายมัน',
        slug: 'ai-augments-creativity',
        excerpt: 'เมื่อ AI กลายเป็นเพื่อนร่วมทีม เราจะออกแบบกระบวนการทำงานที่ยังคงเสียงของตัวเองไว้ได้อย่างไร',
        content: `<p class="lead">คำถามสำคัญอาจไม่ใช่ “AI จะทำอะไรแทนเรา” แต่คือ “เราจะใช้มันเพื่อไปให้ไกลกว่าที่เคยได้อย่างไร”</p><h2>เริ่มจากปัญหา ไม่ใช่เครื่องมือ</h2><p>ทีมที่ได้ประโยชน์จาก AI มากที่สุดไม่ได้เริ่มจากการไล่ลองทุกโมเดล พวกเขาเริ่มจากงานที่กินเวลา คอขวด และช่วงที่ต้องการมุมมองเพิ่ม จากนั้นจึงเลือกเครื่องมือที่เหมาะกับบริบท</p><blockquote>เทคโนโลยีที่ดีไม่ควรกลบเสียงของเรา แต่ช่วยให้เสียงนั้นชัดขึ้น</blockquote><h2>สร้างวงจรทดลองที่เล็กพอ</h2><p>กำหนดโจทย์หนึ่งชิ้น สร้างต้นแบบ วัดผล แล้วบันทึกสิ่งที่เรียนรู้ การทดลองสั้น ๆ ทำให้ทีมเห็นทั้งศักยภาพและข้อจำกัดโดยไม่ฝากอนาคตทั้งหมดไว้กับกระแส</p><h3>หลักคิดสามข้อ</h3><ul><li>ให้มนุษย์เป็นเจ้าของเจตนาและการตัดสินใจสุดท้าย</li><li>ตรวจสอบที่มา ความถูกต้อง และอคติของผลลัพธ์</li><li>เก็บพื้นที่สำหรับความบังเอิญและรสนิยมส่วนบุคคล</li></ul><p>เมื่อเราใช้ AI เป็นวัสดุชนิดหนึ่งในกล่องเครื่องมือ ความคิดสร้างสรรค์จะไม่หายไป แต่มีพื้นที่ให้ลองได้มากขึ้นกว่าเดิม</p>`,
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'ประติมากรรมดิจิทัลสีม่วงสื่อถึงปัญญาประดิษฐ์',
        tags: ['AI', 'Creativity', 'Future of Work'], category: category.technology, author: admin, featured: true, readingTime: 6,
      },
      {
        title: 'ออกแบบ Digital Product ให้คนรู้สึกว่า “มันเข้าใจเรา”',
        slug: 'designing-products-with-empathy',
        excerpt: 'แนวทางสร้างประสบการณ์ที่เรียบง่าย มีบุคลิก และเริ่มจากความเข้าใจคนจริง ๆ',
        content: `<p class="lead">ความเรียบง่ายไม่ใช่การเอาของออกให้มากที่สุด แต่คือการเหลือสิ่งที่ผู้ใช้ต้องการในจังหวะที่พอดี</p><h2>ฟังก่อนวาด</h2><p>บทสนทนากับผู้ใช้เพียงห้าคนอาจเปลี่ยนสมมติฐานของทั้งทีม จับตาคำที่พวกเขาใช้ วิธีแก้ปัญหาเฉพาะหน้า และสิ่งที่ไม่เคยพูดออกมาตรง ๆ</p><h2>ออกแบบสำหรับวันธรรมดา</h2><p>อย่าทดสอบเฉพาะ happy path คนใช้ผลิตภัณฑ์ตอนรีบ มือเดียว สัญญาณไม่ดี หรือกำลังเครียด ข้อความที่ชัดและการกู้คืนจากข้อผิดพลาดจึงสำคัญพอ ๆ กับหน้าจอที่สวย</p><blockquote>Empathy ที่วัดผลได้ คือจำนวนครั้งที่เราช่วยให้คนไม่ต้องหยุดคิดกับสิ่งที่ไม่จำเป็น</blockquote><p>จุดหมายไม่ใช่อินเทอร์เฟซที่ไร้รอยต่อ แต่เป็นความไว้ใจที่ค่อย ๆ เกิดจากรายละเอียดเล็ก ๆ ทุกครั้งที่ใช้งาน</p>`,
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'ทีมออกแบบกำลังระดมความคิดหน้ากระดาน',
        tags: ['UX', 'Product Design', 'Research'], category: category.design, author, featured: true, readingTime: 5,
      },
      {
        title: 'บทเรียนจากแบรนด์เล็กที่เติบโตโดยไม่ทิ้งตัวตน',
        slug: 'small-brands-big-identity',
        excerpt: 'การเติบโตที่ดีอาจไม่ได้เริ่มจากงบโฆษณา แต่เริ่มจากความชัดเจนว่าเราสร้างคุณค่าให้ใคร',
        content: `<p class="lead">แบรนด์ที่น่าจดจำไม่ได้พูดเสียงดังที่สุด แต่พูดเรื่องเดิมอย่างจริงใจและสม่ำเสมอ</p><h2>เลือกคนที่อยากรับใช้</h2><p>เมื่อลูกค้าเป้าหมายชัด การตัดสินใจตั้งแต่ผลิตภัณฑ์ ราคา ไปจนถึงภาษาที่ใช้จะง่ายขึ้น ความเฉพาะเจาะจงสร้างแรงดึงดูดได้ดีกว่าข้อความที่พยายามถูกใจทุกคน</p><h2>ระบบชนะไวรัล</h2><p>คอนเทนต์หนึ่งชิ้นอาจดังชั่วข้ามคืน แต่ระบบรับฟังลูกค้าและวงจรส่งมอบคุณค่าที่สม่ำเสมอคือสิ่งที่ทำให้ธุรกิจอยู่รอด</p><ul><li>บันทึกคำถามที่ลูกค้าถามซ้ำ</li><li>เปลี่ยนคำถามเป็นเนื้อหาและการปรับปรุงสินค้า</li><li>วัดการกลับมาใช้ซ้ำมากกว่ายอดเห็น</li></ul>`,
        coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'ทีมธุรกิจขนาดเล็กประชุมร่วมกัน',
        tags: ['Brand', 'Growth', 'Strategy'], category: category.business, author: admin, featured: false, readingTime: 4,
      },
      {
        title: 'Slow Morning: ทวงคืนชั่วโมงแรกของวัน',
        slug: 'slow-morning-routine',
        excerpt: 'กิจวัตรเช้าที่ไม่เน้น productivity แต่ช่วยให้เราเริ่มวันอย่างมีจังหวะของตัวเอง',
        content: `<p class="lead">ก่อนโลกจะเรียกร้องความสนใจ ลองให้เวลาตัวเองได้ยินเสียงข้างในสักครู่</p><h2>ไม่ต้องเป็นกิจวัตรที่สมบูรณ์แบบ</h2><p>เช้าที่ดีอาจมีเพียงน้ำหนึ่งแก้ว เปิดหน้าต่าง และไม่แตะโทรศัพท์สิบห้านาที จุดประสงค์คือสร้างช่องว่างระหว่างการตื่นกับการตอบสนองต่อโลกภายนอก</p><h2>เลือกหนึ่งสมอ</h2><p>หากทำทุกอย่างไม่ได้ ให้เลือกกิจกรรมเดียวที่พากลับมาหาตัวเอง เช่น ชงกาแฟ เดินรอบบ้าน หรือเขียนสามบรรทัด ความสม่ำเสมอเล็ก ๆ มีพลังมากกว่าตารางที่แน่นจนทำจริงไม่ได้</p>`,
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'โต๊ะทำงานยามเช้าพร้อมกาแฟและสมุด',
        tags: ['Wellbeing', 'Habits', 'Mindfulness'], category: category.lifestyle, author, featured: false, readingTime: 4,
      },
      {
        title: 'เมือง 15 นาที เมื่อคุณภาพชีวิตเริ่มที่ระยะเดิน',
        slug: 'fifteen-minute-city',
        excerpt: 'สำรวจแนวคิดเมืองที่งาน โรงเรียน ร้านค้า และพื้นที่สีเขียวอยู่ใกล้กว่าที่เคย',
        content: `<p class="lead">ถ้าความต้องการประจำวันอยู่ห่างออกไปเพียงสิบห้านาที เมืองจะคืนเวลาให้เราได้มากแค่ไหน</p><h2>เวลาเป็นโครงสร้างพื้นฐาน</h2><p>การเดินทางที่สั้นลงไม่เพียงลดคาร์บอน แต่เปิดโอกาสให้คนมีเวลากับครอบครัว ชุมชน และสุขภาพของตัวเอง การออกแบบเมืองจึงเป็นการออกแบบชีวิตประจำวัน</p><h2>ไม่มีสูตรเดียวสำหรับทุกเมือง</h2><p>ย่านเก่า เมืองใหม่ และชุมชนชานเมืองต้องใช้วิธีต่างกัน หัวใจคือการฟังคนในพื้นที่ กระจายบริการ และสร้างทางเลือกการเดินทางที่ปลอดภัยสำหรับทุกวัย</p>`,
        coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'มุมสูงของเมืองที่มีพื้นที่สีเขียว',
        tags: ['Cities', 'Climate', 'Community'], category: category.sustainability, author: admin, featured: true, readingTime: 7,
      },
      {
        title: 'Independent Bookstore: พื้นที่เล็กที่ทำให้เมืองมีเรื่องเล่า',
        slug: 'independent-bookstores-city-stories',
        excerpt: 'ร้านหนังสืออิสระกำลังเป็นทั้งพื้นที่วัฒนธรรม ชุมชน และประตูสู่บทสนทนาใหม่',
        content: `<p class="lead">ร้านหนังสือที่ดีไม่ได้มีเพียงหนังสือที่เราอยากได้ แต่มีเล่มที่เราไม่รู้มาก่อนว่าอยากอ่าน</p><h2>การคัดสรรคือเสียงของร้าน</h2><p>ชั้นหนังสือแต่ละชั้นสะท้อนสายตาของคนขาย หนังสือท้องถิ่น ซีนนอกกระแส และงานแปลขนาดเล็กได้รับพื้นที่ที่หาไม่ได้จากอัลกอริทึมทั่วไป</p><h2>มากกว่าการซื้อขาย</h2><p>วงอ่านหนังสือ นิทรรศการ และบทสนทนากับนักเขียนทำให้ร้านกลายเป็นห้องนั่งเล่นของเมือง ที่คนแปลกหน้าพบกันผ่านความสนใจร่วม</p>`,
        coverImage: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'ชั้นหนังสือในร้านหนังสืออิสระ',
        tags: ['Books', 'Community', 'City'], category: category.culture, author, featured: false, readingTime: 5,
      },
      {
        title: 'จาก Prototype สู่ Production โดยไม่ทำให้ทีมหมดแรง',
        slug: 'prototype-to-production',
        excerpt: 'เช็กลิสต์เชื่อมช่องว่างระหว่างเดโมที่น่าตื่นเต้นกับผลิตภัณฑ์ที่ดูแลได้จริง',
        content: `<p class="lead">Prototype พิสูจน์ว่าไอเดียเป็นไปได้ ส่วน production พิสูจน์ว่าเราดูแลคำสัญญานั้นได้ต่อเนื่อง</p><h2>นิยามคำว่าเสร็จใหม่</h2><p>นอกจากฟีเจอร์ทำงาน ทีมต้องเห็นเรื่อง accessibility, performance, observability, security และเส้นทางเมื่อเกิดข้อผิดพลาดตั้งแต่ต้น</p><h2>ลดความประหลาดใจ</h2><p>บันทึกการตัดสินใจทางเทคนิค ใช้ environment ให้ใกล้เคียงกัน และส่งมอบทีละส่วนหลัง feature flag การทำงานที่มองเห็นได้ช่วยลดแรงกดดันช่วงเปิดตัว</p>`,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'หน้าจอคอมพิวเตอร์แสดงซอร์สโค้ด',
        tags: ['Engineering', 'Product', 'DevOps'], category: category.technology, author, featured: false, readingTime: 8,
      },
      {
        title: 'Creative Confidence ฝึกความกล้าที่จะสร้างในทุกวัน',
        slug: 'creative-confidence-every-day',
        excerpt: 'ความคิดสร้างสรรค์ไม่ใช่พรสวรรค์ของคนไม่กี่คน แต่เป็นกล้ามเนื้อที่ฝึกได้ผ่านการลงมือเล็ก ๆ',
        content: `<p class="lead">เราไม่ได้ขาดไอเดียเสมอไป บ่อยครั้งเราเพียงกลัวว่าไอเดียแรกจะยังไม่ดีพอ</p><h2>ทำให้เล็กจนเริ่มได้</h2><p>ร่างหนึ่งหน้า ถ่ายหนึ่งภาพ หรือทำต้นแบบในครึ่งชั่วโมง เมื่อเดิมพันเล็ก สมองจะยอมให้เราสำรวจ และสิ่งที่ทำเสร็จจะกลายเป็นวัตถุดิบของงานชิ้นถัดไป</p><h2>แยกการสร้างออกจากการตัดสิน</h2><p>ช่วงสร้างต้องการความเปิดกว้าง ช่วงเลือกต้องการมาตรฐาน อย่าให้เสียงวิจารณ์เข้ามาเร็วเกินจนไม่มีอะไรให้เลือก</p>`,
        coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=85',
        coverImageAlt: 'โต๊ะศิลปินที่เต็มไปด้วยสีและพู่กัน',
        tags: ['Creativity', 'Practice', 'Mindset'], category: category.design, author: admin, featured: false, readingTime: 5,
      },
    ];

    await this.articles.save(stories.map((story, index) => this.articles.create({
      ...story,
      categoryId: story.category.id,
      authorId: story.author.id,
      status: ArticleStatus.PUBLISHED,
      views: [2840, 1920, 1540, 1320, 2180, 980, 1750, 1430][index],
      publishedAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 3),
    })));

    this.logger.log(`Seed complete: 3 users, ${categoryRows.length} categories, ${stories.length} articles`);
  }
}
