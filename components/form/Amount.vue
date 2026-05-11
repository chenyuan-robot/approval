<template>
  <view class="uni-form-component">
    <view class="component-label">
      <view class="field-desc">
        <text>{{ props.formItem.label }}</text>
        <text class="required" v-if="config.required">*</text>
      </view>
    </view>
    <view class="component-value">
      <picker
        :range="AMountOpts"
        :value="index"
        :name="`COMP_AMOUNT_${props.formItem.sequence}_picker`"
        range-key="label"
        @change="index = $event.detail.value"
      >
        <view class="input-result">{{ AMountOpts[index]?.label || '请选择' }}</view>
      </picker>
      <input
        class="component-style"
        :name="`COMP_AMOUNT_${props.formItem.sequence}_input`"
        placeholder="这是一个输入框"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AMountOpts } from '../../pages/form/data'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'Amount',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const config = computed(() => {
  console.log('formItem values: ', props.formItem.values)
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    required: required
  }
})

const index = ref<number>(0)
</script>

<style lang="scss" scoped>
.uni-form-component {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .component-label {
    margin-left: 32rpx;
    color: #374151;
    .field-desc {
      font-size: 32rpx;
      .required {
        color: #e53e3e;
        font-size: 28rpx;
        position: relative;
        left: 5rpx;
        top: -6rpx;
      }
    }
  }
  .component-value {
    display: flex;
    align-items: center;
    margin-right: 32rpx;
    .input-result {
      display: flex;
      align-items: center;
      margin-right: 8px;
      color: #606266;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 0rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
    .component-style {
      width: 240rpx;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
  }
}
</style>
