/**
 * interface IUser
 * 用户登录信息接口
 */
export interface UserState {
  access_token: string
  refresh_token: string
  account: string
  user_name: string
  job_title: string
  gender: number
}
