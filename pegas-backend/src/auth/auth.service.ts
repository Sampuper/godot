import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerFirstAdmin(dto: RegisterDto) {
    const usersCount = await this.prisma.user.count();
    if (usersCount > 0) {
      throw new BadRequestException('Register endpoint is allowed only for first admin');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const adminRole = await this.prisma.role.upsert({
      where: { code: 'ADMIN' },
      update: {},
      create: { code: 'ADMIN', name: 'Administrator' },
    });

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.buildTokenResponse(user.id, user.roles.map((item: { role: { code: string } }) => item.role.code));
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildTokenResponse(user.id, user.roles.map((item: { role: { code: string } }) => item.role.code));
  }

  private buildTokenResponse(userId: number, roles: string[]) {
    const payload = {
      sub: userId,
      roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
