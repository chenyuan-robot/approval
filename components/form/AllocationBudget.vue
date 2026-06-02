<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="handlerOpenPanel">
      <text class="render-text" v-if="props.renderOnly">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <picker
          class="component-style"
          :range="options"
          :disabled="isInvalidModify"
          v-if="config.single"
          style="height: 80rpx"
          range-key="label"
          :value="index"
          @change="bindValueChange"
        >
          <view :class="['action-result', options[index]?.name ? 'fill' : 'empty']">
            {{ options[index]?.name ?? config.placeholder }}
          </view>
        </picker>
        <input
          :value="selectedValue"
          v-else
          placeholder-style="color: #86909C; font-size: 28rpx;"
          class="component-style"
          style="height: 80rpx; pointer-events: none"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          class="suffix-icon"
          :src="`${selectedValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import type { ConditionNodeValueListItem } from '@/apis/typings/form'

interface OptionItem extends ConditionNodeValueListItem {
  checked: boolean
}

interface FormConfig {
  placeholder: string
  showFieldDesc: boolean
  desc: string
  required: boolean
  showTitle: boolean
  single: boolean
  value: ''
}

defineOptions({
  name: 'AllocationBudget', // 预算归口
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const isInvalidModify = ref<boolean>(false)
const index = ref<number>(0)
const config = ref<FormConfig>({
  placeholder: '',
  showTitle: false,
  required: false,
  showFieldDesc: false,
  desc: '',
  single: true,
  value: ''
})
const options = ref<OptionItem[]>([])
const selectedValue = ref<string>('')

const handlerOpenPanel = () => {
  console.log(!props.renderOnly)
  if (!props.renderOnly && !config.value.single) {
    console.log('打开选择面板')
  }
}

const bindValueChange = () => {}

const handleClear = () => {
  if (selectedValue.value) {
    selectedValue.value = ''
    index.value = -1
  }
}

const getConfig = (): FormConfig => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    single: true,
    value: ''
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  isInvalidModify.value = type?.value === 'invalid' || type?.value === 'modify'
  config.value = getConfig()
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    console.log('edit', props.formItem)
    console.log('edit', config.value.value)
    const formValue = config.value.value
    // inputValue.value = formValue
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_select.scss';
</style>
