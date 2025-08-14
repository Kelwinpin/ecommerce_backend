import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { DomMetaKeywordModule } from './modules/dom-meta-keyword/dom-meta-keyword.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressModule } from './modules/address/address.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, DomMetaKeywordModule, AddressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
