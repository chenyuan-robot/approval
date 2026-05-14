<template>
  <view class="uni-form-component">
    <view class="header">
      <view class="component-label">
        <view class="field-desc">
          <text>{{ props.formItem.label }}</text>
          <text class="required" v-if="config.required">*</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <view class="upload-btn" @click="handlerFile">
        <view class="upload-icon">+</view>
        <text class="upload-text">添加附件</text>
      </view>
    </view>
    <view class="content">
      <text class="tips-text">附件限制：最多{{ config.maxCount }}个，单个不超过10M</text>
      <view class="tips-text" cl v-for="(name, index) in uploadedNames" :key="index">{{ name }}</view>
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
}>()

const uploadedNames = ref<string[]>([])
const uploadedValues = ref<string>('')

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
            uni.request({
              url: `${BASE_URL}/api/v1/dl_approval/file/preview/${url}`,
              method: 'GET',
              responseType: 'arraybuffer',
              header: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
              },
              success: () => {
                // const base64 = uni.arrayBufferToBase64(res.data as ArrayBuffer)
                // blobURL.value = 'data:image/png;base64,' + base64
              }
            })
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
    required: required
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  width: calc(100% - 64rpx);
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-left: 32rpx;
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
      font-size: 24rpx;
      color: #606266;
    }
  }
}
</style>
