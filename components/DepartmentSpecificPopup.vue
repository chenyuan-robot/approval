<template>
  <ui-popup
    ref="popup"
    type="bottom"
    style="z-index: 999999 !important; position: fixed !important"
    background-color="#fff"
    border-radius="10px 10px 0 0"
    :mask-closable="true"
    @maskClick="cancel"
  >
    <view class="popup-content">
      <view class="filter-header">
        <view class="search-bar">
          <image class="search-icon" src="/static/search.svg" mode="aspectFit" />
          <input v-model.trim="searchQuery" type="text" placeholder="搜索部门" placeholder-class="ph-color" />
        </view>
      </view>

      <view class="scroll-wrapper">
        <view class="user-list" v-for="item in dataSource" :key="item.key" @click="handleClick(item)">
          <image
            :src="`${item.checked ? '/static/checked_rect.svg' : '/static/uncheck_rect.svg'} `"
            mode="aspectFit"
            style="width: 32rpx; height: 32rpx; margin-right: 16rpx; vertical-align: middle"
          />
          <text class="text">{{ item.name }}</text>
        </view>
      </view>

      <div class="form-footer">
        <button type="submit" class="submit-btn" @click="submit">确认选择</button>
      </div>
    </view>
  </ui-popup>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { DepartmentsResponse } from '@/apis/typings/global'

const store = useStore()

defineOptions({
  name: 'DepartmentSpecificPopup'
})

const props = defineProps({
  selectedList: { type: Array as () => string[], default: () => [], required: false },
  specificList: { type: Array as () => string[], default: () => [], required: false },
  single: { type: Boolean, default: false, required: false }
})

const popup = ref()
const selectedDepartments = ref<string[]>([])
const searchQuery = ref<string>('')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
let selectedItems: Array<DepartmentsResponse> = []

//上次保存的值，用于取消时的恢复
let lastSelectedKeys: Array<string> = []
let lastSelectedItems: Array<DepartmentsResponse> = []

const dataSource = computed(() => {
  let filterDatas = []
  for (const item of props.specificList) {
    const data = store.state.departmentsMap[item]
    if (data !== undefined) {
      filterDatas.push(data)
    }
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filterDatas = filterDatas.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query)
      return nameMatch
    })
  }
  return filterDatas.map((item) => {
    return {
      ...item,
      checked: selectedDepartments.value.includes(item.key)
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

const reset = () => {
  selectedDepartments.value = []
  searchQuery.value = ''
  selectedItems = []
}

const handleClick = (item: DepartmentsResponse): void => {
  if (props.single) {
    selectedDepartments.value = [item.key]
    selectedItems = [item]
    return
  }
  const index = selectedDepartments.value.findIndex((_) => _ === item.key)
  if (index > -1) {
    selectedDepartments.value.splice(index, 1)
    selectedItems.splice(index, 1)
  } else {
    selectedDepartments.value.push(item.key)
    selectedItems.push(item)
  }
}

const submit = () => {
  emitItems()
  close()
}

const cancel = () => {
  popup.value?.close()
  selectedDepartments.value = [...lastSelectedKeys]
  selectedItems = [...lastSelectedItems]
}

const emitItems = () => {
  if (selectedItems.length == 0) return
  lastSelectedKeys = [...selectedDepartments.value]
  lastSelectedItems = [...selectedItems]
  emit('update:modelValues', selectedItems)
}

defineExpose({
  open,
  close,
  reset
})

onMounted(() => {
  for (var key of props.selectedList) {
    if (key.length == 0) continue
    const item = store.state.departmentsMap[key]
    if (item === undefined) continue
    handleClick(item)
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

  .scroll-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: clip;
    padding: 0 32rpx 32rpx 32rpx;
  }

  .user-list {
    height: 80rpx;

    .check-icon {
      margin-right: 16rpx;
    }

    .user-list {
      height: 80rpx;

      .check-icon {
        margin-right: 16rpx;
      }

      .split {
        margin: 0 8rpx;
      }
      
      .text {
        font-size: 28rpx;
        color: #10141C;
      }
    }

    .filter-header {
      padding: 32rpx 32rpx;
      background-color: #fff;
      border-top-left-radius: 32rpx;
      border-top-right-radius: 32rpx;

      .search-bar {
        background-color: #f5f7f9;
        border-radius: 16rpx;
        padding: 20rpx 16rpx;
        display: flex;
        align-items: center;

        .search-icon {
          margin-right: 20rpx;
          width: 28rpx;
          height: 28rpx;
        }

        input {
          flex: 1;
          font-size: 28rpx;
        }

        .ph-color {
          color: #bdc5cf;
        }
      }
    }

    .form-footer {
      margin-top: auto;
      padding: 32rpx;
      border-top: 1px solid #eee;
      text-align: center;
    }

    .submit-btn {
      background-color: #2979ff;
      color: white;
      border: none;
      border-radius: 16rpx;
      cursor: pointer;
    }
  }

  .filter-header {
    padding: 32rpx 32rpx;
    background-color: #fff;
    border-top-left-radius: 32rpx;
    border-top-right-radius: 32rpx;

    .search-bar {
      background-color: #f5f7f9;
      border-radius: 16rpx;
      padding: 20rpx 16rpx;
      display: flex;
      align-items: center;

      .search-icon {
        margin-right: 20rpx;
        width: 28rpx;
        height: 28rpx;
      }

      input {
        flex: 1;
        font-size: 28rpx;
      }

      .ph-color {
        color: #bdc5cf;
      }
    }
  }

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
}
</style>
