import { IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  attachment?: string;

}