<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="openPanel">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <input
          placeholder-style="color: #86909C; font-size: 28rpx;"
          style="height: 80rpx; pointer-events: none"
          :value="selectedValue"
          class="component-style"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          class="suffix-icon"
          :src="`${submitValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
        <input hidden :name="`COMP_USER_SELECT___${props.formItem.sequence}`" :value="submitValue" />
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
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
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    disabled: !(defaultItem?.extra_option_config?.default_value ?? false),
    required: required,
    desc: fieldDesc?.value as string,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[]) ?? []) : [],
    maxlength: Number(maxlength) || 1000,
    showAll: selectionRange?.value === '全部' || selectionRange?.value === null,
    departUserList: (selectionRange?.specific_value as string[]) ?? [],
    single: selectionMode === '单项',
    value: nameStr.slice(0, -1)
  }
})

const handleClear = () => {
  if (submitValue.value) {
    submitValue.value = ''
    selectedValue.value = ''
    selectedUsers.value = []
    userPopupRef?.value?.reset()
  }
}

const openPanel = (): void => {
  if (!config.value.disabled && !props.renderOnly) {
    userPopupRef?.value?.open()
  }
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
@import '../../styles/common_select.scss';
</style>
