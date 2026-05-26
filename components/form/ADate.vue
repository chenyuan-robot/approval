<template>
  <!-- ["年", "年-月", "年-月-日"] -->
  <view class="uni-form-component">
    <view :class="['form-row', props.renderOnly ? 'readable' : 'editable']">
      <view class="component-label">
        <view class="field-desc">
          <text class="field-label">{{ props.formItem.label }}</text>
          <text class="required" v-if="!props.renderOnly && config.required">*</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <picker
        v-else
        class="component-style"
        :name="`COMP_DATE___${props.formItem.sequence}`"
        mode="date"
        :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
        :value="selectedDate"
        :start="getDate('start')"
        :end="getDate('end')"
        @change="bindDateChange($event)"
      >
        <view
          class="action-result"
          :style="{
            color: selectedDate ? '#31373d' : '#adb5bd'
          }"
        >
          {{ selectedDate || config.placeholder }}
        </view>
        <image class="clear-icon" @click.stop="handleClear" src="/static/clear.svg" mode="aspectFit" />
      </picker>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'ADate',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const selectedDate = ref<string>('')

const config = computed(() => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_DATE___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择${props.formItem.label}`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择日期范围',
    dateType: dateType,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: titleItem?.form_value ?? '-'
  }
})

const handleClear = () => {
  selectedDate.value = ''
}

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

const bindDateChange = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: string
    }
  }
  selectedDate.value = e.detail.value
}
</script>

<style lang="scss" scoped>
.uni-form-component {
  .form-row {
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
        position: relative;
        display: flex;
        align-items: center;
        font-size: 28rpx;
        box-sizing: border-box;
        color: #31373d;
      }
      .clear-icon {
        width: 18rpx;
        height: 18rpx;
        position: absolute;
        right: 15rpx;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    &.readable {
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
        .render-text {
          color: #1b1f26;
          font-size: 28rpx;
        }
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
    width: 100%;
    height: 1px;
    background-color: #f3f4f6;
    margin: 26rpx 0;
  }
}
</style>
