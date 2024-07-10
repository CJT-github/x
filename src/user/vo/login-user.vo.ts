interface UserInfo {
  id: number;

  username: string;

  email: string;

  headPic: string;

  phoneNumber: string;

  isFrozen: boolean;

  isAdmin: boolean;

  createTime: number;

  rolesId: number;

  permissions: string[];
}
export class LoginUserVo {
  userInfo: UserInfo;

  accessToken: string;

  refreshToken: string;
}
