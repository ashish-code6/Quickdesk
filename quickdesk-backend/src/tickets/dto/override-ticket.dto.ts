import { IsEnum, IsOptional } from 'class-validator';
import { TicketCategory, TicketPriority } from '@prisma/client';

export class OverrideTicketDto {
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
