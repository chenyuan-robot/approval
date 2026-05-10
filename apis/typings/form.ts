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
  form_config: Array<FormConfigItem>
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
