import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { DatabaseService } from '../../database/database.service';
import { getCEPInfo } from 'src/common/utils/getCEPInfo';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: DatabaseService) { }

  create(createAddressDto: CreateAddressDto) {
    return 'This action adds a new address';
  }

  findAll() {
    return `This action returns all address`;
  }

  findOne(id: number) {
    return `This action returns a #${id} address`;
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
