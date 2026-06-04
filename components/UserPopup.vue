<template>
  <!-- <uni-popup -->
  <ui-popup ref="popup" type="bottom" style="z-index: 999999 !important; position: fixed !important;"
    background-color="#fff" border-radius="10px 10px 0 0" :mask-closable="true" @maskClick="cancel">
    <view class="popup-content">
      <view class="filter-header">
        <view class="search-bar">
          <image class="search-icon" src="/static/search.svg" mode="aspectFit" />
          <input v-model.trim="searchQuery" type="text" placeholder="搜索人员" placeholder-class="ph-color" />
        </view>
      </view>
      <scroll-view scroll-top="0" scroll-y scroll-with-animation :show-scrollbar="false" class="scroll-wrapper"
        @click.stop :style="{ maxHeight: scrollHeight + 'px' }">

        <view class="user-list" v-for="userList in userLists" :key="userList.account" @click="handleClick(userList)">
          <image class="check-icon"  :src="`${userList.checked ? '/static/checked_rect.svg' : '/static/uncheck_rect.svg'} `"
            mode="aspectFit" style="display: flex; width: 32rpx; height: 32rpx; margin-right: 24rpx;"/>
          <view class="user-info">
            <view class="avatar" :style="{
                background: `linear-gradient(${userList.back_ground})`
              }">{{ userList.name.slice(-2) }}
            </view>
            <div class="info">
              <div class="name">{{ userList.name }}</div>
              <div class="dept">{{ userList.job_title }}</div>
            </div>
          </view>
        </view>
      </scroll-view>
      <div class="form-footer">
        <button type="submit" class="submit-btn" @click="submit">确认选择</button>
      </div>
    </view>
  </ui-popup>
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
    departUserList: { type: Array as () => string[], default: () => [], required: false },
    single: { type: Boolean, default: false, required: false }
  })

  const popup = ref()
  const selectedAccounts = ref<string[]>([])
  const searchQuery = ref<string>('')
  const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
  let selectedItems: Array<IPerson> = []
  
  //上次保存的值，用于取消时的恢复
  let lastSelectedKeys: Array<string> = []
  let lastSelectedItems: Array<IPerson> = []

  const userLists = computed(() => {
    const allUsers : IPerson[] = [...store.state.userList]
    let filterUsers = props.showAll ? allUsers : allUsers.filter((user) => props.departUserList.includes(user.account))
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filterUsers = filterUsers.filter((user) => {
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

  const emit = defineEmits(['update:modelValues'])

  const open = () => {
    popup.value?.open()
  }

  const close = () => {
    popup.value?.close()
  }

  const reset = () => {
    selectedAccounts.value = []
    searchQuery.value = ''
    selectedItems = []
  }
  
  const cancel = () => {
    popup.value?.close()
    selectedAccounts.value = [...lastSelectedKeys]
    selectedItems = [...lastSelectedItems]
  }
  
  const emitItems = () => {
    lastSelectedKeys = [...selectedAccounts.value]
    lastSelectedItems = [...selectedItems]
    emit('update:modelValues', selectedItems)
  }
  
  const submit = () => {
    emitItems()
    close()
  }

  const handleClick = (userList : IPerson) : void => {
    if (props.single) {
      selectedAccounts.value = [userList.account]
      selectedItems = [userList]
      return
    }
    const index = selectedAccounts.value.findIndex((item) => item === userList.account)
    if (index > -1) {
      selectedAccounts.value.splice(index, 1)
      selectedItems.splice(index, 1)
    } else {
      selectedAccounts.value.push(userList.account)
      selectedItems.push(userList)
    }
  }

  const setSelectedAccounts = (accounts : Array<string>) => {
    selectedAccounts.value = accounts
    const allUsers : IPerson[] = [...store.state.userList]
    selectedItems = allUsers.filter((user) => accounts.includes(user.account))
  }

  defineExpose({
    open,
    close,
    reset,
    setSelectedAccounts
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
      padding: 0 32rpx;
    }

    .user-list {
      display: flex;
      padding: 20rpx;
      align-items: center; 
      border-bottom: 2rpx solid #E5E6EB66;
      
      .user-info {
        display: flex;
        align-items: center;

        .avatar {
          width: 72rpx;
          height: 72rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          border-radius: 50%;
          margin-right: 20rpx;
          color: #fff;
        }
        
        .info {
          flex: 1;
        }
        .name {
          font-size: 28rpx;
          color: #10141C;
          font-weight: 500;
        }

        .dept {
          font-size: 24rpx;
          color: #86909C;
        }
      }
    }

    .filter-header {
      padding: 32rpx;
      background-color: #fff;
      border-top-left-radius: 32rpx;
      border-top-right-radius: 32rpx;
      border-bottom: 2rpx solid #eee;

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