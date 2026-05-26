export interface TreeWithFormReqParams {
  data?: Map<any, any>
}

export interface TreeWithFormResponse {
  documents: Array<DocumentItem>
}

export interface DocumentItem {
  id: Number,
  code: String,
  name: String,
  form_groups: Array<FormGroupItem>
}

export interface FormGroupItem {
  id: Number,
  code: String,
  name: String,
  form_list: Array<FormListItem>
}

export interface FormListItem {
  id: Number,
  code: String,
  name: String,
  icon: String,
  tenant: String,
  desc: String,
}