import type { FormConfigItem, WorkflowCfg } from '@/apis/typings/form'

export interface FormInfo {
  form_code: string
  form_group: string
  form_name: string
  form_instance: Array<FormConfigItem>
  workflow_cfg: WorkflowCfg
}

export interface FormItem {
  label: string
  sequence: number
  component_code: string
  values: Array<Record<string, unknown>>
}

export interface PageOptions {
  id?: string
}
