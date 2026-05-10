import { http } from '../request'
import type { UserListResponse } from '../typings/global'

/**
 * 获取用户列表
 * @param params
 * @returns
 */
export const queryUserList = () => {
  return http.post<UserListResponse>('https://digital.softtest.cowarobot.com/api/v1/appmsg/user/query_all_person', {
    tenant: 'cowarobot'
  })
}
