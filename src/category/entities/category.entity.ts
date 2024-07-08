import { Notes } from 'src/note/entities/note.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '分类类型(1、笔记；2、模版)' })
  type: number;

  @Column({ comment: '分类名称' })
  name: string;

  @Column({ comment: '分类值' })
  value: string;
}
