import type { WorkflowCfg } from './common'

export interface SubmittedListReqParams {
  page_num: Number,
  page_size: Number
}

export interface SubmittedListResponse {
  submitted_instances: Array<SubmittedItem>
}

export interface SubmittedItem {
  form_id: string,
  form_name: string,
  application_time: string,
  applicant: string,
  instance_id: string,
  status: string,
  reason: string,
  operation_flags: OperationFlags,
  workflow_cfg: WorkflowCfg,
  form_instance_code: string,
  task_node_instance_id: string
}

export interface OperationFlags {
	can_invalid: Boolean,
	can_modify: Boolean
}
