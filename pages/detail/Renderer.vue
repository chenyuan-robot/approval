<template>
  <view class="uni-form-component-render">
    <!-- 系统控件 -->
    <view v-if="props.formItem.component_code === 'COMP_AMOUNT'">
      <Amount :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_START_END_DATE'">
      <StartEndDate :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_HAPPEN_DATE'">
      <HappenDate :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_ALLOCATION_BUDGET'">
      <AllocationBudget :formItem="props.formItem" :renderOnly="true" />
    </view>
    <!-- 专用控件 -->
    <view v-else-if="props.formItem.component_code === 'COMP_SECRET_MULTI_INPUT'">
      <SecretMultiInput :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_COST_BEAR'">
      <CostBear :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SECRET_ATTACHMENT'">
      <SecretAttachment :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SUBSTITUTE'">
      <Substitute :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_INVOICE'">
      <Invoice :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_REASON'">
      <Reason :formItem="props.formItem" :renderOnly="true" />
    </view>
    <!-- 自定义控件 -->
    <view v-else-if="props.formItem.component_code === 'COMP_MULTI_INPUT'">
      <MultiInput :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DEPARTMENT_SELECT'">
      <DepartmentSelect :formItem="props.formItem" :renderOnly="true"/>
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SINGLE_INPUT'">
      <SingleInput :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_VALUE_LIST'">
      <ValueList :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SWITCH'">
      <ASwitch :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_NUMBER'">
      <ANumber :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_CITY'">
      <City :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_SELECTION_BOX'">
      <SelectionBox :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_ATTACHMENT'">
      <Attachment :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DATE'">
      <ADate :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_COMPANY_SELECT'">
      <CompanySelect :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_USER_SELECT'">
      <UserSelect :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else-if="props.formItem.component_code === 'COMP_DATE_RANGE'">
      <DateRange :formItem="props.formItem" :renderOnly="true" />
    </view>
    <view v-else>
       <Unknown :formItem="props.formItem" :renderOnly="true" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { FormItem } from './../form/typings'
import ASwitch from '@/components/form/ASwitch.vue'
import DepartmentSelect from '@/components/form/DepartmentSelect.vue'
import SingleInput from '@/components/form/SingleInput.vue'
import ANumber from '@/components/form/ANumber.vue'
import MultiInput from '@/components/form/MultiInput.vue'
import ValueList from '@/components/form/ValueList.vue'
import Amount from '@/components/form/Amount.vue'
import ADate from '@/components/form/ADate.vue'
import UserSelect from '@/components/form/UserSelect.vue'
import SelectionBox from '@/components/form/SelectionBox.vue'
import StartEndDate from '@/components/form/StartEndDate.vue'
import CostBear from '@/components/form/CostBear.vue'
import City from '@/components/form/City.vue'
import DateRange from '@/components/form/DateRange.vue'
import Attachment from '@/components/form/Attachment.vue'
import HappenDate from '@/components/form/HappenDate.vue'
import Substitute from '@/components/form/Substitute.vue'
import SecretAttachment from '@/components/form/SecretAttachment.vue'
import SecretMultiInput from '@/components/form/SecretMultiInput.vue'
import Invoice from '@/components/form/Invoice.vue'
import Reason from '@/components/form/Reason.vue'
import AllocationBudget from '@/components/form/AllocationBudget.vue'
import CompanySelect from '@/components/form/CompanySelect.vue'
import Unknown from '@/components/form/Unknown.vue'

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
