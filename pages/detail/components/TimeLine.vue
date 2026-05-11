<template>
  <view class="timeline-item">
    <view class="tail"></view>
    <view class="node node-blue"></view>
    <view class="content">
      <view class="step-title">
        <text v-if="history.node_name === '开始'">提交</text>
        <text v-else-if="history.comment">添加评论</text>
        <text v-else>审批</text>
      </view>
      <view class="person-box">
        <view
          class="mini-avatar"
          :style="{
            background: `linear-gradient(${history.back_ground})`
          }"
          >{{ history.operate_user ? history.operate_user.slice(-1) : '' }}
        </view>
        <view class="person-info">
          <view class="p-top">
            <text class="p-name">{{ history.operate_user }}</text>
            <text class="p-role">{{ history.job_title }}</text></view
          >
          <view class="p-content">
            <view v-if="history.node_name === '开始'" class="submited">已提交</view>
            <view v-else-if="history.comment">
              <view class="comment">{{ history.comment }}</view>
              <view class="comment-attachment" v-if="Array.isArray(history.attachment)">
                <image :src="`${blobURL}`" alt="附件" class="attachment" />
              </view>
            </view>
            <view v-else class="approving">{{ history.operate_type }}</view>
          </view>
        </view>
        <view class="p-time">
          <text>{{ history.time_ago }}</text>
          <text class="date">{{ history.operate_time.slice(0, 10) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { previewAttachment } from '@/apis/modules/comment'
import type { InstanceHistoryItem } from '../typings'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

defineOptions({
  name: 'TimeLine',
  inheritAttrs: false
})

const props = defineProps<{
  history: InstanceHistoryItem
}>()

const blobURL = ref<string>('')

onLoad(() => {
  console.log('history', props.history)
  if (props.history.attachment) {
    const attachmentId = props.history.attachment[0]
    previewAttachment(attachmentId)
      .then((res) => {
        console.log('res', res)
        blobURL.value = res
      })
      .catch((error) => {})
  }
})
</script>

<style lang="scss" scoped>
.timeline-item {
  position: relative;
  padding-bottom: 40rpx;
  &.current {
    padding-bottom: 0;
    .tail {
      display: none;
    }
  }
  .tail {
    position: absolute;
    left: 0rpx;
    top: 30rpx;
    bottom: 0;
    width: 1rpx;
    background-color: #e9eaed;
  }
  .node {
    position: absolute;
    left: 0;
    top: 8rpx;
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    box-shadow: 0 0 0 2rpx #2979ff;
    background: #fff;
  }
  .node-blue {
    box-shadow: 0 0 0 4rpx #2979ff;
  }
  .node-gray {
    box-shadow: 0 0 0 2rpx #ccc;
  }
  .content {
    padding-left: 40rpx;
    .step-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 16rpx;
    }
    .person-box {
      display: flex;
      align-items: flex-start;
      .mini-avatar {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 28rpx;
        border-radius: 50%;
        margin-right: 16rpx;
      }
      .person-info {
        flex: 1;
        .p-top {
          display: flex;
          align-items: center;
          margin-bottom: 6rpx;
          .p-name {
            font-size: 28rpx;
            color: #333;
            margin-right: 10rpx;
          }
          .p-role {
            font-size: 22rpx;
            color: #999;
          }
        }
        .p-content {
          .submited {
            color: #00b42a;
            font-size: 22rpx;
          }
          .approving {
            color: #00b42a;
            font-size: 22rpx;
          }
          .comment {
            font-size: 26rpx;
            color: #1b1f26;
            background-color: #f5f6f8;
            border-radius: 8px;
            padding: 16rpx;
            margin-top: 12rpx;
            margin-right: 12rpx;
          }
          .comment-attachment {
            margin-top: 12rpx;
            .attachment {
              width: 40rpx;
              height: 40rpx;
            }
          }
        }
      }
      .p-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 22rpx;
        color: #999;
        .date {
          margin-top: 4rpx;
        }
      }
    }
    .comment-bubble {
      background-color: #f8f9fa;
      padding: 20rpx;
      border-radius: 12rpx;
      font-size: 26rpx;
      color: #666;
      margin-top: 16rpx;
      line-height: 1.5;
    }
  }
}
</style>
