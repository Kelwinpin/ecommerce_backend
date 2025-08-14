import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { UserRepository } from './user.repository';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class UserService extends BaseService<Users> {
    protected entityName = 'user';
    constructor(protected readonly repository: UserRepository) {
        super(repository);
    }
}