import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto/register.dto';


@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}


  async register(registerDto: RegisterDto) {

    const { name, email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });


    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }



  async login(email: string, password: string) {

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );


    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };


    return {
      access_token: this.jwtService.sign(payload),
       user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
    };
  }
}