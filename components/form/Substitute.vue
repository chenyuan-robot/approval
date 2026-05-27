<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <input
        v-else
        :name="`COMP_SUBSTITUTE___${props.formItem.sequence}`"
        style="height: 80rpx"
        class="component-style"
        placeholder-style="color: #86909C; font-size: 28rpx;"
        :placeholder="config.placeholder"
      />
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'Substitute',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  // 该表单项校验规则
  formRulesUtil.depRules({
    name: `COMP_SUBSTITUTE___${props.formItem.sequence}`,
    rules: [
      {
        // ^.+$: 至少一个字符（必填）
        // .*: 任意字符（非必填）
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: titleItem?.form_value ?? '-'
  }
})
</script>

<style lang="scss" scoped>
@import './../../styles/common_input.scss';
</style>
