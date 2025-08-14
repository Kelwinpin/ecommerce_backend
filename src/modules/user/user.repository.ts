import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User } from '@prisma/client';
import { BaseRepository } from 'src/common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(protected readonly prisma: DatabaseService) {
        super(prisma);
    }

    protected get model(): any {
        return this.prisma.user;
    }
}