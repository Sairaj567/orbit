import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryInput, UpdateCategoryInput, envelope } from '@orbit/shared';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, input: CreateCategoryInput) {
    const category = await this.prisma.category.create({
      data: {
        name: input.name,
        color: input.color,
        workspaceId,
      },
    });
    return envelope(category);
  }

  async findAll(workspaceId: string) {
    const categories = await this.prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
    return envelope(categories);
  }

  async update(workspaceId: string, categoryId: string, input: UpdateCategoryInput) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, workspaceId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updated = await this.prisma.category.update({
      where: { id: categoryId },
      data: input,
    });
    return envelope(updated);
  }

  async remove(workspaceId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, workspaceId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({
      where: { id: categoryId },
    });
    return envelope({ success: true });
  }
}
