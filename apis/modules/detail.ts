import { http } from '../request'
import type { FormDetailResponse, OperateHistoryResponse, ReturnNodeResponse } from '../typings/detail'

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

/**
 * 删除单据
 * @param params
 * @returns
 */
export const deleteApproval = (id: string) => {
  return http.delete<boolean | string>(`/api/v1/dl_approval/instance/${id}`)
}

/**
 * 撤回单据
 * @param params
 * @returns
 */
export const withdrawApproval = (params: Record<string, unknown>) => {
  return http.put<boolean | string>('/api/v1/dl_approval/instance/operation', params)
}

/**
 * 查询节点列表
 * @param params
 * @returns
 */
export const queryReturnNodes = (id: string) => {
  return http.get<ReturnNodeResponse | string>(`/api/v1/dl_approval/instance/return/nodes/${id}`)
}
