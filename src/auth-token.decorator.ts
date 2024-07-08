import { ExecutionContext, createParamDecorator } from '@nestjs/common';

//自定义装饰器获取token
export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['authorization'];
  },
);
