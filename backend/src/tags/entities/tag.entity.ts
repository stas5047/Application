import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToMany(() => Event, (event) => event.tags)
  events!: Event[];
}
