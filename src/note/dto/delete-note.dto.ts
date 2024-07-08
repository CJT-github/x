import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteNoteDto {
  @IsNumber({}, { message: 'id必须为数字' })
  @Type(() => Number)
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: number;
}
