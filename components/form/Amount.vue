<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text class="render-text" v-if="props.renderOnly">{{ formatThousand(config.value) }}</text>
      <view v-else style="width: 100%">
        <picker class="component-style" :range="AMountOpts" :value="index" range-key="label" @change="bindValueChange">
          <view :class="['action-result', AMountOpts[index]?.label ? 'fill' : 'empty']">
            {{ AMountOpts[index]?.label || '请选择' }}
          </view>
          <image class="suffix-icon" src="/static/arrow_down.svg" mode="aspectFit" />
        </picker>
        <input
          placeholder-style="color: #86909C; font-size: 28rpx;"
          class="component-style"
          :placeholder="config.placeholder"
          :value="displayValue"
          @input="bindInputValue"
        />
        <input hidden :name="`COMP_AMOUNT___${props.formItem.sequence}_picker`" :value="concernValue" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AMountOpts } from '../../pages/form/data'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'Amount',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const showThousand = (fieldAttr?.value as string)?.includes('数字显示千分位') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_AMOUNT___${props.formItem.sequence}_picker`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      },
      {
        ruleType: '^[^_]+_\\d+(\\.\\d{0,2})?$',
        errorMessage: `${props.formItem.label}最多可输入两位小数`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入金额',
    required: required,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    showThousand,
    value: Array.isArray(titleItem?.form_values) ? titleItem?.form_values?.join(', ') : ''
  }
})

const index = ref<number>(0)
const selectedValue = ref<string>('')
const concernValue = ref<string>('')
const displayValue = ref<string>('')

// 千分位格式化（支持两位小数）
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

// 去掉千分位
const unFormatThousand = (str: string) => {
  return str.replace(/,/g, '')
}

const bindValueChange = (event: Event) => {
  const e = event as unknown as {
    detail: { value: number }
  }
  index.value = e.detail.value
  const selectedOption = AMountOpts[index.value]
  selectedValue.value = selectedOption.value
  const num = concernValue.value.split('_')[1] || ''
  concernValue.value = `${selectedValue.value}_${num}`
}

const bindInputValue = (event: Event) => {
  const e = event as unknown as { detail: { value: string } }
  let val = unFormatThousand(e.detail.value)
  if (!val) {
    displayValue.value = ''
    concernValue.value = `${selectedValue.value}_`
    return
  }
  concernValue.value = `${selectedValue.value}_${val}`
  displayValue.value = formatThousand(val)
}

onMounted(() => {
  selectedValue.value = AMountOpts[0]?.value || ''
  concernValue.value = `${selectedValue.value}_` // 数值部分置空
  displayValue.value = '' // 输入框默认空
})

watch(
  () => concernValue.value,
  (val) => {
    const num = val.split('_')[1] || ''
    displayValue.value = formatThousand(num)
  }
)
</script>

<style lang="scss" scoped>
.uni-form-component {
  width: calc(100% - 64rpx);
  .component-label {
    margin-bottom: 10rpx;
    .field-desc {
      font-size: 26rpx;
      .required {
        color: #fb2c36;
        font-size: 28rpx;
        margin-right: 6rpx;
        vertical-align: middle;
        font-weight: bold;
      }
    }
  }
  .component-value {
    display: flex;
    align-items: center;
    overflow: hidden;
    .component-style {
      display: flex;
      align-items: center;
      width: 100%;
      float: left;
      position: relative;
      height: 80rpx;
      border: 1px solid rgba(229, 230, 235, 0.6);
      background-color: rgba(249, 250, 251, 1);
      border-radius: 8px;
      padding-left: 20rpx;
      padding-top: 10rpx;
      padding-bottom: 12rpx;
      padding-right: 50rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      .action-result {
        box-sizing: border-box;
        &.fill {
          color: #10141c;
        }
        &.empty {
          color: #86909c;
        }
      }
      .suffix-icon {
        width: 18rpx;
        height: 18rpx;
        position: absolute;
        right: 32rpx;
        top: 50%;
        transform: translateY(-50%);
      }
      &:first-child {
        box-sizing: border-box;
        width: calc(50% - 30rpx);
        margin-right: 30rpx;
      }
      &:nth-child(2) {
        box-sizing: border-box;
        width: 50%;
      }
    }
  }
  &.readable {
    .component-label {
      .field-desc {
        .field-label {
          color: #727c88;
        }
      }
    }
    .component-value {
      .render-text {
        color: #1b1f26;
        font-size: 28rpx;
      }
    }
  }
  &.editable {
    margin-left: 32rpx;
    .component-label {
      .field-desc {
        .field-label {
          color: #10141c;
        }
      }
    }
  }
}
</style>
