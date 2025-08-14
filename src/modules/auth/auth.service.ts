import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { Users } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: DatabaseService,
        private jwt: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        if (
            dto.username === undefined ||
            dto.email === undefined ||
            dto.password === undefined
        ) {
            throw new BadRequestException('Campos obrigatórios não informados');
        }

        if (await this.prisma.users.findUnique({ where: { email: dto.email } })) {
            throw new ConflictException('Email já cadastrado');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.users.create({
            data: { email: dto.email, password: hashedPassword, username: dto.username as string },
        });

        return this.signToken(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (!user) throw new UnauthorizedException('Email ou senha inválidos');

        const passwordMatch = await bcrypt.compare(dto.password, user.password as string);
        if (!passwordMatch)
            throw new UnauthorizedException('Email ou senha inválidos');

        return this.signToken(user);
    }

    async signToken(user: Users) {
        const payload = { ...user };
        return {
            access_token: await this.jwt.signAsync(payload),
        };
    }
}