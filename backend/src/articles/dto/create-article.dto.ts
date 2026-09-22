import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';
import { ArticleStatus } from '../article.entity';

export class CreateArticleDto {
  @ApiProperty({ example: 'ออกแบบ Product ที่คนอยากใช้' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @IsString()
  @MaxLength(220)
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl({ require_protocol: true, require_tld: false, protocols: ['http', 'https'] })
  coverImage: string;

  @IsOptional()
  @IsString()
  coverImageAlt?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((tag) => tag.trim()) : value))
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
