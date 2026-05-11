<template>
  <view class="comment">
    <view class="panel">
      <textarea class="component-style" v-model="inputValue" placeholder="评论全文，可@相关人员" />
      <view class="attachment">
        <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
        <text class="attachment-text">附件</text>
      </view>
    </view>
    <button class="button-style" hover-class="is-hover" @click="handleSend">发送</button>
  </view>
</template>

<script setup lang="ts">
import { addComment } from '@/apis/modules/comment'
import { ref } from 'vue'
import type { PageOptions } from './typings'
import { onLoad } from '@dcloudio/uni-app'
import bus from '@/utils/bus'

const inputValue = ref<string>('')
const instanceId = ref<string>('')

const handleSend = (): void => {
  addComment({
    operate_type: 'comment',
    comment: inputValue.value,
    instance_id: [instanceId.value]
  })
    .then((res) => {
      if (res.code === 200) {
        uni.showToast({
          title: '发送成功',
          icon: 'success'
        })
        bus.emit('detail:refresh-history')
        uni.navigateBack()
      } else {
        uni.showToast({
          title: (res.message as string) || '发送失败',
          icon: 'error'
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '发送失败',
        icon: 'error'
      })
    })
}

onLoad((options?: PageOptions) => {
  if (options?.id) {
    instanceId.value = options.id
  }
})
</script>

<style lang="scss" scoped>
.comment {
  height: 100vh;
  background-color: #f5f6f8;
  padding-top: 32rpx;
  .panel {
    width: 100%;
    background-color: #fff;
    padding-top: 24rpx;
    padding-bottom: 24rpx;
    .component-style {
      width: calc(100% - 48rpx);
      margin-left: 24rpx;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 16rpx 20rpx;
      height: 350rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
    .attachment {
      display: flex;
      align-items: center;
      margin-top: 24rpx;

      .attachment-svg {
        width: 24rpx;
        height: 24rpx;
        margin-right: 8rpx;
        margin-left: 24rpx;
      }
      .attachment-text {
        font-size: 26rpx;
        color: #727c88;
      }
    }
  }
  .button-style {
    width: calc(100% - 64rpx);
    margin-left: 32rpx;
    margin-top: 32rpx;
    color: #ffffff;
    font-size: 30rpx;
    background-color: #1262ee;
    &.is-hover {
      background-color: #009eff;
    }
  }
}
</style>
