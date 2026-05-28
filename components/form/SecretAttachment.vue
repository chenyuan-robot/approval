<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <view class="detail-container" v-if="props.renderOnly">
        <view
          class="detail-lists"
          style="padding: 8rpx 12rpx"
          v-for="(item, index) in config.value"
          :key="index"
          @click="handlerPreview(index)"
        >
          <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
          <text>{{ item.name }}</text>
        </view>
      </view>
      <view class="form-container" v-else>
        <view class="upload-btn" @click="handlerFile" v-if="!props.renderOnly">
          <image class="upload-icon" src="/static/upload_icon.svg" mode="aspectFit" />
          <text class="upload-text">上传附件文件</text>
        </view>
        <view class="limit-text">附件限制：最多{{ config.maxCount }}个，单个不超过10M</view>
        <view class="form-lists" v-for="(name, index) in uploadedNames" :key="index">
          <view class="list-start">
            <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
            <text class="file-name">{{ name }}</text>
          </view>
          <view class="list-end">
            <image src="/static/eye.svg" alt="查看" @click="handlerPreview(index)" class="suffix-eye" />
            <image src="/static/download.svg" alt="附件" @click="handlerDownload(index)" class="suffix-download" />
          </view>
        </view>
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    <input hidden :name="`COMP_SECRET_ATTACHMENT___${props.formItem.sequence}`" :value="uploadedValues" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { BASE_URL } from '@/constants/common'
import store from '@/store'
import { makeToast } from '@/utils/toast'
import type { StoreState } from '@/store/types'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'SecretAttachment',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const toast = makeToast()
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

const handlerDownload = (index: number): void => {
  let attachmentId: string = props.renderOnly ? config.value.value[index].url : uploadedValues.value.split(',')[index]
  uni.request({
    url: `${BASE_URL}/api/v1/dl_approval/file/download/proxy/${attachmentId}`,
    method: 'GET',
    responseType: 'arraybuffer',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
    },
    success: (res) => {
      console.log('download_buffer', res)
      toast.info('下载文件开发中')
      // const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
      // const blobUrl = 'data:image/png;base64,' + base64
      // if (!blobUrl) return
      // uni.previewImage({
      //   urls: [blobUrl]
      // })
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
    fileNames = formValues.map((url) => {
      const match = url.match(/_(.+)$/)
      const result = match ? match[1] : ''
      return {
        url,
        name: result
      }
    })
  }
  formRulesUtil.depRules({
    name: `COMP_SECRET_ATTACHMENT___${props.formItem.sequence}`,
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
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    maxCount: parseInt(maxCount),
    required: required,
    value: fileNames
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_attachment.scss';
</style>
