<template>
  <view class="uni-form-component">
    <view class="uni-row">
      <view class="component-label">
        <view class="field-desc">
          <text>{{ props.formItem.label }}</text>
          <text class="required" v-if="config.required">*</text>
        </view>
      </view>
      <view class="component-value">
        <input
          :name="`COMP_NUMBER___${props.formItem.sequence}`"
          class="component-style"
          :placeholder="config.placeholder"
        />
        <text v-if="config.unit">{{ config.unit }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'ANumber',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const unit = props.formItem.values.find((item) => item.name === '单位')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const integerLimit = props.formItem.values.find((item) => item.name === '整数位数')?.value as string
  const decimalLimit = props.formItem.values.find((item) => item.name === '小数位数')?.value as string
  formRulesUtil.depRules({
    name: `COMP_NUMBER___${props.formItem.sequence}`,
    rules: [
      {
        // ^.+$: 至少一个字符（必填）
        // .*: 任意字符（非必填）
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      },
      {
        ruleType: `^\\d{0,${Number(integerLimit) || 5}}(\\.\\d{0,${Number(decimalLimit) || 3}})?$`,
        errorMessage: `${props.formItem.label}格式不正确，整数部分最多${integerLimit}位，小数部分最多${decimalLimit}位`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    required: required,
    unit: unit
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  .uni-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    .component-value {
      display: flex;
      align-items: center;
      margin-right: 32rpx;
      .component-style {
        width: 240rpx;
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        padding: 12rpx 20rpx;
        height: 64rpx;
        font-size: 32rpx;
        box-sizing: border-box;
        margin-right: 10rpx;
      }
    }
  }
}
</style>
