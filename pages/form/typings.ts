import type { FormConfigItem, WorkflowCfg } from '@/apis/typings/form'

export interface FormInfo {
  form_code: string
  form_group: string
  form_name: string
  form_instance: Array<FormConfigItem>
  workflow_cfg: WorkflowCfg
  form_instance_code?: string
  reform_id?: string
}

export interface FormItem {
  label: string
  sequence: number
  component_code: string
  values: Array<Record<string, unknown>>
}

export interface PageOptions {
  id?: string
  type?: FormActionType
  workflow_code?: string
  workflow_version?: string
}

export interface FormValue {
  name: string
  rules: Array<Record<string, string>>
  // [key: string]: string | number | boolean | Array<string> | Array<number> | Array<boolean>
}

export type FormActionType = 'create' | 'edit' | 'view' | 'resubmit' | 'invalid' | 'modify'
