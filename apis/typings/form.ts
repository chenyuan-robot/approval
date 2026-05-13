/**
 * FormDetailResponse
 */
export interface FormDetailResponse {
  applicable_company: Array<string>
  applicable_department: Array<string>
  status: boolean
  owner: string
  name: string
  group: string
  workflow_cfg: WorkflowCfg
  form_config: Array<FormConfigItem>
}

export interface WorkflowCfg {
  workflow_code: string
  workflow_version: string
}

export interface FormConfigItem {
  component_code: string
  component_name: string
  location: Location
  sequence: number
  values: Array<Record<string, unknown>>
}

export interface Location {
  col: number
  row: number
}

export interface ConditionNodeValueListItem {
  code: string
  name: string
}
