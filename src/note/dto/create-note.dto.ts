import { IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({
    message: '笔记不能为空',
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
