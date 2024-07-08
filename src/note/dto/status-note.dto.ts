import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class StatusNoteDto {
  @IsNumber({}, { message: 'id必须为数字' })
  @Type(() => Number)
  @IsNotEmpty({
    message: '笔记id不能为空',
  })
  id: number;

  @IsNumber({}, { message: '状态必须为数字' })
  @Type(() => Number)
  @IsNotEmpty({
    message: '状态不能为空',
  })
  status: number;
}
