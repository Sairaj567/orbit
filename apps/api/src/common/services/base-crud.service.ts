import { Injectable, NotFoundException } from '@nestjs/common';
import { envelope } from '@orbit/shared';
import type { PaginationDto } from '../dto';

export interface CrudDelegate<
  Entity,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  FindManyArgs extends Record<string, unknown> = Record<string, unknown>,
> {
  create(args: { data: CreateInput }): Promise<Entity>;
  findMany(args?: FindManyArgs): Promise<Entity[]>;
  findUnique(args: { where: WhereUniqueInput }): Promise<Entity | null>;
  update(args: { where: WhereUniqueInput; data: UpdateInput }): Promise<Entity>;
  delete(args: { where: WhereUniqueInput }): Promise<Entity>;
  count?(args?: Pick<FindManyArgs, 'where'>): Promise<number>;
}

export interface PaginatedResult<Entity> {
  data: Entity[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

@Injectable()
export abstract class BaseCrudService<
  Entity,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  FindManyArgs extends Record<string, unknown> = Record<string, unknown>,
> {
  protected constructor(
    private readonly delegate: CrudDelegate<
      Entity,
      CreateInput,
      UpdateInput,
      WhereUniqueInput,
      FindManyArgs
    >,
    private readonly entityName: string,
  ) {}

  create(data: CreateInput): Promise<Entity> {
    return this.delegate.create({ data });
  }

  findMany(args?: FindManyArgs): Promise<Entity[]> {
    return this.delegate.findMany(args);
  }

  async findPaginated(
    pagination: PaginationDto,
    args?: Omit<FindManyArgs, 'skip' | 'take'>,
  ): Promise<PaginatedResult<Entity>> {
    const page = pagination.page;
    const perPage = pagination.perPage;
    const skip = (page - 1) * perPage;
    const findManyArgs = {
      ...(args ?? {}),
      skip,
      take: perPage,
    } as unknown as FindManyArgs;

    const [data, total] = await Promise.all([
      this.delegate.findMany(findManyArgs),
      this.delegate.count?.({ where: (args as Record<string, unknown>)?.where } as Pick<
        FindManyArgs,
        'where'
      >) ?? Promise.resolve(0),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return envelope(data, {
      page,
      perPage,
      total,
      totalPages,
      hasMore: page < totalPages,
    }) as unknown as PaginatedResult<Entity>;
  }

  async findUniqueOrThrow(where: WhereUniqueInput): Promise<Entity> {
    const entity = await this.delegate.findUnique({ where });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return entity;
  }

  async update(where: WhereUniqueInput, data: UpdateInput): Promise<Entity> {
    await this.findUniqueOrThrow(where);
    return this.delegate.update({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<Entity> {
    await this.findUniqueOrThrow(where);
    return this.delegate.delete({ where });
  }
}
