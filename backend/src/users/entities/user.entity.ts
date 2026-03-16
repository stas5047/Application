import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Event } from '../../events/entities/event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  @Exclude()
  email!: string;

  @Column({ type: 'varchar', unique: true })
  username!: string;

  @Column({ type: 'varchar' })
  @Exclude()
  passwordHash!: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refreshTokenHash!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents!: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  participatedEvents!: Event[];
}
