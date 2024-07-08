import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string;

  @IsNotEmpty({ message: '分类值不能为空' })
  value: string;

  @IsNotEmpty({ message: '分类类型不能为空' })
  type: number;
}
