<template>
  <!-- ["年", "年-月", "年-月-日"] -->
  <view class="uni-form-component">
    <view>
      <view class="form-row">
        <view class="component-label">
          <view class="field-desc">
            <text>开始{{ config.dateType === '年' ? '年份' : config.dateType === '年-月' ? '月份' : '日期' }}</text>
            <text class="required" v-if="config.required">*</text>
          </view>
          <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
        </view>
        <picker
          class="component-style"
          :name="`COMP_DATE_RANGE___${props.formItem.sequence}_start`"
          mode="date"
          :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
          :value="startDate"
          :start="getDate('start')"
          :end="getDate('end')"
          @change="bindDateChange($event, 'start')"
        >
          <view class="action-result">{{ startDate || config.placeholder }}</view>
        </picker>
      </view>
      <view class="splite-border"></view>
      <view class="form-row">
        <view class="component-label">
          <view class="field-desc">
            <text>结束{{ config.dateType === '年' ? '年份' : config.dateType === '年-月' ? '月份' : '日期' }}</text>
            <text class="required" v-if="config.required">*</text>
          </view>
          <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
        </view>
        <picker
          class="component-style"
          :name="`COMP_DATE_RANGE___${props.formItem.sequence}_end`"
          mode="date"
          :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
          :value="endDate"
          :start="getDate('start')"
          :end="getDate('end')"
          @change="bindDateChange($event, 'end')"
        >
          <view class="action-result">{{ endDate || config.placeholder }}</view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'DateRange',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const startDate = ref<string>('')
const endDate = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    placeholder: placeholder || '请选择日期范围',
    dateType: dateType,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required
  }
})

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
      width: 240rpx;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 0 20rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      font-size: 32rpx;
      box-sizing: border-box;
      .action-result {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        box-sizing: border-box;
        color: #606266;
      }
    }
  }
  .splite-border {
    width: 100%;
    height: 1px;
    background-color: #f3f4f6;
    margin: 26rpx 0;
  }
}
</style>
