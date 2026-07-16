import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private usersService: UsersService
    ){}

    // post method
    @Post()
     create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

}
