<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <!-- <view v-if="props.renderOnly" class="render-text">{{ config.value ? '是' : '否' }}</view> -->
      <view v-if="props.renderOnly" class="render-text">
        <switch class="a-switch" :disabled="true" :checked="config.value" />
      </view>
      <switch
        class="a-switch"
        v-else
        :disabled="config.disabled"
        :name="`COMP_SWITCH___${props.formItem.sequence}`"
        :checked="isChecked"
      />
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'

export interface FormConfig {
  showFieldDesc: boolean
  showTitle: boolean
  desc: string
  disabled: boolean
  required: boolean
  value: boolean
}

defineOptions({
  name: 'ASwitch',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const isChecked = ref(false)
const config = ref<FormConfig>({
  showFieldDesc: false,
  showTitle: false,
  desc: '',
  disabled: false,
  required: false,
  value: false
})

const getConfig = (): FormConfig => {
  console.log('ASwitch组件接收到的formItem数据：', props.formItem)
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const defaultSelection = props.formItem.values.find((item) => item.name === '默认选择')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  isChecked.value = defaultSelection?.value === '开启'
  return {
    showFieldDesc: showFieldDesc,
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    disabled: !((defaultSelection?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    required: required,
    value: titleItem?.form_value === '是' ? true : false
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    console.log('ASwitch组件接收到的formValue数据：', config.value.value)
    isChecked.value = config.value.value
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
