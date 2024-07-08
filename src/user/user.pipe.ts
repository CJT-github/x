import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class UserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      throw new BadRequestException('用户邮箱必须是个有效邮箱');
    }

    if (!isEmail(value)) {
      throw new BadRequestException('用户邮箱格式错误');
    }
    return value;
  }
}
