import type { LoginResponse } from './../typings/login'
import { http } from '../request'
import { NEW_BASE_URL } from '@/constants/common'

export const feishuLogin = (params: Record<string, unknown>) =>
  http.post<LoginResponse>(`${NEW_BASE_URL}/api/v1/basis/login/feishu`, params)
