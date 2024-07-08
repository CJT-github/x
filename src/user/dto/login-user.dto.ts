import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({
    message: '用户邮箱不能为空',
  })
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: '用户密码密码不能为空',
  })
  password: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
