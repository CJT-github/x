import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Menus } from './menus.entity';

@Entity({
  name: 'roles',
})
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '角色名',
  })
  name: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission',
  })
  permissions: Permission[];

  @ManyToMany(() => Menus)
  @JoinTable({
    name: 'role_menus',
  })
  menus: Menus[];
}
