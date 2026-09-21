import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Column({ default: '#1f766f' })
  color: string;

  @Column({ default: 'Sparkles' })
  icon: string;

  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];
}

