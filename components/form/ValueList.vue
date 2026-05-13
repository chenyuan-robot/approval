<template>
  <view class="value-list" style="width: 100%">
    <view class="uni-form-component">
      <view class="component-label">
        <view class="field-desc">
          <text>{{ props.formItem.label }}</text>
          <text class="required" v-if="config.required">*</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <view class="component-value" @click="openPanel">
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
        <input :value="selectedValue" v-else class="component-style" disabled :placeholder="config.placeholder" />
        <input hidden :name="`COMP_VALUE_LIST___${props.formItem.sequence}`" :value="selectedValue" />
      </view>
    </view>
    <uni-popup
      ref="popup"
      type="bottom"
      style="z-index: 9999"
      background-color="#fff"
      border-radius="10px 10px 0 0"
      :mask-closable="true"
    >
      <view class="popup-content">
        <scroll-view
          scroll-top="0"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          class="overlay-content"
          @click.stop
          :style="{ maxHeight: scrollHeight + 'px' }"
        >
          <view class="opt-list" v-for="option in newOpts" :key="option.code" @click="handleClick(option)">
            <text class="check-icon" v-if="option.checked">√</text>
            <text class="text">{{ option.name }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { onLoad } from '@dcloudio/uni-app'
import { queryConditionNodeValueList } from '@/apis/modules/form'
import type { ConditionNodeValueListItem } from '@/apis/typings/form'

interface OptionItem extends ConditionNodeValueListItem {
  checked: boolean
}

defineOptions({
  name: 'ValueList',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const index = ref<number>(0)
const options = ref<OptionItem[]>([])
const selectedValue = ref<string>('')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
const popup = ref()
const selectedLists = ref<string[]>([])

const handleClick = (opt: OptionItem) => {
  const index = selectedLists.value.findIndex((item) => item === opt.name)
  if (index > -1) {
    selectedLists.value.splice(index, 1)
  } else {
    selectedLists.value.push(opt.name)
  }
  selectedValue.value = selectedLists.value.join(',')
}

const openPanel = () => {
  console.log(config.value.single)
  if (!config.value.single) {
    popup?.value?.open()
  }
}

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

const newOpts = computed(() => {
  return options.value.map((opt) => {
    return {
      ...opt,
      checked: selectedLists.value.includes(opt.name)
    }
  })
})

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
          options.value = (res.message || []).map((option) => {
            return {
              ...option,
              checked: false
            }
          })
          selectedValue.value = options.value[0]?.name ?? ''
          if (selectedValue.value) {
            selectedLists.value = [selectedValue.value]
          }
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
.value-list {
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
        pointer-events: none;
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
  .popup-content {
    position: relative;
    z-index: 9999;
    height: 50vh;
    .overlay-content {
      padding: 32rpx;
      .opt-list {
        height: 60rpx;
        .check-icon {
          margin-right: 16rpx;
        }
        .split {
          margin: 0 8rpx;
        }
      }
    }
  }
}
</style>
