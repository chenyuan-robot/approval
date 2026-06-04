import type { LoginResponse } from './../typings/login'
import { http } from '../request'

export const feishuLogin = (params: Record<string, unknown>) =>
  http.post<LoginResponse>(`${process.env.NEW_BASE_URL}/api/v1/basis/login/feishu`, params)
