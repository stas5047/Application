import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz' })
  dateTime!: Date;

  @Column({ type: 'varchar' })
  location!: string;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({
    type: 'enum',
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
  })
  visibility!: EventVisibility;

  @ManyToOne(() => User, (user) => user.organizedEvents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  organizer!: User;

  @Column({ type: 'uuid' })
  organizerId!: string;

  @ManyToMany(() => User, (user) => user.participatedEvents)
  @JoinTable({
    name: 'event_participants',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants!: User[];

  @ManyToMany(() => Tag, (tag) => tag.events, { eager: false })
  @JoinTable({
    name: 'event_tags',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
