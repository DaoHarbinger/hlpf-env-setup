import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || typeof value !== 'object') return value;
    const trimmed: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      trimmed[key] = typeof val === 'string' ? val.trim() : val;
    }
    return trimmed;
  }
}
