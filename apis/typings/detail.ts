/**
 * FormDetailResponse
 */
export interface FormDetailResponse {
  status: string
  reform: string | null // 关联申请单
  operation_comment: string | null
  instance_code: string
  form_name: string
  form_instance_code: string
  form_instance: Array<FormConfigItem>
  operation_config: InstanceOperationConfig
}

export interface InstanceOperationConfig {
  agree: boolean
  post_add_sign: boolean
  pre_add_sign: boolean
  reject: boolean
  return_no_reapprove: boolean
  return_reapprove: boolean
  terminate: boolean
  transfer: boolean
}

export interface FormConfigItem {
  component_code: string
  component_name: string
  location: Location
  sequence: number
  values: Array<Record<string, unknown>>
}

export interface OperateHistoryResponse {
  instance_history: Array<OperateHistoryItem>
  total: number
}

export interface OperateHistoryItem {
  attachment: string[] | null
  comment: string | null
  has_snapshot: boolean
  node_name: string
  operate_time: string
  operate_type: string
  operate_user: string
  serial_number: number
  task_node_instance_id: string
}

export interface ReturnNodeResponse {
  returnable_nodes: Array<ReturnNodeItem>
}

export interface ReturnNodeItem {
  node_id: string
  node_name: string
  node_info: string
  approvers: string
}
