import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { DatabaseService } from '../../database/database.service';
import { getCEPInfo } from 'src/common/utils/getCEPInfo';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: DatabaseService) { }

  async create(createAddressDto: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data: createAddressDto,
    });

    return address;
  }

  findAll(userId: number) {
    return this.prisma.address.findMany({
      where: {
        userId, AND: [
          { deletedAt: null },
        ]
      },
    });
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }

  async findByCEP(cep: string) {
    const address = await getCEPInfo(cep);

    if (address.cep === undefined) {
      throw new BadRequestException('CEP não encontrado');
    }

    return address;
  }
}
