<template>
  <view class="uni-form-component">
    <view class="component-label">
      <view class="field-desc">
        <text>{{ props.formItem.label }}</text>
        <text class="required" v-if="config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value" @click="openPanel">
      <input
        :name="`COMP_USER_SELECT_${props.formItem.sequence}`"
        :value="inputValue"
        class="component-style"
        disabled
        :placeholder="config.placeholder"
      />
    </view>
    <UserPopup
      ref="userPopupRef"
      @update:modelValue="handleUserSelect"
      :show-all="config.showAll"
      :depart-user-list="config.departUserList"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from './../typings'
import UserPopup from '@/components/UserPopup.vue'
import type { Person } from '@/apis/typings/global'

defineOptions({
  name: 'UserSelect',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const userPopupRef = ref()
const selectedUsers = ref<Person[]>([])
const inputValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.placeholder as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxlength = props.formItem.values.find((item) => item.name === '字符数限制')?.value as string
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const selectionRange = props.formItem.values.find((item) => item.name === '选择范围')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[]) ?? []) : [],
    maxlength: Number(maxlength) || 1000,
    showAll: selectionRange?.value === '全部',
    departUserList: (selectionRange?.specific_value as string[]) ?? [],
    required: required
  }
})

const openPanel = (): void => {
  userPopupRef?.value?.open()
}

const handleUserSelect = (selectedUser: Person) => {
  const index = selectedUsers.value.findIndex((item) => item.account === selectedUser.account)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(selectedUser)
  }
  inputValue.value = selectedUsers.value.map((item) => item.name).join(', ')
}
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
      pointer-events: none;
      width: 240rpx;
      border: 1px solid #dcdfe6;
      border-radius: 9px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
  }
}
</style>
