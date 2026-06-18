<template>
  <view class="timeline-item" v-if="history.operate_type !== '保存'">
    <view class="tail" v-if="nodeIndex < nodeCount - 1"></view>
    <view class="node node-blue"></view>
    <view class="content">
      <view class="step-title">
        <!-- <text class="node-text" v-if="history.node_name === '开始'">提交</text>
        <text class="node-text" v-else-if="history.comment">添加评论</text> -->
        <text class="node-text">{{ history.node_name }}</text>
      </view>
      <view class="person-box">
        <view
          class="mini-avatar"
          v-if="getPersonInfo(history.operate_user) !== 'unknown'"
          :style="{
            background: `linear-gradient(${history.back_ground})`
          }"
          >{{ getPersonInfo(history.operate_user, true) }}
        </view>
        <view class="person-info">
          <view class="p-top">
            <text class="p-name">{{ history.operate_user }}</text>
            <text class="p-role" v-if="getPersonInfo(history.operate_user) !== 'unknown'">{{
              history.job_title
            }}</text></view
          >
          <view class="p-content">
            <view class="approving">{{ history.operate_type }}</view>
            <view class="comment-box" style="width: 100%">
              <view class="comment" v-if="history.comment">{{ history.comment }}</view>
              <!-- <view class="comment-attachment" v-if="Array.isArray(history.attachment)" @click="handlerPreview">
                <image :src="`${blobURL}`" alt="附件" class="attachment" />
              </view> -->
              <view
                class="detail-lists"
                style="padding: 8rpx 12rpx"
                v-for="(item, index) in history.attachment ?? []"
                :key="index"
              >
                <view class="list-start">
                  <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
                  <text class="file-name">{{ item }}</text>
                </view>
                <view class="list-end">
                  <image src="/static/eye.svg" alt="查看" @click="handlerPreview(item)" class="suffix-eye" />
                  <image src="/static/download.svg" alt="附件" @click="handlerDownload(item)" class="suffix-download" />
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="p-time">
          <text>{{ history.time_ago }}</text>
          <text class="date">{{ history.operate_time.slice(0, 10) }}</text>
        </view>
      </view>
    </view>
  </view>
  <ImagePreview ref="imagePreview" :blobData="blobURL" />
</template>

<script lang="ts" setup>
import type { InstanceHistoryItem } from '../typings'
import { onMounted, ref } from 'vue'
import store from '@/store'
import type { StoreState } from '@/store/types'
import personUtil from '@/utils/person'
import ImagePreview from '@/components/ImagePreview.vue'
import { makeToast } from '@/utils/toast'

defineOptions({
  name: 'TimeLine',
  inheritAttrs: false
})

const props = defineProps<{
  history: InstanceHistoryItem
  nodeCount: number
  nodeIndex: number
}>()

const toast = makeToast()
const imagePreview = ref<InstanceType<typeof ImagePreview>>()
const blobURL = ref<string>('')

const getPersonInfo = (user_name: string, slice?: boolean) => {
  const r = personUtil.lookup(user_name)
  if (r.account === 'unknown') {
    return 'unknown'
  }
  return slice ? r.name.slice(-1) : r.name
}

const handlerPreview = (id: string): void => {
  let attachmentId: string = id
  const suffix = attachmentId.split('.').pop()
  if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg') {
    uni.request({
      url: `${process.env.BASE_URL}/api/v1/approval/file/preview/proxy/${attachmentId}`,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
      },
      success: (res) => {
        console.log('rt_res', res)
        const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
        blobURL.value = 'data:image/png;base64,' + base64
        imagePreview.value?.open()
      }
    })
  } else {
    handlerDownload(id)
  }
}

const handlerDownload = (id: string): void => {
  toast.loading('正在下载...')
  let attachmentId: string = id
  const suffix = attachmentId.split('.').pop()
  uni.downloadFile({
    url: `${process.env.BASE_URL}/api/v1/approval/file/download/proxy/${attachmentId}`,
    method: 'GET',
    responseType: 'arraybuffer',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
    },
    success: (res) => {
      /* #ifdef H5 */
      toast.info('暂不支持下载')
      /* #endif */
      /* #ifndef H5 */
      if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg') {
        const filePath = res.tempFilePath
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => {
            toast.info('已保存至手机相册')
          },
          fail: (err) => {
            if (
              err.errMsg === 'saveImageToPhotosAlbum:fail:auth denied' ||
              err.errMsg === 'saveImageToPhotosAlbum:fail auth deny'
            ) {
              uni.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success: () => {
                  uni.openSetting({
                    success(settingdata) {
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        uni.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          showCancel: false
                        })
                      } else {
                        uni.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          showCancel: false
                        })
                      }
                    },
                    fail(failData) {
                      console.log('failData', failData)
                    }
                  })
                }
              })
            }
          }
        })
      } else {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: function (saveRes) {
            uni.openDocument({
              filePath: saveRes.savedFilePath,
              showMenu: true,
              success: () => {
                toast.hiddenLoading()
                console.log('打开文件成功')
              }
            })
          }
        })
      }
      /* #endif */
    }
  })
}

onMounted(() => {
  if (props.history.attachment) {
    console.log(props.history)
    const attachmentId = props.history.attachment[0]
    uni.request({
      url: `${process.env.BASE_URL}/api/v1/approval/file/preview/proxy/${attachmentId}`,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
      },
      success: (res) => {
        console.log('rt_res', res)
        const contentType = res.header['content-type']
        if (
          contentType.includes('image/png') ||
          contentType.includes('image/jpg') ||
          contentType.includes('image/jpeg')
        ) {
          const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
          blobURL.value = 'data:image/png;base64,' + base64
        } else {
          //
        }
      }
    })
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
    border: 2rpx solid #fff;
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
      margin-bottom: 16rpx;
      .node-text {
        font-size: 26rpx;
        font-weight: bold;
        color: #1b1f26;
        vertical-align: text-top;
        position: relative;
        top: 2rpx;
      }
    }
    .person-box {
      width: calc(100vw - 60rpx - 64rpx - 20rpx - 40rpx);
      display: flex;
      align-items: flex-start;
      position: relative;
      .mini-avatar {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 28rpx;
        border-radius: 50%;
        margin-right: 16rpx;
      }
      .detail-lists {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 14rpx;
        // width: 100%;
        font-size: 24rpx;
        color: #606266;
        background-color: #f5f6f8cc;
        border-radius: 4px;
        .list-start {
          display: flex;
          align-items: center;
          .attachment-svg {
            width: 24rpx;
            height: 24rpx;
            margin-right: 8rpx;
            vertical-align: middle;
            position: relative;
            top: 2rpx;
          }
          .file-name {
            width: 140px;
            font-size: 24rpx;
            color: #4e5969;
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 超出隐藏 */
            text-overflow: ellipsis; /* 显示... */
          }
        }
        .list-end {
          display: flex;
          align-items: center;
          .suffix-eye {
            width: 40rpx;
            height: 40rpx;
            display: block;
            position: relative;
            top: 2rpx;
            margin-right: 28rpx;
          }
          .suffix-download {
            width: 40rpx;
            height: 40rpx;
            display: block;
          }
        }
      }
      .person-info {
        // flex: 1;
        width: calc(100% - 64rpx - 16rpx - 20rpx);
        // background-color: blue;
        .p-top {
          width: 100%;
          display: flex;
          align-items: center;
          margin-bottom: 6rpx;
          .p-name {
            font-size: 28rpx;
            color: #1b1f26;
            margin-right: 10rpx;
          }
          .p-role {
            font-size: 22rpx;
            color: #727c88;
          }
        }
        .p-content {
          width: calc(100% - 64rpx - 16rpx - 20rpx);
          width: 100%;
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
            // margin-right: 12rpx;
          }
        }
      }
      .p-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 22rpx;
        color: #999;
        position: absolute;
        right: 0;
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
