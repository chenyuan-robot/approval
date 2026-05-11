import { http } from '../request'
import type { FormDetailResponse, OperateHistoryResponse } from '../typings/detail'

/**
 * 获取表单详情
 * @param params
 * @returns
 */
export const queryInstanceDetail = (id: string) => {
  return http.get<FormDetailResponse>(`/api/v1/dl_approval/instance/${id}`)
}

/**
 * 获取表单操作历史
 * @param params
 * @returns
 */
export const queryInstanceHistory = (id: string) => {
  return http.get<OperateHistoryResponse | string>(`/api/v1/dl_approval/instance/history/${id}`)
}
