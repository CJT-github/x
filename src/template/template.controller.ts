import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('/api/template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  //创建简历模版
  // @Get()
  // async generatePdf(): Promise<any> {
  //   const pdfBuffer = await this.templateService.generatePdf('');
  //   return pdfBuffer;
  // }

  //生成pdf
  @Post()
  async generatePdf(@Body() source: CreateTemplateDto): Promise<any> {
    const pdfBuffer = await this.templateService.generatePdf(source.html);
    return pdfBuffer;
  }
}
