import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Users } from '@prisma/client';
import { BaseRepository } from 'src/common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<Users> {
    protected model: any;

    constructor(protected readonly prisma: DatabaseService) {
        super(prisma);
        this.model = this.prisma.users;
    }
}