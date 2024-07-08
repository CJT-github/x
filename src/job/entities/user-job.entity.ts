import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity()
export class JobUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '用户Id',
  })
  userId: number;

  @CreateDateColumn()
  createTime: Date;

  @OneToMany(() => Job, (job) => job.jobUser, {
    cascade: true,
  })
  job: Job[];
}
