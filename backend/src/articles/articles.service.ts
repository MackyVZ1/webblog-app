import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import { Repository } from 'typeorm';
import { createSlug } from '../common/slug';
import { Article, ArticleStatus } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

interface ArticleQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  includeDrafts?: boolean;
}

@Injectable()
export class ArticlesService {
  constructor(@InjectRepository(Article) private readonly articles: Repository<Article>) {}

  async findAll(query: ArticleQuery = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 9));
    const qb = this.articles
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (!query.includeDrafts) qb.andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });
    if (query.category) qb.andWhere('category.slug = :category', { category: query.category });
    if (query.featured !== undefined) qb.andWhere('article.featured = :featured', { featured: query.featured });
    if (query.search) {
      qb.andWhere('(article.title ILIKE :search OR article.excerpt ILIKE :search OR article.tags ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const article = await this.articles.findOne({ where: { slug, status: ArticleStatus.PUBLISHED } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async findOne(id: string) {
    const article = await this.articles.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(dto: CreateArticleDto, authorId: string) {
    let slug = createSlug(dto.title);
    const existing = await this.articles.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
    const article = this.articles.create({
      ...dto,
      content: this.sanitizeContent(dto.content),
      slug,
      authorId,
      tags: dto.tags || [],
      status: dto.status || ArticleStatus.DRAFT,
      readingTime: this.calculateReadingTime(dto.content),
      publishedAt: dto.status === ArticleStatus.PUBLISHED ? new Date() : undefined,
    });
    return this.articles.save(article);
  }

  async update(id: string, dto: UpdateArticleDto) {
    const article = await this.findOne(id);
    if (dto.title && dto.title !== article.title) article.slug = createSlug(dto.title);
    const wasDraft = article.status === ArticleStatus.DRAFT;
    const safeDto = dto.content ? { ...dto, content: this.sanitizeContent(dto.content) } : dto;
    Object.assign(article, safeDto);
    if (safeDto.content) article.readingTime = this.calculateReadingTime(safeDto.content);
    if (dto.status === ArticleStatus.PUBLISHED && wasDraft) article.publishedAt = new Date();
    return this.articles.save(article);
  }

  async remove(id: string) {
    const article = await this.findOne(id);
    await this.articles.remove(article);
    return { deleted: true };
  }

  private calculateReadingTime(content: string) {
    const words = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  }

  private sanitizeContent(content: string) {
    const clean = sanitizeHtml(content, {
      allowedTags: [
        'p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 's', 'code', 'pre',
        'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'img',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'title'],
        p: ['style'],
        h2: ['style'],
        h3: ['style'],
        h4: ['style'],
      },
      allowedStyles: {
        '*': { 'text-align': [/^(left|center|right)$/] },
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      allowedSchemesByTag: { img: ['http', 'https'] },
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
      },
    });
    const plainText = sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} })
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (!plainText && !clean.includes('<img')) {
      throw new BadRequestException('Article content cannot be empty');
    }
    return clean;
  }
}
