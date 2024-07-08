import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Sse,
  Query,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Observable } from 'rxjs';
import { AuthToken } from 'src/auth-token.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('/api/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @SetMetadata('require-login', true)
  @Get('start-spider')
  async startSpider(@AuthToken() token: string, @Query('query') query: string) {
    const authToken = token.split(' ')[1];
    const { userId } = this.jwtService.verify(authToken);
    await this.jobService.startSpider(query, userId);
    return '爬虫完成';
  }

  @SetMetadata('require-login', true)
  @Get('spider-list')
  async spiderList() {
    return await this.jobService.spiderList();
  }

  @Sse('stream')
  stream() {
    return new Observable((observer) => {});
  }
}
