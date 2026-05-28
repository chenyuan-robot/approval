<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text class="render-text" v-if="props.renderOnly">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <picker
          class="component-style"
          @change="bindValueChange"
          v-if="config.single"
          style="height: 80rpx"
          range-key="name"
          :value="index"
          :range="config.options"
        >
          <view :class="['action-result', config.options[index]?.name ? 'fill' : 'empty']">
            {{ config.options[index]?.name ?? config.placeholder }}
          </view>
        </picker>
        <input
          placeholder-style="color: #86909C; font-size: 28rpx;"
          :value="selectedValue"
          v-else
          style="height: 80rpx; pointer-events: none"
          class="component-style"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          class="suffix-icon"
          :src="`${selectedValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
        <input hidden :name="`COMP_COMPANY_SELECT___${props.formItem.sequence}`" :value="selectedValue" />
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'

interface OptionItem {
  name: string
  checked: boolean
}

defineOptions({
  name: 'CompanySelect',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const index = ref<number>(-1)
const selectedValue = ref<string>('')
const selectedLists = ref<string[]>([])

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const single = selectionMode === '单项' // 是否单选
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    required: required,
    single,
    options: [] as OptionItem[],
    value: ''
  }
})

const bindValueChange = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: number
    }
  }
  console.log(e.detail.value)
}

const handleClear = () => {
  if (selectedValue.value) {
    selectedValue.value = ''
    index.value = -1
    selectedLists.value = []
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/common_select.scss';
</style>
