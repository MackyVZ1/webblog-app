import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  findByEmailWithPassword(email: string) {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  findPublicAuthors() {
    return this.users.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.AUTHOR }],
      select: ['id', 'name', 'bio', 'avatarUrl', 'role'],
    });
  }
}
