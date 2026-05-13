import type { LoginResponse } from './../typings/login'
import { http } from '../request'
import { BASE_LOGIN_URL } from '@/constants/common'

export const feishuLogin = (params: Record<string, unknown>) =>
  http.post<LoginResponse>(`${BASE_LOGIN_URL}/api/v1/basis/login/feishu`, params)
