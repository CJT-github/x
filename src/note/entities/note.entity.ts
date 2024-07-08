import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Notes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '创建id',
  })
  pid: number;

  @Column({
    length: 100,
    comment: '菜单名称',
  })
  title: string;

  @Column({
    length: 100,
    comment: '菜单头像',
    nullable: true,
  })
  notePic: string;

  @Column({
    type: 'longtext',
    comment: '内容',
  })
  content: string;

  @Column({
    comment: '浏览量',
    default: 0,
  })
  viewPage: number;

  @Column({
    comment: '点赞量',
    default: 0,
  })
  likePage: number;

  @Column({
    comment: '收藏量',
    default: 0,
  })
  collectPage: number;

  @Column({
    comment: '状态',
    default: true,
  })
  status: boolean;

  @Column({
    comment: '分类',
  })
  category: string;

  @Column({
    comment: '标签',
  })
  tabs: string;

  @Column({
    comment: '封面',
    nullable: true,
  })
  headerImage: string;

  @Column({
    comment: '专栏',
    nullable: true,
  })
  collect: string;

  @Column({
    comment: '摘要',
  })
  desc: string;

  @Column({
    length: 100,
    comment: '添加人',
    nullable: true,
  })
  byAdd: string;

  @Column({
    comment: '创建日期',
  })
  @CreateDateColumn()
  createTime: Date;
}
