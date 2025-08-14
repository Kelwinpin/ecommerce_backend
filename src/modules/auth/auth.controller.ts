import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { validateCPF } from 'src/common/utils/cpfAndCnpj';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        if (!validateCPF(dto.cpf)) {
            throw new BadRequestException('CPF inválido');
        }

        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}