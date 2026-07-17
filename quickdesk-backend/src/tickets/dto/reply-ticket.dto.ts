import { IsNotEmpty, IsString } from "class-validator";

export class ReplyTicketDto {

  @IsString()
  @IsNotEmpty()
  finalReply: string;

}