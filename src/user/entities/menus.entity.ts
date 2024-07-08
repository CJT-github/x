import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'menus',
})
export class Menus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    comment: '菜单名称',
  })
  name: string;

  @Column({
    length: 100,
    comment: '链路PATH',
    nullable: true,
  })
  path: string;

  @Column({
    length: 100,
    comment: '菜单路径',
  })
  routerPath: string;

  @Column({
    length: 100,
    comment: '菜单Key',
  })
  menuKey: string;

  @Column({
    length: 100,
    comment: '菜单图标',
    nullable: true,
  })
  icon: string;

  @Column({
    comment: '是否展示',
    default: true,
  })
  blank: boolean;

  @Column({
    comment: '父级id',
    nullable: true,
  })
  pid: number;

  @Column({
    default: 0,
    comment: '等级（1.第一级别；2.第二级别；3.第三级别）',
  })
  level: number;

  @Column({
    default: 0,
    comment: '排序',
  })
  sort: number;

  @Column({
    default: true,
    comment: '状态',
  })
  status: boolean;

  @Column({
    length: 255,
    comment: '描述',
    nullable: true,
  })
  description: string;

  @Column({
    length: 100,
    comment: '添加人',
    nullable: true,
  })
  byAdd: string;

  @CreateDateColumn()
  createTime: Date;

  @Column({
    length: 100,
    comment: '修改人',
    nullable: true,
  })
  byUpdate: string;

  @UpdateDateColumn()
  updateTime: Date;
}
