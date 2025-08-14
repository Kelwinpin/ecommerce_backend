import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { DomMetaKeywordModule } from './dom-meta-keyword/dom-meta-keyword.module';

@Module({
  imports: [DatabaseModule, UserModule, DomMetaKeywordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
