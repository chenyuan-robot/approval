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
