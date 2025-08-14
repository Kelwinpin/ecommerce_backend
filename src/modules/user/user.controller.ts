import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { Users } from '@prisma/client';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController extends BaseController<Users> {
    protected resourceName = 'User';

    constructor(protected readonly service: UserService) {
        super(service);
    }
}