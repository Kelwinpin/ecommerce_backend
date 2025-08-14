import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User } from '@prisma/client';
import { BaseRepository } from 'src/common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    protected model: any;
    
    constructor(protected readonly prisma: DatabaseService) {
        super(prisma);
        this.model = this.prisma.user;
    }
}