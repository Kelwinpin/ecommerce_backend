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
import { randomUUID } from 'crypto';

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

        if (await this.prisma.users.findUnique({ where: { cpf: dto.cpf } })) {
            throw new ConflictException('CPF já cadastrado');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.users.create({
            data: { email: dto.email, password: hashedPassword, username: dto.username as string, cpf: dto.cpf as string },
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

    async forgotPassword(dto: Omit<LoginDto, 'password'>) {
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (!user) throw new UnauthorizedException('Email inválido');

        const hasCodeSended = await this.prisma.emailValidation.findFirst({
            where: { email: user.email },
        });

        if (hasCodeSended) {
            await this.prisma.emailValidation.delete({
                where: { email: user.email, code: hasCodeSended.code, userId: user.id },
            });
        }

        await this.prisma.emailValidation.create({
            data: {
                email: user.email,
                code: Math.floor(Math.random() * 10000),
                userId: user.id,
            },
        });

        return { message: 'Email enviado com sucesso' };
    }

    async validateEmail(code: number, email: string) {
        const emailValidation = await this.prisma.emailValidation.findFirst({
            where: { code, email },
        });

        console.log(emailValidation);
    }

    async signToken(user: Users) {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            cpf: user.cpf,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
        };

        return {
            access_token: await this.jwt.signAsync(payload),
        };
    }
}