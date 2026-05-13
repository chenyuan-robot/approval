export interface LoginParams {
  password?: string
  phone?: string
  tenant?: string
  verify_code?: string
}

export interface VarifyCodeParams {
  phone: string
  valid_time: number
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface User {
  user_name: string
}
