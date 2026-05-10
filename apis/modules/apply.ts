import { http } from '../request'
import type { SubmittedListReqParams, SubmittedListResponse } from '../typings/apply'

/**
 * 分组列表
 * @param params
 * @returns
 */
export const submittedList = (params: SubmittedListReqParams) => {
  return http.post<SubmittedListResponse | string>('/api/v1/dl_approval/instance/submitted/list', { ...params })
}
