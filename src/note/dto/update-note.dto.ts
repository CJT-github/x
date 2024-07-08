import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateNoteDto {
  @IsNumber({}, { message: 'id必须为数字' })
  @Type(() => Number)
  @IsNotEmpty({
    message: '笔记id不能为空',
  })
  id: number;

  @IsNotEmpty({
    message: '笔记名不能为空',
  })
  title: string;

  @IsNotEmpty({
    message: '笔记内容不能为空',
  })
  content: string;

  @IsNotEmpty({
    message: '分类不能为空',
  })
  category: string;

  @IsNotEmpty({
    message: '标签不能为空',
  })
  tabs: string;

  @IsNotEmpty({
    message: '摘要不能为空',
  })
  desc: string;

  headerImage: string;
  collect: string;
}
