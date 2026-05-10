import { http } from '../request'
import type { TreeWithFormReqParams, TreeWithFormResponse } from '../typings/home'

/**
 * 分组列表
 * @param params
 * @returns
 */
export const treeWithForm = (params: TreeWithFormReqParams) => {
  return http.get<TreeWithFormResponse | string>('/api/v1/dl_approval/form/document/tree_with_form', { ...params })
}
