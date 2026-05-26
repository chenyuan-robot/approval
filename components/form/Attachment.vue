<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="header">
      <view class="component-label">
        <view class="field-desc">
          <text class="field-label">{{ props.formItem.label }}</text>
          <text class="required" v-if="!props.renderOnly && config.required">*</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <view class="upload-btn" @click="handlerFile" v-if="!props.renderOnly">
        <view class="upload-icon">+</view>
        <text class="upload-text">添加附件</text>
      </view>
    </view>
    <view class="content">
      <view v-if="props.renderOnly">
        <view
          class="tips-text"
          style="padding: 8rpx 12rpx"
          v-for="(item, index) in config.value"
          :key="index"
          @click="handlerPreview(index)"
        >
          <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
          <text>{{ item.name }}</text>
        </view>
      </view>
      <view v-else>
        <text class="tips-text">附件限制：最多{{ config.maxCount }}个，单个不超过10M</text>
        <view class="tips-text" v-for="(name, index) in uploadedNames" :key="index" @click="handlerPreview(index)">
          <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
          <text>{{ name }}</text>
        </view>
      </view>
    </view>
    <input hidden :name="`COMP_ATTACHMENT___${props.formItem.sequence}`" :value="uploadedValues" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { BASE_URL } from '@/constants/common'
import store from '@/store'
import type { StoreState } from '@/store/types'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'Attachment',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const uploadedNames = ref<string[]>([])
const uploadedValues = ref<string>('')

const handlerPreview = (index: number): void => {
  let attachmentId: string = props.renderOnly ? config.value.value[index].url : uploadedValues.value.split(',')[index]
  uni.request({
    url: `${BASE_URL}/api/v1/dl_approval/file/preview/proxy/${attachmentId}`,
    method: 'GET',
    responseType: 'arraybuffer',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
    },
    success: (res) => {
      const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
      const blobUrl = 'data:image/png;base64,' + base64
      if (!blobUrl) return
      uni.previewImage({
        urls: [blobUrl]
      })
    }
  })
}

const handlerFile = (): void => {
  if (uploadedNames.value.length >= config.value.maxCount) {
    uni.showToast({
      title: `最多只能上传${config.value.maxCount}个附件`,
      icon: 'error'
    })
    return
  }
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album'], // 从相册选择
    success: function (res) {
      const tempFilePaths = res.tempFilePaths
      const tempFilePath = tempFilePaths[0]
      uni.uploadFile({
        url: `${BASE_URL}/api/v1/dl_approval/file/upload`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
        },
        formData: {},
        success: (uploadFileRes) => {
          const data = JSON.parse(uploadFileRes.data)
          const url = data.message?.[0]?.oss_key
          if (url) {
            uploadedNames.value.push(data.message?.[0]?.file_name || '未知文件')
            uploadedValues.value = (uploadedValues.value ? uploadedValues.value + ',' : '') + url
          }
        },
        fail: () => {
          uni.showToast({
            title: '附件上传失败',
            icon: 'error'
          })
        }
      })
    }
  })
}

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxCount = (props.formItem.values.find((item) => item.name === '上传数量限制')?.value as string) || '5'
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const formValues = (titleItem?.form_values as string[]) ?? []
  let fileNames: { url: string; name: string }[] = []

  if (props.renderOnly) {
    for (const url of formValues) {
      if (url && url.length > 0) {
        const match = url.match(/_(.+)$/)
        const result = match ? match[1] : ''
        fileNames.push({
          url,
          name: result
        })
      }
    }
  }
  formRulesUtil.depRules({
    name: `COMP_ATTACHMENT___${props.formItem.sequence}`,
    rules: [
      {
        // ^.+$: 至少一个字符（必填）
        // .*: 任意字符（非必填）
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    maxCount: parseInt(maxCount),
    required: required,
    value: fileNames
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  width: calc(100% - 64rpx);
  background-color: #ffffff;
  border-radius: 16rpx;
  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    .component-label {
      .field-desc {
        color: #374151;
        font-size: 32rpx;
        .required {
          color: #e53e3e;
          font-size: 28rpx;
          position: relative;
          left: 5rpx;
          top: -6rpx;
        }
      }
      .field-sub-desc {
        color: #868e96;
        font-size: 28rpx;
      }
    }
    .upload-btn {
      display: flex;
      align-items: center;
      .upload-icon {
        width: 32rpx;
        height: 32rpx;
        line-height: 1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #165dff;
        font-size: 24rpx;
        color: #ffffff;
        margin-right: 8rpx;
      }
      .upload-text {
        font-size: 32rpx;
        color: #165dff;
      }
    }
  }
  .content {
    .tips-text {
      width: 100%;
      font-size: 24rpx;
      color: #606266;
      background-color: #f5f6f8cc;
      border-radius: 4px;
      .attachment-svg {
        width: 24rpx;
        height: 24rpx;
        margin-right: 8rpx;
        vertical-align: middle;
      }
    }
  }
  &.readable {
    width: 100%;
    .component-label {
      margin-left: 0;
      margin-bottom: 10rpx;
      .field-desc {
        .field-label {
          color: #727c88;
          font-size: 26rpx;
        }
      }
      .field-sub-desc {
        font-size: 24rpx;
        color: #727c88;
      }
    }
    .component-value {
      .render-text {
        color: #1b1f26;
        font-size: 28rpx;
      }
    }
  }
  &.editable {
    margin-left: 32rpx;
    .component-label {
      .field-desc {
        .field-label {
          color: #374151;
          font-size: 32rpx;
        }
      }
      .field-sub-desc {
        font-size: 24rpx;
        color: #9ca3af;
      }
    }
  }
}
</style>
