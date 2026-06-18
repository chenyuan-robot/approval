import type { FormConfigItem } from '@/apis/typings/detail'

export interface InstanceState {
  instance_id: string
  instance_type: string
  task_node_instance_id: string
  form_instance: Array<FormConfigItem>
  attachmentList: string[]
  secretAttachmentList: string[]
  commentAttachmentList: string[]
}
