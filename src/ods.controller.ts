
import { Controller, Get, Header } from '@nestjs/common';
import generatorWorkPort from './libs/assistant.service';

@Controller('ods')
export class OdsController {

  @Get('work-report')
  @Header('Content-Type', 'text/markdown')
  async getDoc() {

    const docs = await generatorWorkPort();
    return docs;
  }
}