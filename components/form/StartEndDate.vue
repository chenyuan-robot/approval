<template>
  <!-- ["年", "年-月", "年-月-日"] -->
  <view class="uni-form-component">
    <view v-if="props.renderOnly" class="readable">
      <view class="component-label">
        <view class="field-desc">
          <text class="field-label">{{ props.formItem.label }}</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <view class="component-value">
        <text class="render-text">{{ config.value?.[0] ?? '' }}</text>
        <text class="render-splite">至</text>
        <text class="render-text">{{ config.value?.[1] ?? '' }}</text>
      </view>
    </view>
    <view v-else>
      <view class="form-row editable">
        <view class="component-label">
          <view class="field-desc">
            <text>{{ props.formItem.label }}</text>
            <text class="required" v-if="config.required">*</text>
          </view>
          <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
        </view>
        <picker
          class="component-style"
          :name="`COMP_START_END_DATE___${props.formItem.sequence}_start`"
          mode="date"
          :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
          :value="startDate"
          :start="getDate('start')"
          :end="getDate('end')"
          @change="bindDateChange($event, 'start')"
        >
          <view 
            class="action-result" 
            :style="{
              color: startDate ? '#31373d' : '#adb5bd',
            }"
          >
            {{ startDate || '请选择开始时间' }}
          </view>
        </picker>
      </view>
      <view class="splite-border"></view>
      <view class="form-row">
        <view class="component-label">
          <view class="field-desc"></view>
        </view>
        <picker
          class="component-style"
          :name="`COMP_START_END_DATE___${props.formItem.sequence}_end`"
          mode="date"
          :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
          :value="endDate"
          :start="getDate('start')"
          :end="getDate('end')"
          @change="bindDateChange($event, 'end')"
        >
          <view
            class="action-result" 
            :style="{
              color: startDate ? '#31373d' : '#adb5bd',
            }"
          >
            {{ endDate || '请选择结束时间' }}
          </view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import dayjs from 'dayjs'
import { makeToast } from '@/utils/toast'

defineOptions({
  name: 'StartEndDate',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const toast = makeToast()
const startDate = ref<string>('')
const endDate = ref<string>('')

const config = computed(() => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.placeholder as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_START_END_DATE___${props.formItem.sequence}_start`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择开始时间`
      }
    ]
  })
  formRulesUtil.depRules({
    name: `COMP_START_END_DATE___${props.formItem.sequence}_end`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择结束时间`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择日期范围',
    dateType: dateType,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: (titleItem?.form_values as string[]) ?? ['', '']
  }
})

watch(
  () => startDate.value,
  () => {
    if (endDate.value) {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        endDate.value = ''
        toast.info('开始时间不能大于结束时间', 2000)
      }
    }
  }
)

watch(
  () => endDate.value,
  () => {
    if (startDate.value) {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        startDate.value = ''
        toast.info('结束时间不能小于开始时间', 2000)
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
</script>

<style lang="scss" scoped>
.uni-form-component {
  .form-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 32rpx;
    .component-label {
      margin-left: 32rpx;
      .field-desc {
        color: #374151;
        font-size: 32rpx;
        .required {
          color: #e53e3e;
          font-size: 28rpx;
          position: relative;
          left: 5rpx;
          top: -6rpx;
        }
      }
      .field-sub-desc {
        color: #868e96;
        font-size: 28rpx;
      }
    }
    .component-style {
      width: 300rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 0 20rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      font-size: 28rpx;
      box-sizing: border-box;
      .action-result {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        box-sizing: border-box;
      }
    }
    &.editable {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .component-label {
        .field-desc {
          .field-label {
            color: #374151;
            font-size: 32rpx;
          }
        }
        .field-sub-desc {
          font-size: 24rpx;
          color: #9ca3af;
        }
      }
    }
  }
  .splite-border {
    margin: 26rpx 0;
  }
  .readable {
    .component-label {
      margin-left: 0;
      margin-bottom: 10rpx;
      .field-desc {
        .field-label {
          color: #727c88;
          font-size: 26rpx;
        }
      }
      .field-sub-desc {
        font-size: 24rpx;
        color: #727c88;
      }
    }
    .component-value {
      display: flex;
      align-items: center;
      .render-splite {
        margin: 0 20rpx;
        color: #727c88;
        font-size: 26rpx;
      }
      .render-text {
        color: #1b1f26;
        font-size: 28rpx;
      }
    }
  }
}
</style>
