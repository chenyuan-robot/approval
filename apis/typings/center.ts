import type { WorkflowCfg } from './common'

export interface ApprovedListReqParams {
  page_num: number,
  page_size: number,
  approved: boolean
}

export interface ApprovedListResponse {
  approval_instances: Array<ApprovedItem>
}

export interface ApprovedItem {
  task_node_instance_id: string,
  instance_id: string,
  form_id: string,
  form_name: string,
  application_time: string,
  applicant: string,
  application_company: string,
  application_department: string,
  status: string,
  reason: string,
  workflow_cfg: WorkflowCfg,
  can_view_detail: boolean,
  is_reviewer: boolean,
  applicant_person_key: string,
  form_instance_code: string,
  delivery_time: string,
  
  //本地自定义属性
  checked?: boolean,
  back_ground?: string
}

export interface CCListReqParams {
  page_num: number,
  page_size: number,
  read: boolean
}

export interface CCListResponse {
  cc_instances: Array<ApprovedItem>
}