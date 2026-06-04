<template>
  <ui-popup
    ref="popup"
    type="bottom"
    style="z-index: 999999 !important; position: fixed !important;"
    background-color="#fff"
    border-radius="10px 10px 0 0"
    :mask-closable="true"
    @maskClick="cancel"
  >
    <view class="popup-content">
      <view class="scroll-wrapper">
        <DepartmentTree :departments="departmentList" :selected-keys="selectedKeys" @select="handleDepartmentSelect" />
      </view>
      <div class="form-footer">
        <button type="submit" class="submit-btn" @click="submit">
          确认选择
        </button>
      </div>
    </view>
  </ui-popup>
</template>

<script setup lang="ts">
import type { DepartmentsResponse } from '@/apis/typings/global'
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import DepartmentTree from './DepartmentTree/DepartmentTree.vue'
import type { List } from 'lodash'

const store = useStore()

defineOptions({
  name: 'DepartmentPopup'
})

const props = defineProps({
  single: { type: Boolean, default: false, required: false },
  selectedList: { type: Array as () => string[], default: () => [], required: false },
})

const popup = ref()
const searchQuery = ref<string>('')
const selectedKeys = ref<string[]>([])
let selectedItems: Array<DepartmentsResponse> = []

//上次保存的值，用于取消时的恢复
let lastSelectedKeys: Array<string> = []
let lastSelectedItems: Array<DepartmentsResponse> = []

const handleDepartmentSelect = (key: string, item: DepartmentsResponse) => {
  if (props.single) {
    selectedKeys.value = [key]
    selectedItems = [item]
    return
  }
  const index = selectedKeys.value.indexOf(key)
  if (index > -1) {
    selectedKeys.value.splice(index, 1)
    selectedItems.splice(index, 1)
  } else {
    selectedKeys.value.push(key)
    selectedItems.push(item)
  }
}

const departmentList = computed(() => {
  if (!store.state.departments) {
    return []
  }
  let filterDepartments: DepartmentsResponse[] = [...store.state.departments]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filterDepartments = filterDepartments.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query)
      return nameMatch
    })
  }
  return filterDepartments.map((item) => {
    return {
      ...item,
      checked: selectedKeys.value.includes(item.key)
    }
  })
})

const emit = defineEmits(['update:modelValues'])

const open = () => {
  popup.value?.open()
}

const close = () => {
  popup.value?.close()
}

const cancel = () => {
  popup.value?.close()
  selectedKeys.value = [...lastSelectedKeys]
  selectedItems = [...lastSelectedItems]
}

const reset = () => {
  selectedKeys.value = []
  searchQuery.value = ''
  selectedItems = []
}

const submit = () => {
  emitItems()
  close()
}

const emitItems = () => {
  if (selectedItems.length == 0) return
  lastSelectedKeys = [...selectedKeys.value]
  lastSelectedItems = [...selectedItems]
  emit('update:modelValues', selectedItems)
}

defineExpose({
  open,
  close,
  reset
})

onMounted(() => {
  for(var key of props.selectedList) {
    if (key.length == 0) continue
    const item = store.state.departmentsMap[key]
    if (item === undefined) continue
    handleDepartmentSelect(key, item)
  }
  emitItems()
})

</script>

<style lang="scss" scoped>
.popup-content {
  position: relative;
  z-index: 9999;
  height: 80vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;

  .form-footer {
    margin-top: auto;
    padding: 32rpx;
    border-top: 2rpx solid #eee;
    text-align: center;
  }
  
  .submit-btn {
    background-color: #2979ff;
    color: white;
    border: none;
    border-radius: 16rpx;
    cursor: pointer;
    font-size: 28rpx;
    height: 72rpx;
  }
  
  .scroll-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: clip;
    padding: 32rpx;
  }
}
</style>
