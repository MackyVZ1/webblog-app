import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categories: Repository<Category>) {}

  findAll() {
    return this.categories
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.articleCount', 'category.articles', 'article', (qb) =>
        qb.where('article.status = :status', { status: 'published' }),
      )
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  async findBySlug(slug: string) {
    const category = await this.categories.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}

