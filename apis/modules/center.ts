import { http } from '../request'
import type { ApprovedListReqParams, ApprovedListResponse, CCListReqParams, CCListResponse } from '../typings/center'

/**
 * 分组列表
 * @param params
 * @returns
 */
export const approvedList = (params : ApprovedListReqParams) => {
	return http.post<ApprovedListResponse | string>('/api/v1/dl_approval/instance/approved/list', { ...params })
}

export const ccList = (params : CCListReqParams) => {
	return http.post<CCListResponse | string>('/api/v1/dl_approval/instance/cc/list', { ...params })
}