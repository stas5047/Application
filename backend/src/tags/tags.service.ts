import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    const normalized = names
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    if (normalized.length === 0) return [];

    const existing = await this.repo.find({
      where: { name: In(normalized) },
    });
    const existingNames = new Set(existing.map((t) => t.name));
    const missing = normalized.filter((n) => !existingNames.has(n));

    if (missing.length === 0) return existing;

    const created = await this.repo.save(
      missing.map((name) => this.repo.create({ name })),
    );
    return [...existing, ...created];
  }
}
