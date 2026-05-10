export interface FormItem {
  label: string
  sequence: number
  component_code: string
  values: Array<Record<string, unknown>>
}
