import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OdsController } from './ods.controller';

@Module({
  imports: [],
  controllers: [AppController, OdsController],
  providers: [AppService],
})
export class AppModule { }
