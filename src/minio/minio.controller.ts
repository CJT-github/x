import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Minio from 'minio';
import * as path from 'path';
import { storage } from 'src/utils/file-storage';

@Controller('/api/minio')
export class MinioController {
  @Inject('MINIO_CLIENT')
  private minioClient: Minio.Client;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Get('presignedUrl')
  async presignedPutObject(@Query('name') name: string) {
    const url = await this.minioClient.presignedPutObject(
      this.configService.get('minio_bucket_name'),
      name,
      3600,
    );
    let urlLocation =
      this.configService.get('minio_end_point') +
      ':' +
      this.configService.get('minio_port') +
      '/' +
      this.configService.get('minio_bucket_name') +
      '/';
    return { url, urlLocation };
  }

  @Get('uploadFile')
  async uploadFile(@Query('name') name: string) {
    try {
      await this.minioClient.fPutObject(
        this.configService.get('minio_bucket_name'),
        'hello.json',
        './package.json',
      );
    } catch (error) {
      throw new HttpException('上传失败', HttpStatus.BAD_REQUEST);
    }
  }

  // @Post('uploadFile')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     dest: 'uploads',
  //     storage: storage,
  //     limits: {
  //       fileSize: 1024 * 1024 * 3, //3M
  //     },
  //     fileFilter(req, file, callback) {
  //       const extname = path.extname(file.originalname);
  //       if (['.png', '.jpg', '.gif'].includes(extname)) {
  //         callback(null, true);
  //       } else {
  //         callback(new BadRequestException('只能上传png、jpg、gif'), false);
  //       }
  //     },
  //   }),
  // )
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log('file', file);
  //   return file.path;
  // }
}
