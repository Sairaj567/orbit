import { BadRequestException } from '@nestjs/common';
import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import type { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: unknown) {
      const e = error as { errors?: unknown };
      throw new BadRequestException({
        message: 'Validation failed',
        errors: e.errors,
      });
    }
  }
}
