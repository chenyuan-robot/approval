import type { FormDetailResponse, OperateHistoryItem } from '@/apis/typings/detail'

export interface PageOptions {
  data?: string
}

export interface InstanceDetail extends FormDetailResponse {
  applicant: string
  application_time: string
  department: string
  back_ground: string
}

export interface InstanceHistoryItem extends OperateHistoryItem {
  job_title: string
  back_ground: string
  is_read: boolean
  time_ago: string // 时间跨度
}
