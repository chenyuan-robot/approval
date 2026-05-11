<template>
  <view class="uni-form-component">
    <view class="component-label">
      <view class="field-desc">
        <text>{{ props.formItem.label }}</text>
        <text class="required" v-if="config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value">
      <picker
        :name="`COMP_SELECTION_BOX_${props.formItem.sequence}_select`"
        @change="index = $event.detail.value"
        :value="index"
        :range="config.options"
      >
        <view class="uni-input">{{ config.options[index] ?? config.placeholder }}</view>
      </picker>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'SelectionBox',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const index = ref<number>(-1)

const config = computed(() => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.placeholder as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const sectionOptions = props.formItem.values.find((item) => item.name === '选择列表')
  const defaultSelcetion = props.formItem.values.find((item) => item.name === '默认值')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    single: selectionMode === '单项',
    options: (sectionOptions?.selection_list as string[]) ?? [],
    defaultValue: defaultSelcetion?.specific_value ?? [],
    required: required
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .component-label {
    margin-left: 32rpx;
    color: #374151;
    font-size: 32rpx;
    .field-desc {
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
