import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateMenuDto {
  @IsNotEmpty({
    message: '菜单id不能为空',
  })
  id: number;

  @IsNotEmpty({
    message: '菜单名称不能为空',
  })
  name: string;

  @IsNotEmpty({
    message: '菜单路径不能为空',
  })
  routerPath: string;

  @IsNotEmpty({
    message: '密钥不能为空',
  })
  menuKey: string;

  icon: string;

  @IsNotEmpty({
    message: '排序不能为空',
  })
  sort: number;

  @IsNotEmpty({
    message: '是否展示不能为空',
  })
  blank: number;

  @IsNotEmpty({
    message: '状态不能为空',
  })
  status: number;

  description: string;
}

export class SaveMenuDto {
  @IsNotEmpty({
    message: '菜单名称不能为空',
  })
  name: string;

  @IsNotEmpty({
    message: '菜单路径不能为空',
  })
  routerPath: string;

  @IsNotEmpty({
    message: '密钥不能为空',
  })
  menuKey: string;

  icon: string;

  @IsNotEmpty({
    message: 'pid不能为空',
  })
  pid: number;

  @IsNotEmpty({
    message: '等级不能为空',
  })
  level: number;

  @IsNotEmpty({
    message: '排序不能为空',
  })
  sort: number;

  @IsNotEmpty({
    message: '是否展示不能为空',
  })
  blank: number;

  @IsNotEmpty({
    message: '状态不能为空',
  })
  status: number;

  description: string;
}
