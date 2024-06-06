
import { Controller, Get, Header, Res } from '@nestjs/common';
import generatorWorkPort from './services/assistant.service';
import generatorWorkPortStream from './services/assistant_stream.service';

@Controller('ods')
export class OdsController {

  @Get('work-report')
  @Header('Content-Type', 'text/markdown')
  async getDoc() {

    const docs = await generatorWorkPort();
    return docs;
  }

  @Get('work-report-stream')
  @Header('Content-Type', 'text/markdown')
  @Header('Transfer-Encoding', 'chunked')
  async getDocStream(@Res() res) {

    const docs = await generatorWorkPortStream(res);
    return docs;
  }
}