<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="field-label">{{ props.formItem.label }}</text>
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value" @click="openPanel">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <input
        placeholder-style="color: #adb5bd; font-size: 28rpx;"
        :value="selectedValue"
        v-else
        class="component-style"
        disabled
        :placeholder="config.placeholder"
      />
      <image class="clear-icon" @click.stop="handleClear" src="/static/clear.svg" mode="aspectFit" />
      <input hidden :name="`COMP_USER_SELECT___${props.formItem.sequence}`" :value="submitValue" />
    </view>
  </view>
  <UserPopup
    ref="userPopupRef"
    @update:modelValue="handleUserSelect"
    :show-all="config.showAll"
    :depart-user-list="config.departUserList"
    :single="config.single"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import UserPopup from '@/components/UserPopup.vue'
import type { IPerson } from '@/apis/typings/global'
import { formRulesUtil } from '@/pages/form/utils/rules'
import { useStore } from 'vuex'

const store = useStore()

defineOptions({
  name: 'UserSelect',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const userPopupRef = ref()
const selectedUsers = ref<IPerson[]>([])
const selectedValue = ref<string>('')
const submitValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxlength = props.formItem.values.find((item) => item.name === '字符数限制')?.value as string
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const selectionRange = props.formItem.values.find((item) => item.name === '选择范围')
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const formValues = (titleItem?.form_values as string[]) ?? []
  let nameStr: string = ''
  for (const item of formValues) {
    const name: string = store.state.userList.find((user: IPerson) => user.account === item)?.name ?? ''
    nameStr += name ? `${name}、` : ''
  }
  formRulesUtil.depRules({
    name: `COMP_USER_SELECT___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择${props.formItem.label}`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[]) ?? []) : [],
    maxlength: Number(maxlength) || 1000,
    showAll: selectionRange?.value === '全部' || selectionRange?.value === null,
    departUserList: (selectionRange?.specific_value as string[]) ?? [],
    single: selectionMode === '单项',
    required: required,
    value: nameStr.slice(0, -1)
  }
})

const handleClear = () => {
  submitValue.value = ''
  selectedValue.value = ''
}

const openPanel = (): void => {
  userPopupRef?.value?.open()
}

const handleUserSelect = (selectedUser: IPerson) => {
  if (config.value.single) {
    selectedValue.value = selectedUser.name
    submitValue.value = selectedUser.account
    return
  }
  const index = selectedUsers.value.findIndex((item) => item.account === selectedUser.account)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(selectedUser)
  }
  selectedValue.value = selectedUsers.value.map((item) => item.name).join(', ')
  submitValue.value = selectedUsers.value.map((item) => item.account).join(', ')
}
</script>

<style lang="scss" scoped>
.uni-form-component {
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
    position: relative;
    .component-style {
      pointer-events: none;
      width: 300rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
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
</style>
