import {
  Body,
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Post,
  Query,
  Headers,
  SetMetadata,
  UnauthorizedException,
  ValidationPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserPipe } from './user.pipe';
import { AuthToken } from 'src/auth-token.decorator';
import { RedisService } from 'src/redis/redis.service';
import { SaveMenuDto, UpdateMenuDto } from './dto/menus-user.dto';

@Controller('api/user')
export class UserController {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  constructor(private readonly userService: UserService) {}

  //获取验证码
  @Get('register-captcha')
  async captcha(@Query('email', UserPipe) email: string) {
    const data = await this.userService.captcha(email);
    return { captcha: data };
  }

  //初始化数据
  @Get('init-data')
  async init() {
    await this.userService.initData();
    return '初始化成功';
  }

  //用户登录
  @Post('login')
  async userLogin(@Body(new ValidationPipe()) loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser);

    //设置token
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        rolesId: vo.userInfo.rolesId,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return vo;
  }

  //用户退出登录
  @SetMetadata('require-login', true)
  @Get('logout')
  async userLogout(
    @AuthToken() token: string,
    @Query('refresh_token') refreshToken: string,
  ) {
    let authStr = token.split(' ')[1];
    const data = this.jwtService.verify(authStr);
    return await this.userService.logout(token, refreshToken, data.userId);
  }

  //续签
  // @SetMetadata('require-login', true)
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const token = await this.redisService.get(`refreshToken${data.userId}`);
      if (token && token === refreshToken) {
        throw new UnauthorizedException('token已失效，请重新登录');
      }

      const user = await this.userService.findUserById(data.userId);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          rolesId: user.rolesId,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      return {
        access_token,
      };
    } catch (e) {
      throw new UnauthorizedException('token已失效，请重新登录');
    }
  }

  //获取菜单
  @SetMetadata('require-login', true)
  @Get('menus')
  async menus(@AuthToken() token: string) {
    const data = this.jwtService.verify(token.split(' ')[1]);
    return await this.userService.getMenus(data.rolesId);
  }

  //获取菜单
  @SetMetadata('require-login', true)
  @Get('menus-list')
  async menusList(
    @AuthToken() token: string,
    @Query('level') level: number | string,
    @Query('pid', new DefaultValuePipe(0)) pid: number | string,
    @Query('handle', new DefaultValuePipe('next')) handle: string,
  ) {
    const data = this.jwtService.verify(token.split(' ')[1]);
    return await this.userService.getMenusList(
      data.rolesId,
      level,
      pid,
      handle,
    );
  }

  //更新菜单
  @SetMetadata('require-login', true)
  @Post('update-menus')
  async updateMenu(
    @Headers('authorization') authorization: string,
    @Body(new ValidationPipe()) menuData: UpdateMenuDto,
  ) {
    let authStr = authorization.split(' ')[1];
    const data = this.jwtService.verify(authStr);
    return await this.userService.updateMenu(menuData, data.username);
  }

  //新增菜单
  // @SetMetadata('require-login', true)
  @Post('save-menus')
  async saveMenu(
    @Headers('authorization') authorization: string,
    @Body(new ValidationPipe()) menuData: SaveMenuDto,
  ) {
    let authStr = authorization.split(' ')[1];
    const data = this.jwtService.verify(authStr);
    return await this.userService.saveMenu(menuData, data.username);
  }

  //删除菜单
  @SetMetadata('require-login', true)
  @Get('delete-menus')
  async deleteMenu(@Query('id') id: number | string) {
    return 'success';
  }

  //注册用户
  @Post('register')
  async register(@Body() register: CreateUserDto) {
    return await this.userService.register(register);
  }
}
