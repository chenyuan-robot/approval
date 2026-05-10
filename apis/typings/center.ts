import type { WorkflowCfg } from './common'

export interface ApprovedListReqParams {
  page_num: Number,
  page_size: Number,
  approved: Boolean
}

export interface ApprovedListResponse {
  approval_instances: Array<ApprovedItem>
}

export interface ApprovedItem {
  instance_id: String,
  form_id: String,
  form_name: String,
  application_time: String,
  applicant: String,
  application_company: String,
  application_department: String,
  status: String,
  reason: String,
  workflow_cfg: WorkflowCfg,
  can_view_detail: Boolean,
  is_reviewer: Boolean,
  
  //本地自定义属性
  checked: Boolean,    
}

export interface CCListReqParams {
  page_num: Number,
  page_size: Number,
  read: Boolean
}

export interface CCListResponse {
  cc_instances: Array<ApprovedItem>
}