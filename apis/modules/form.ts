import { http } from '../request'
import type { FormDetailResponse } from '../typings/form'

/**
 * 获取表单详情
 * @param params
 * @returns
 */
export const queryFormDetail = (id: string) => {
  return http.get<FormDetailResponse>(`/api/v1/dl_approval/form/detail/${id}`)
}

/**
 * 创建表单
 * @param data
 * @returns
 */
export const createForm = (data: Record<string, unknown>) => {
  return http.post<string>(`/api/v1/dl_approval/instance/create`, data)
}

/**
 * 提交申请单实例
 * @param data
 * @returns
 */
export const submitApplicationInstance = (data: Record<string, unknown>, id: string) => {
  return http.put<string>(`/api/v1/dl_approval/instance/submission/${id}`, data)
}
