import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { Roles } from './entities/roles.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { Menus } from './entities/menus.entity';
import { SaveMenuDto, UpdateMenuDto } from './dto/menus-user.dto';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Roles)
  private rolesRepository: Repository<Roles>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @InjectRepository(Menus)
  private menusRepository: Repository<Menus>;

  @Inject(RedisService)
  private redisService: RedisService;

  //获取验证码
  async captcha(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('用户邮箱不存在', HttpStatus.BAD_REQUEST);
    }

    const captcha = svgCaptcha.create({
      size: 4, // captcha length
      ignoreChars: '0o1i', // filter out some characters like 0, o, 1, i
      noise: 2, // number of noise lines
      color: false,
      width: 150,
      height: 32,
      fontSize: 28,
      background: '#9a9a9a',
    });

    await this.redisService.set(
      `captcha_${email}`,
      captcha.text.toLowerCase(),
      5 * 60,
    );
    return captcha.data;
  }

  //用户登录
  async login(loginUserDto: LoginUserDto) {
    const captcha = await this.redisService.get(
      `captcha_${loginUserDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (loginUserDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      rolesId: user.roles.map((item) => item.id)[0],
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  //退出登录
  async logout(token: string, refreshToken: string, userId?: string) {
    //存储过期黑名单
    await this.redisService.set(`token${userId}`, token, 30 * 60);
    await this.redisService.set(
      `refreshToken${userId}`,
      refreshToken,
      7 * 24 * 60 * 60,
    );
    return '退出成功';
  }

  //续签
  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      rolesId: user.roles.map((item) => item.id)[0],
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  //注册
  async register(user: CreateUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    if (user?.phoneNumber) {
      newUser.phoneNumber = user.phoneNumber;
    }
    if (user?.headPic) {
      newUser.headPic = user.headPic;
    }

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  //获取菜单列表
  async getMenus(role: number) {
    const roles = await this.rolesRepository.query(
      `SELECT * FROM menus WHERE id in (SELECT menusId as mId FROM role_menus rm WHERE rm.rolesId = ${role}) AND status = 1 ORDER BY level ASC,sort ASC`,
    );
    if (!roles) {
      throw new HttpException('角色菜单不存在', HttpStatus.BAD_REQUEST);
    }

    const data = roles.map((obj) => {
      const {
        id,
        name,
        path,
        routerPath,
        menuKey,
        icon,
        blank,
        closeMenu,
        pid,
        level,
        sort,
        description,
      } = obj;
      return {
        id,
        name,
        path,
        routerPath,
        menuKey,
        icon,
        blank,
        closeMenu,
        pid,
        level,
        sort,
        description,
      };
    });

    return data;
  }

  //获取菜单列表
  async getMenusList(
    role: number | string,
    level: number | string,
    pid: number | string,
    handle: string,
  ) {
    let _pid = pid;
    if (!role) {
      throw new HttpException('请携带角色参数', HttpStatus.BAD_REQUEST);
    }
    let search = '';
    if (level) {
      search = `AND level = ${level}`;
    }
    if (handle === 'next') {
      search = search + ` AND pid = ${pid}`;
    } else {
      const menus = await this.menusRepository.findOneBy({ id: Number(pid) });
      search = search + ` AND pid = ${menus.pid}`;
      _pid = menus.pid;
    }
    const roles = await this.rolesRepository.query(
      `SELECT * FROM menus WHERE id in (SELECT menusId as mId FROM role_menus rm WHERE rm.rolesId = ${role}) ${search} ORDER BY level ASC,sort ASC`,
    );
    if (!roles) {
      throw new HttpException('角色菜单不存在', HttpStatus.BAD_REQUEST);
    }

    const data = roles.map((obj) => {
      const {
        id,
        name,
        path,
        routerPath,
        menuKey,
        icon,
        blank,
        closeMenu,
        pid,
        level,
        status,
        sort,
        description,
      } = obj;
      return {
        id,
        name,
        path,
        routerPath,
        menuKey,
        blank,
        closeMenu,
        icon,
        status,
        pid,
        level,
        sort,
        description,
      };
    });

    return { data, pid: _pid };
  }

  //递归更改菜单
  async updateDeep(deepList: Array<any>) {
    deepList.forEach(async (item) => {
      item.status = false;
      await this.menusRepository.save(item);
      const innerList = await this.menusRepository.find({
        where: { pid: item.id },
      });
      if (innerList.length) {
        await this.updateDeep(innerList);
      }
    });
  }

  //更改菜单路由
  async updateMenu(menuData: UpdateMenuDto, username: string) {
    try {
      const menus = await this.menusRepository.findOneBy({ id: menuData.id });
      menus.name = menuData.name;
      menus.routerPath = menuData.routerPath;
      menus.menuKey = menuData.menuKey;
      menus.icon = menuData.icon;
      menus.sort = menuData.sort;
      menus.blank = Boolean(Number(menuData.blank));
      menus.closeMenu = Boolean(Number(menuData.closeMenu));
      menus.status = Boolean(Number(menuData.status));
      menus.description = menuData.description;
      menus.byUpdate = username;
      if (menuData.status == 0) {
        const deepList = await this.menusRepository.find({
          where: { pid: menus.id },
        });
        if (deepList.length) {
          await this.updateDeep(deepList);
        }
      }
      await this.menusRepository.save(menus);
      return 'success';
    } catch (error) {
      throw new HttpException('更新失败', HttpStatus.BAD_REQUEST);
    }
  }

  //新增菜单路由
  async saveMenu(menuData: SaveMenuDto, username: string) {
    const role = await this.rolesRepository.findOne({
      where: { id: 3 },
      relations: ['menus'],
    });
    const data = await this.menusRepository.findOneBy({
      menuKey: menuData.menuKey,
    });
    if (data) throw new HttpException('密钥已存在', HttpStatus.BAD_REQUEST);
    const menus = new Menus();
    menus.name = menuData.name;
    menus.routerPath = menuData.routerPath;
    menus.menuKey = menuData.menuKey;
    menus.icon = menuData.icon;
    menus.pid = menuData.pid;
    menus.level = menuData.level;
    menus.sort = menuData.sort;
    menus.blank = Boolean(Number(menuData.blank));
    menus.closeMenu = Boolean(Number(menuData.closeMenu));
    menus.status = Boolean(menuData.status);
    menus.description = menuData.description;
    menus.byAdd = username;
    try {
      await this.menusRepository.save(menus);
      role.menus = [...role.menus, menus];
      await this.rolesRepository.save(role);
      const { id } = await this.menusRepository.findOneBy({
        menuKey: menuData.menuKey,
      });
      if (menus.level == 1) {
        menus.path = String(id);
      } else {
        const { path } = await this.menusRepository.findOneBy({
          id: menus.pid,
        });
        menus.path = path + '/' + id;
      }
      await this.menusRepository.save(menus);
      return 'success';
    } catch (error) {
      throw new HttpException('添加失败', HttpStatus.BAD_REQUEST);
    }
  }

  //初始化数据
  async initData() {
    const user1 = new User();
    user1.username = 'kk';
    user1.password = md5('qj1998');
    user1.email = '2283830825@qq.com';
    user1.isAdmin = true;
    user1.phoneNumber = '13580364761';

    const role1 = new Roles();
    role1.name = '管理员';

    const role2 = new Roles();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    const menus1 = new Menus();
    menus1.name = '概览';
    menus1.path = '1';
    menus1.pid = 0;
    menus1.routerPath = '/statistics';
    menus1.icon = '&#xe68c;';
    menus1.level = 1;
    menus1.menuKey = 'statistics';
    menus1.byAdd = 'kk';

    const menus2 = new Menus();
    menus2.name = '设置';
    menus2.path = '1';
    menus2.pid = 0;
    menus2.routerPath = '/setting';
    menus2.icon = '&#xe844;';
    menus2.level = 1;
    menus2.menuKey = 'setting';
    menus2.byAdd = 'kk';

    const menus3 = new Menus();
    menus3.name = '菜单设置';
    menus3.path = '1/2';
    menus3.pid = 1;
    menus3.routerPath = '/menus';
    menus3.level = 2;
    menus3.menuKey = 'menus';
    menus3.byAdd = 'kk';

    user1.roles = [role1];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    role1.menus = [menus1, menus2, menus3];

    await this.menusRepository.save([menus1, menus2, menus3]);
    await this.permissionRepository.save([permission1, permission2]);
    await this.rolesRepository.save([role1, role2]);
    await this.userRepository.save([user1]);
  }
}
