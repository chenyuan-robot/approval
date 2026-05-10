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
import type { Person } from '@/apis/typings/global'
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
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
const userLists = computed(() => {
  const allUsers: Person[] = [...store.state.userList]
  const filterUsers = props.showAll ? allUsers : allUsers.filter((user) => props.departUserList.includes(user.account))
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
  popup.value?.close()
}

const handleClick = (userList: Person): void => {
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
  height: 50vh;
  .overlay-content {
    padding: 32rpx;
    .user-list {
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
</style>
