import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseService } from 'src/database/database.service';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '180d' },
        }),
    ],
    providers: [AuthService, JwtStrategy, DatabaseService],
    controllers: [AuthController],
})
export class AuthModule { }