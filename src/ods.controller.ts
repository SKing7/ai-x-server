
import { Controller, Get, Header, Res, Sse, StreamableFile } from '@nestjs/common';
import generatorWorkPort from './libs/assistant.service';
import { createReadStream } from 'fs';

@Controller('ods')
export class OdsController {

  @Get('work-report')
  @Sse()
  async getDoc() {
    const docs = await generatorWorkPort();
  }
}