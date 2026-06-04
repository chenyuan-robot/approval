<template>
  <view class="comment">
    <view class="panel">
      <view class="sign-wrapper" v-if="type === 'sign'">
        <view class="sign-title">加签类型</view>
        <radio-group @change="currentSign = $event.detail.value" style="display: flex">
          <label class="uni-list-cell uni-list-cell-pd" v-if="showPreAddSign">
            <radio value="PreAddSign" :checked="currentSign === 'PreAddSign'" />
            <text>前加签</text>
          </label>
          <label class="uni-list-cell uni-list-cell-pd" v-if="showPostAddSign">
            <radio value="PostAddSign" :checked="currentSign === 'PostAddSign'" />
            <text>同意并后加签</text>
          </label>
        </radio-group>
      </view>
      <view class="node-wrapper" v-if="type === 'return'">
        <view class="node-title">退回节点</view>
        <picker
          class="component-picker"
          mode="selector"
          @change="nodeIndex = $event.detail.value"
          :value="nodeIndex"
          :range="returnableNodes"
          range-key="node_info"
          placeholder="请选择退回节点"
        >
          <view class="uni-input"
            >{{ returnableNodes[nodeIndex]?.node_name }}（{{ returnableNodes[nodeIndex]?.approvers }}）</view
          >
        </picker>
      </view>
      <button
        class="component-button"
        v-if="type === 'transfer' || type === 'sign'"
        open-type=""
        hover-class="button-hover"
        @click="handlerOpenPanel"
      >
        {{ user?.account ? `${user.job_title}-${user.name}` : `选择${type === 'transfer' ? '转交' : '加签'}人` }}
      </button>
      <textarea
        class="component-textarea"
        v-model="commentValue"
        :placeholder="type === 'comment' ? '请输入评论' : type === 'agree' ? '请输入' : '请输入'"
      />
      <view class="attachment" @click="handlerChoose">
        <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
        <text class="attachment-text">附件</text>
      </view>
      <view class="form-lists" v-for="(file, index) in uploadedFiles" :key="index">
        <view class="list-start">
          <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
          <text class="file-name">{{ file.file_name }}</text>
        </view>
        <view class="list-end">
          <image src="/static/eye.svg" alt="查看" @click="handlerPreview(file)" class="suffix-eye" />
          <image src="/static/download.svg" alt="下载" @click="handlerDownload(file)" class="suffix-download" />
          <image src="/static/delete.svg" alt="删除" @click="handlerDelete(file)" class="suffix-delete" />
        </view>
      </view>
    </view>
    <button class="button-style" hover-class="is-hover" @click="handleSend">
      {{ type === 'comment' ? '发送' : '确定' }}
    </button>
    <ui-popup
      ref="userPopupRef"
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
    </ui-popup>
  </view>
  <ImagePreview ref="imagePreview" :blobData="blobURL" />
</template>

<script setup lang="ts">
import { addComment } from '@/apis/modules/comment'
import { computed, ref, watch } from 'vue'
import { makeToast } from '@/utils/toast'
import type { FileItem, PageOptions } from './typings'
import { onLoad } from '@dcloudio/uni-app'
import bus from '@/utils/bus'
import type { StoreState } from '@/store/types'
import type { IPerson } from '@/apis/typings/global'
import { queryReturnNodes } from '@/apis/modules/detail'
import type { ReturnNodeResponse } from '@/apis/typings/detail'
import ImagePreview from '@/components/ImagePreview.vue'
import type { FormConfigItem } from '@/apis/typings/form'
import { useStore } from 'vuex'

const toast = makeToast()
const commentValue = ref<string>('')
const instanceId = ref<string>('')
const taskNodeInstanceId = ref<string>('')
const user = ref<IPerson | null>(null)
const type = ref<string>('')
const blobURL = ref<string>('')
const userPopupRef = ref()
const currentSign = ref<'PreAddSign' | 'PostAddSign'>('PreAddSign')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
const returnableNodes = ref<Array<{ node_id: string; node_name: string; approvers: string }>>([])
const nodeIndex = ref<number>(0)
const showPreAddSign = ref<boolean>(true)
const showPostAddSign = ref<boolean>(true)
const searchQuery = ref<string>('')
const uploadedFiles = ref<Array<FileItem>>([])
const imagePreview = ref<InstanceType<typeof ImagePreview>>()
// const formInstance = ref<Array<FormConfigItem>>([])

const store = useStore()

const formInstance = computed(() => store.state.instance.form_instance)
watch(
  formInstance,
  (newVal: Array<FormConfigItem>) => {
    if (newVal) {
    }
  },
  { immediate: true }
)

const userLists = computed(() => {
  let filterUsers = [...store.state.userList]
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
      checked: false
    }
  })
})

const handlerChoose = (): void => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album'], // 从相册选择
    success: function (res) {
      const tempFilePaths = res.tempFilePaths
      const tempFilePath = tempFilePaths[0]
      toast.loading('上传中...')
      uni.uploadFile({
        url: `${process.env.BASE_URL}/api/v1/dl_approval/file/upload`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
        },
        formData: {},
        success: (uploadFileRes) => {
          const data = JSON.parse(uploadFileRes.data)
          const url = data.message?.[0]?.oss_key
          console.log(url)
          if (url) {
            uploadedFiles.value.push(data.message?.[0])
          }
        },
        fail: () => {
          uni.showToast({
            title: '附件上传失败',
            icon: 'error'
          })
        },
        complete: () => {
          toast.hiddenLoading()
        }
      })
    }
  })
}

const handlerPreview = (data: FileItem): void => {
  let attachmentId: string = data.oss_key
  const suffix = attachmentId.split('.').pop()
  if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg') {
    uni.request({
      url: `${process.env.BASE_URL}/api/v1/dl_approval/file/preview/proxy/${data.oss_key}`,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
      },
      success: (res) => {
        console.log('rt_res', res)
        const contentType = res.header['content-type']
        if (contentType.includes('image/png') || contentType.includes('image/jpeg')) {
          const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
          blobURL.value = 'data:image/png;base64,' + base64
          imagePreview.value?.open()
        } else {
          handlerDownload(data)
        }
      }
    })
  } else {
    handlerDownload(data)
  }
}

const handlerDownload = (data: FileItem): void => {
  toast.loading('正在下载...')
  uni.downloadFile({
    url: `${process.env.BASE_URL}/api/v1/dl_approval/file/download/proxy/${data.oss_key}`,
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
      /* #endif */
    }
  })
}

const handlerDelete = (data: FileItem): void => {
  const index = uploadedFiles.value.findIndex((item) => item.oss_key === data.oss_key)
  uploadedFiles.value.splice(index, 1)
}

const handlerOpenPanel = (): void => {
  userPopupRef?.value?.open()
}

const handleClick = (userList: IPerson): void => {
  user.value = userList
  userPopupRef?.value?.close()
}

const handleSend = (): void => {
  let params: Record<string, unknown> = {
    operate_type:
      type.value === 'comment'
        ? 'comment'
        : type.value === 'transfer'
          ? 'transfer'
          : type.value === 'sign'
            ? currentSign.value
            : type.value === 'return'
              ? 'return_reapprove'
              : type.value === 'agree'
                ? 'agree'
                : 'reject',
    comment: commentValue.value,
    instance_id: [
      {
        instance_id: instanceId.value,
        task_node_instance_id: taskNodeInstanceId.value
      }
    ]
  }
  // 转交
  if (type.value === 'transfer') {
    if (!user.value?.account) {
      uni.showToast({
        title: '请选择转交人',
        icon: 'error'
      })
      return
    }
    params['transfer_user'] = user.value?.account
  }
  // 加签
  if (type.value === 'sign') {
    if (!user.value?.account) {
      uni.showToast({
        title: '请选择加签人',
        icon: 'error'
      })
      return
    }
    params['add_sign_user'] = user.value?.account
  }
  // 退回
  if (type.value === 'return') {
    const node_id = returnableNodes.value[nodeIndex.value]?.node_id
    if (!node_id) {
      uni.showToast({
        title: '请选择退回节点',
        icon: 'error'
      })
      return
    }
    params['return_node_id'] = node_id
  }
  if (uploadedFiles.value.length > 0) {
    params['attachment'] = uploadedFiles.value.map((item) => item.oss_key)
  }
  if (Array.isArray(formInstance.value) && formInstance.value.length > 0) {
    params['form_instance'] = formInstance.value
  }
  addComment(params)
    .then((res) => {
      if (res.code === 200) {
        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })
        bus.emit('center:refresh')
        uni.switchTab({
          url: '/pages/center/center'
        })
      } else {
        uni.showToast({
          title: (res.message as string) || '操作失败',
          icon: 'error'
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '操作失败',
        icon: 'error'
      })
    })
}

const getNodeList = (): void => {
  queryReturnNodes(instanceId.value)
    .then((res) => {
      if (res.code === 200) {
        returnableNodes.value = ((res.message as ReturnNodeResponse).returnable_nodes || []).map((node) => {
          return {
            node_id: node.node_id,
            node_name: node.node_name,
            approvers: node.approvers,
            node_info: `${node.node_name}（${node.approvers}）`
          }
        })
        console.log('returnableNodes: ', returnableNodes.value)
      } else {
        uni.showToast({
          title: (res.message as string) || '获取退回节点失败',
          icon: 'error'
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '获取退回节点失败',
        icon: 'error'
      })
    })
}

onLoad((options?: PageOptions) => {
  if (options?.id) {
    instanceId.value = options.id
    taskNodeInstanceId.value = options.task_node_instance_id || ''
    type.value = options.type as string
    showPreAddSign.value = options.pre === 'true'
    showPostAddSign.value = options.post === 'true'
    if (type.value === 'return') {
      getNodeList()
    }
    uni.setNavigationBarTitle({
      title:
        type.value === 'comment'
          ? '添加评论'
          : type.value === 'transfer'
            ? '转交审批'
            : type.value === 'sign'
              ? '加签'
              : type.value === 'return'
                ? '退回'
                : type.value === 'agree'
                  ? '同意'
                  : '拒绝'
    })
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
    .component-button {
      width: calc(100% - 48rpx);
    }
    .sign-wrapper {
      margin-left: 24rpx;
      margin-top: 24rpx;
      margin-bottom: 24rpx;
      .sign-title {
        font-weight: bold;
        margin-bottom: 12rpx;
      }
      .uni-list-cell {
        margin-right: 24rpx;
      }
    }
    .node-wrapper {
      width: calc(100% - 48rpx);
      margin-left: 24rpx;
      margin-top: 24rpx;
      margin-bottom: 24rpx;
      .node-title {
        font-weight: bold;
        margin-bottom: 12rpx;
      }
      .component-picker {
        margin-top: 24rpx;
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        padding: 16rpx 20rpx;
        .uni-input {
          font-size: 28rpx;
          box-sizing: border-box;
          color: #31373d;
        }
      }
    }
    .component-textarea {
      width: calc(100% - 48rpx);
      margin-left: 24rpx;
      margin-top: 24rpx;
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
    .form-lists {
      margin-top: 14rpx;
      margin-left: 16rpx;
      margin-right: 16rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(245, 246, 248, 0.8);
      padding: 8rpx 12rpx;
      border-radius: 8rpx;
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
          font-size: 24rpx;
          color: #4e5969;
        }
      }
      .list-end {
        display: flex;
        align-items: center;
        .suffix-eye {
          width: 32rpx;
          height: 32rpx;
          display: block;
          position: relative;
          top: 2rpx;
          margin-right: 28rpx;
        }
        .suffix-download {
          width: 32rpx;
          height: 32rpx;
          display: block;
          margin-right: 28rpx;
        }
        .suffix-delete {
          width: 30rpx;
          height: 30rpx;
          display: block;
        }
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
}
</style>
