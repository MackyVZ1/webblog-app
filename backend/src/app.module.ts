import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseSeeder } from './database/database.seeder';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { Article } from './articles/article.entity';
import { Category } from './categories/category.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT || 5432),
      username: process.env.DATABASE_USER || 'webblog',
      password: process.env.DATABASE_PASSWORD || 'webblog_secret',
      database: process.env.DATABASE_NAME || 'webblog',
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    TypeOrmModule.forFeature([User, Category, Article]),
    UsersModule,
    CategoriesModule,
    ArticlesModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseSeeder],
})
export class AppModule {}
