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
        class="component-style"
        v-if="config.single"
        :range="options"
        range-key="name"
        mode="selector"
        :value="index"
        @change="bindValueChange"
      >
        <view class="action-result">{{ options[index]?.name }}</view>
      </picker>
      <view class="component-style" v-else>
        <view class="action-result" v-for="(opt, optIndex) in options" :key="optIndex">
          {{ opt.name }}
        </view>
      </view>
      <input hidden :name="`COMP_VALUE_LIST___${props.formItem.sequence}`" :value="selectedValue" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { onLoad } from '@dcloudio/uni-app'
import { queryConditionNodeValueList } from '@/apis/modules/form'
import type { ConditionNodeValueListItem } from '@/apis/typings/form'

defineOptions({
  name: 'ValueList',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const index = ref<number>(0)
const options = ref<ConditionNodeValueListItem[]>([])
const selectedValue = ref<string>('')

const bindValueChange = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: number
    }
  }
  index.value = e.detail.value
  const selectedOption = options.value[index.value]
  if (selectedOption) {
    selectedValue.value = selectedOption.name
  } else {
    selectedValue.value = ''
  }
}

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    single: selectionMode === '单项',
    required: required
  }
})

onLoad(() => {
  const sectionOptions = props.formItem.values.find((item) => item.name === '选择列表')
  const value = sectionOptions?.value ?? ''
  if (value) {
    const arr = (value as string).split(':')
    queryConditionNodeValueList(arr[0], arr[1])
      .then((res) => {
        if (res.code === 200) {
          options.value = res.message || []
          selectedValue.value = options.value[0]?.name ?? ''
        } else {
          uni.showToast({
            title: '获取选项列表失败',
            icon: 'none'
          })
        }
      })
      .catch(() => {
        uni.showToast({
          title: '获取选项列表失败',
          icon: 'none'
        })
      })
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
  .component-value {
    display: flex;
    align-items: center;
    margin-right: 32rpx;
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
