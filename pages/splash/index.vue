<template>
  <view class="container">
    <image src="/static/logo.png" alt="logo" class="logo" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'

onShow(() => {
  // TODO: 后续此处集成飞书免登录相关
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 100)
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo {
  width: 128rpx;
  height: 128rpx;
}
</style>
