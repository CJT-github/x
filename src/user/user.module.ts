import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Roles } from './entities/roles.entity';
import { Permission } from './entities/permission.entity';
import { Menus } from './entities/menus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Roles, Permission, Menus])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
