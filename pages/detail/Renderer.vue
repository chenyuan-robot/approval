<template>
  <view class="uni-form-component-render">
    <!-- 系统控件 -->
    <view v-if="props.formItem.component_code === 'COMP_AMOUNT'">
      <Amount :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_START_END_DATE'">
      <StartEndDate :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_HAPPEN_DATE'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_ALLOCATION_BUDGET'"> text </view>
    <!-- 专用控件 -->
    <view v-else-if="props.formItem.component_code === 'COMP_SECRET_MULTI_INPUT'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_COST_BEAR'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SECRET_ATTACHMENT'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SUBSTITUTE'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_INVOICE'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_REASON'"> text </view>
    <!-- 自定义控件 -->
    <view v-else-if="props.formItem.component_code === 'COMP_MULTI_INPUT'">
      <MultiInput :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DEPARTMENT_SELECT'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SINGLE_INPUT'">
      <SingleInput :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_VALUE_LIST'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SWITCH'">
      <ASwitch :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_NUMBER'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_CITY'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SELECTION_BOX'">
      <SelectionBox :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_ATTACHMENT'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DATE'">
      <ADate :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_COMPANY_SELECT'"> text </view>
    <view v-else-if="props.formItem.component_code === 'COMP_USER_SELECT'">
      <UserSelect :formItem="props.formItem" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DATE_RANGE'"> text </view>
    <view v-else>
      <text>未知控件</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { FormItem } from './../form/typings'
import ASwitch from '@/components/form/ASwitch.vue'

defineOptions({
  name: 'Renderer',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()
</script>

<style lang="scss" scoped>
.uni-form-component-render {
  width: 100%;
}
</style>
