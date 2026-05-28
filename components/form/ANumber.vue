<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <input
        v-else
        placeholder-style="color: #86909C; font-size: 28rpx;"
        style="height: 80rpx"
        class="component-style"
        :value="displayValue"
        :placeholder="config.placeholder"
        @input="bindInputValue"
      />
      <input hidden :name="`COMP_NUMBER___${props.formItem.sequence}`" :value="concernValue" />
      <text class="suffix-text" v-if="config.unit">{{ config.unit }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import { makeToast } from '@/utils/toast'

defineOptions({
  name: 'ANumber',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const toast = makeToast()
const displayValue = ref<string>('')
const concernValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const unit = props.formItem.values.find((item) => item.name === '单位')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const integerLimit = props.formItem.values.find((item) => item.name === '整数位数')?.value as string
  const decimalLimit = props.formItem.values.find((item) => item.name === '小数位数')?.value as string
  const fieldAttrValue = fieldAttr?.value as string
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  let showThousand = false
  try {
    const obj = JSON.parse(fieldAttrValue as string)
    showThousand = obj['数字显示千分位']
  } catch (error) {
    console.log('error', error)
  }
  formRulesUtil.depRules({
    name: `COMP_NUMBER___${props.formItem.sequence}`,
    rules: [
      {
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
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    required: required,
    showThousand,
    integerLimit,
    decimalLimit,
    unit: unit,
    value: titleItem?.form_value ?? '-'
  }
})

const formatThousand = (num: string | number) => {
  if (!config.value.showThousand) {
    return typeof num === 'number' ? num.toString() : num
  }
  if (!num) return ''
  const str = num.toString()
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

const unFormatThousand = (str: string) => {
  return str.replace(/,/g, '')
}

const bindInputValue = (event: Event) => {
  const e = event as unknown as { detail: { value: string } }
  let val = unFormatThousand(e.detail.value)
  const integerLimit = config.value.integerLimit
  const decimalLimit = config.value.decimalLimit
  const reg = new RegExp(`^\\d{0,${Number(integerLimit) || 5}}(\\.\\d{0,${Number(decimalLimit) || 3}})?$`)
  if (!reg.test(val)) {
    toast.error(`${props.formItem.label}格式不正确，整数部分最多${integerLimit}位，小数部分最多${decimalLimit}位`)
  }
  concernValue.value = val
  displayValue.value = formatThousand(val)
}
</script>

<style lang="scss" scoped>
@import '../../styles/common_select.scss';
</style>
