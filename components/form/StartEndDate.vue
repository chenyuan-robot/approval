<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>

    <view class="component-value">
      <view v-if="props.renderOnly" class="detail-container">
        <text class="render-text">{{ config.value?.[0] ?? '-' }}</text>
        <text class="render-splite">至</text>
        <text class="render-text">{{ config.value?.[1] ?? '-' }}</text>
      </view>
      <view v-else class="form-container">
        <view class="start-date">
          <picker
            class="component-style"
            style="height: 80rpx"
            :name="`COMP_START_END_DATE___${props.formItem.sequence}_start`"
            mode="date"
            :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
            :value="startDate"
            :start="getDate('start')"
            :end="getDate('end')"
            @change="bindDateChange($event, 'start')"
          >
            <view :class="['action-result', startDate === '0' ? 'empty' : 'fill']">
              {{ startDate === '0' ? '请选择开始时间' : startDate }}
            </view>
          </picker>
          <image
            class="suffix-icon"
            :src="`${startDate !== '0' ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
            mode="aspectFit"
            @click.stop="handleClearStartDate"
          />
        </view>
        <view class="end-date">
          <picker
            class="component-style"
            style="height: 80rpx"
            :name="`COMP_START_END_DATE___${props.formItem.sequence}_end`"
            mode="date"
            :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
            :value="endDate"
            :start="getDate('start')"
            :end="getDate('end')"
            @change="bindDateChange($event, 'end')"
          >
            <view :class="['action-result', endDate === '0' ? 'empty' : 'fill']">
              {{ endDate === '0' ? '请选择结束时间' : endDate }}
            </view>
          </picker>
          <image
            class="suffix-icon"
            :src="`${endDate !== '0' ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
            mode="aspectFit"
            @click.stop="handleClearEndDate"
          />
        </view>
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import dayjs from 'dayjs'
import { makeToast } from '@/utils/toast'

interface FormConfig {
  placeholder: string
  dateType: string
  showTitle: boolean
  disabled: boolean
  showFieldDesc: boolean
  desc: string
  required: boolean
  value: string[]
}

defineOptions({
  name: 'StartEndDate',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = ref<FormConfig>({
  placeholder: '',
  dateType: '年',
  showTitle: false,
  showFieldDesc: false,
  disabled: false,
  desc: '',
  required: false,
  value: ['', '']
})
const toast = makeToast()
const startDate = ref<string>('0')
const endDate = ref<string>('0')

const getConfig = (): FormConfig => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.placeholder as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_START_END_DATE___${props.formItem.sequence}_start`,
    rules: [
      {
        ruleType: required ? '^(?!0$).*$' : '.*',
        errorMessage: `请选择开始时间`
      }
    ]
  })
  formRulesUtil.depRules({
    name: `COMP_START_END_DATE___${props.formItem.sequence}_end`,
    rules: [
      {
        ruleType: required ? '^(?!0$).*$' : '.*',
        errorMessage: `请选择结束时间`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择日期范围',
    dateType: dateType as string,
    disabled: !((defaultItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: (titleItem?.form_values as string[]) ?? ['', '']
  }
}

watch(
  () => startDate.value,
  () => {
    if (startDate.value !== '0' && endDate.value !== '0') {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        endDate.value = '0'
        toast.error('开始时间不能大于结束时间', 2000)
      }
    }
  }
)

watch(
  () => endDate.value,
  () => {
    if (startDate.value !== '0' && endDate.value !== '0') {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        startDate.value = '0'
        toast.error('结束时间不能小于开始时间', 2000)
      }
    }
  }
)

const getDate = (type: 'start' | 'end'): string => {
  const date = new Date()
  let year = date.getFullYear()
  let month: string | number = date.getMonth() + 1
  let day: string | number = date.getDate()
  if (type === 'start') {
    year = year - 10
  } else if (type === 'end') {
    year = year + 10
  }
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  return `${year}-${month}-${day}`
}

const bindDateChange = (event: Event, type: 'start' | 'end') => {
  const e = event as unknown as {
    detail: {
      value: string
    }
  }
  if (type === 'start') {
    startDate.value = e.detail.value
  } else {
    endDate.value = e.detail.value
  }
}

const handleClearStartDate = () => {
  if (startDate.value !== '0') {
    startDate.value = '0'
  }
}

const handleClearEndDate = () => {
  if (endDate.value !== '0') {
    endDate.value = '0'
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'modify' || type?.value === 'invalid') {
    if (config.value.value?.[0]) {
      startDate.value = config.value.value[0]
      endDate.value = config.value.value[1]
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_range.scss';
</style>
