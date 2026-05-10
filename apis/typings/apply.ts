import type { WorkflowCfg } from './common'

export interface SubmittedListReqParams {
  page_num: Number,
  page_size: Number
}

export interface SubmittedListResponse {
  submitted_instances: Array<SubmittedItem>
}

export interface SubmittedItem {
  form_id: String,
  form_name: String,
  application_time: String,
  applicant: String,
  instance_id: String,
  status: String,
  reason: String,
  operation_flags: OperationFlags,
  workflow_cfg: WorkflowCfg
}

export interface OperationFlags {
	can_invalid: Boolean,
	can_modify: Boolean
}
