
import { Controller, Get, Header, Res } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('ods')
export class OdsController {
  constructor(private readonly assistantService: AssistantService) { }

  @Get('work-report')
  @Header('Content-Type', 'text/markdown')
  async getDoc() {

    const docs = await this.assistantService.run();
    return docs;
  }

  @Get('work-report-stream')
  @Header('Content-Type', 'text/markdown')
  @Header('Transfer-Encoding', 'chunked')
  async getDocStream(@Res() res) {

    const docs = await this.assistantService.runStream(res);
    return docs;
  }
}