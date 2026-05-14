<template>
  <uni-popup
    ref="popup"
    type="bottom"
    style="z-index: 9999"
    background-color="#fff"
    border-radius="10px 10px 0 0"
    :mask-closable="true"
  >
  
    <view class="popup-content">
		<view class="filter-header">
		  <view class="search-bar">
		    <image class="search-icon" src="/static/search.svg" mode="aspectFit" />
		    <input v-model.trim="searchQuery" type="text" placeholder="搜索人员" placeholder-class="ph-color" />
		  </view>
		</view>
      <scroll-view
        scroll-top="0"
        scroll-y
        scroll-with-animation
        :show-scrollbar="false"
        class="overlay-content"
        @click.stop
        :style="{ maxHeight: scrollHeight + 'px' }"
      >
        <view class="user-list" v-for="userList in userLists" :key="userList.account" @click="handleClick(userList)">
          <text class="check-icon" v-if="userList.checked">√</text>
          <text class="text" v-if="userList.job_title">{{ userList.job_title }}</text>
          <text class="text split" v-if="userList.job_title">-</text>
          <text class="text">{{ userList.name }}</text>
        </view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import type { IPerson } from '@/apis/typings/global'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

defineOptions({
  name: 'UserPopup'
})

const props = defineProps({
  showAll: { type: Boolean, default: true, required: false },
  departUserList: { type: Array as () => string[], default: () => [], required: false }
})

const popup = ref()
const selectedAccounts = ref<string[]>([])
const searchQuery = ref<string>('')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200

const userLists = computed(() => {
  const allUsers: IPerson[] = [...store.state.userList]
  let filterUsers = props.showAll ? allUsers : allUsers.filter((user) => props.departUserList.includes(user.account))
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filterUsers = filterUsers.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(query)
      const jobTitleMatch = user.job_title?.toLowerCase().includes(query)
      return nameMatch || jobTitleMatch
    })
  }
  return filterUsers.map((user) => {
    return {
      ...user,
      checked: selectedAccounts.value.includes(user.account)
    }
  })
})

const emit = defineEmits(['update:modelValue'])

const open = () => {
  popup.value?.open()
}

const close = () => {
  searchQuery.value = ''
  popup.value?.close()
}

const handleClick = (userList: IPerson): void => {
  const index = selectedAccounts.value.findIndex((item) => item === userList.account)
  if (index > -1) {
    selectedAccounts.value.splice(index, 1)
  } else {
    selectedAccounts.value.push(userList.account)
  }
  emit('update:modelValue', userList)
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.popup-content {
  position: relative;
  z-index: 9999;
  height: 80vh;
  background-color: #f5f7f9;
  .overlay-content {
    padding: 32rpx;
    .user-list {
      height: 80rpx;
      .check-icon {
        margin-right: 16rpx;
      }
      .split {
        margin: 0 8rpx;
      }
    }
  }
  
  .filter-header {
    padding: 20rpx 32rpx;
    background-color: #fff;

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
}
</style>
