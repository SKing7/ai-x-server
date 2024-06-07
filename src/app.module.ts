import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OdsController } from './ods/ods.controller';
import { AssistantService } from './ods/assistant.service';

@Module({
  imports: [],
  controllers: [AppController, OdsController],
  providers: [AppService, AssistantService],
})
export class AppModule { }
