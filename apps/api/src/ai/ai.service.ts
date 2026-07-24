import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSummary(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return '';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that summarizes notes and tasks concisely. Provide a 1-3 sentence summary capturing the key points.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new InternalServerErrorException('Failed to generate summary');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new InternalServerErrorException('Failed to generate embedding');
    }
  }

  async embedEntity(entityId: string, entityType: 'Note' | 'Task' | 'Resource', content: string) {
    try {
      const embedding = await this.generateEmbedding(content);
      if (embedding.length > 0) {
        const vectorString = `[${embedding.join(',')}]`;
        await this.prisma.$executeRawUnsafe(`
          UPDATE "${entityType}"
          SET embedding = $1::vector
          WHERE id = $2
        `, vectorString, entityId);
      }
    } catch (error) {
      console.error(`Error embedding ${entityType} ${entityId}:`, error);
    }
  }

  async semanticSearch(workspaceId: string, query: string, limit = 5) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const embedding = await this.generateEmbedding(query);
    if (!embedding.length) {
      return [];
    }

    // Convert the number array to a vector string for Postgres pgvector
    const vectorString = `[${embedding.join(',')}]`;

    try {
      // We search across Tasks, Notes, and Resources.
      // We will perform a UNION ALL query and sort by distance.
      // Note: prisma.$queryRaw is required for vector operations.
      
      const results = await this.prisma.$queryRawUnsafe(`
        WITH combined AS (
          SELECT id, title, description as content, 'TASK' as type, "createdAt", "updatedAt",
                 embedding <-> $1::vector as distance
          FROM "Task"
          WHERE "workspaceId" = $2 AND embedding IS NOT NULL

          UNION ALL

          SELECT id, title, content, 'NOTE' as type, "createdAt", "updatedAt",
                 embedding <-> $1::vector as distance
          FROM "Note"
          WHERE "workspaceId" = $2 AND embedding IS NOT NULL

          UNION ALL

          SELECT id, title, (metadata->>'description') as content, 'RESOURCE' as type, "createdAt", "updatedAt",
                 embedding <-> $1::vector as distance
          FROM "Resource"
          WHERE "workspaceId" = $2 AND embedding IS NOT NULL
        )
        SELECT id, title, content, type, distance, "createdAt", "updatedAt"
        FROM combined
        ORDER BY distance ASC
        LIMIT $3
      `, vectorString, workspaceId, limit);

      return results;
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new InternalServerErrorException('Failed to perform semantic search');
    }
  }
}
