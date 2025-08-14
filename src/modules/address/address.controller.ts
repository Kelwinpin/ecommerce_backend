import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import getDecodedToken from 'src/common/utils/getDecodedToke';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    const decoded = getDecodedToken(req.headers.authorization.split(' ')[1]);

    const body = { ...createAddressDto, userId: decoded.id };

    return this.addressService.create(body);
  }

  @Get()
  findAll(@Request() req) {
    const decoded = getDecodedToken(req.headers.authorization.split(' ')[1]);

    return this.addressService.findAll(decoded.id);
  }

  @Get('cep/:cep')
  findByCEP(@Param('cep') cep: string) {
    return this.addressService.findByCEP(cep);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(+id);
  }
}
