<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text v-if="props.renderOnly" class="render-text">{{ config.value ? '是' : '否' }}</text>
      <switch
        class="a-switch"
        v-else
        :name="`COMP_SWITCH___${props.formItem.sequence}`"
        :checked="config.defaultSelection"
      />
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'ASwitch',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  console.log('ASwitch组件接收到的formItem数据：', props.formItem)
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const defaultSelection = props.formItem.values.find((item) => item.name === '默认选择')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  return {
    showFieldDesc: showFieldDesc,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    defaultSelection: defaultSelection === '开启',
    required: required,
    value: titleItem?.form_value === 'true'
  }
})
</script>

<style lang="scss" scoped>
@import './../../styles/common_input.scss';
.a-switch {
  height: 20px;
  :deep(.uni-switch-wrapper) {
    vertical-align: baseline;
    .uni-switch-input {
      width: 40px;
      height: 20px;
      margin-right: 0;
      &:before {
        background-color: transparent;
        height: 18px;
      }
      &:after {
        width: 18px;
        height: 18px;
      }
    }
  }
}
</style>
