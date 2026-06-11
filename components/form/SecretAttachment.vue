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
        <view class="detail-lists" style="padding: 8rpx 12rpx" v-for="(item, index) in config.value" :key="index">
          <view class="list-start">
            <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
            <text class="file-name">{{ item.name }}</text>
          </view>
          <view class="list-end">
            <image src="/static/eye.svg" alt="查看" @click="handlerPreview(index)" class="suffix-eye" />
            <image src="/static/download.svg" alt="附件" @click="handlerDownload(index)" class="suffix-download" />
          </view>
        </view>
      </view>
      <view class="form-container" v-else>
        <view class="upload-btn" @click="openPopup">
          <image class="upload-icon" src="/static/upload_icon.svg" mode="aspectFit" />
          <text class="upload-text">上传附件文件</text>
        </view>
        <view class="limit-text">附件限制：最多{{ config.maxCount }}个，单个不超过10M</view>
        <view class="form-lists" v-for="(name, index) in uploadedNames" :key="index">
          <view class="list-start">
            <image src="/static/attachment.svg" alt="附件" class="attachment-svg" />
            <text class="file-name">{{ name }}</text>
          </view>
          <view class="list-end" v-if="!props.isReview">
            <image src="/static/eye.svg" alt="查看" @click="handlerPreview(index)" class="suffix-eye" />
            <image src="/static/download.svg" alt="附件" @click="handlerDownload(index)" class="suffix-download" />
            <image
              src="/static/delete.svg"
              v-if="!props.renderOnly"
              alt="删除"
              @click="handlerDelete(index)"
              class="suffix-delete"
            />
          </view>
        </view>
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    <input hidden :name="`COMP_SECRET_ATTACHMENT___${props.formItem.sequence}`" :value="uploadedValues" />
  </view>
  <ImagePreview ref="imagePreview" :blobData="blobURL" />
  <ui-popup
    ref="popupRef"
    type="bottom"
    style="z-index: 9999"
    background-color="#fff"
    border-radius="10px 10px 0 0"
    :mask-closable="true"
  >
    <view class="popup-content" :style="{ height: 230 + 'px' }">
      <view class="item" @click="chooseFileType('album')">照片图库</view>
      <view class="item" @click="chooseFileType('camera')">拍照</view>
      <view class="item" @click="chooseFileType('system')">选取文件</view>
    </view>
  </ui-popup>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import store from '@/store'
import { makeToast } from '@/utils/toast'
import type { StoreState } from '@/store/types'
import { formRulesUtil } from '@/pages/form/utils/rules'
import ImagePreview from '@/components/ImagePreview.vue'

export interface FormConfig {
  placeholder: string
  showFieldDesc: boolean
  desc: string
  showTitle: boolean
  maxCount: number
  required: boolean
  value: { url: string; name: string }[]
}

defineOptions({
  name: 'SecretAttachment',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
  isReview?: boolean
}>()

const fileType = ref<'album' | 'camera' | 'system'>('album')
const popupRef = ref()
const imagePreview = ref<InstanceType<typeof ImagePreview>>()
const blobURL = ref<string>('')
const config = ref<FormConfig>({
  placeholder: '',
  showTitle: false,
  required: false,
  showFieldDesc: false,
  desc: '',
  maxCount: 5,
  value: []
})
const toast = makeToast()
const uploadedNames = ref<string[]>([])
const uploadedValues = ref<string>('')

const handlerPreview = (index: number): void => {
  let attachmentId: string = props.renderOnly ? config.value.value[index].url : uploadedValues.value.split(',')[index]
  const suffix = attachmentId.split('.').pop()
  if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg') {
    uni.request({
      url: `${process.env.BASE_URL}/api/v1/dl_approval/file/preview/proxy/${attachmentId}`,
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
          handlerDownload(index)
        }
      }
    })
  } else {
    handlerDownload(index)
  }
}

const handlerDownload = (index: number): void => {
  toast.loading('正在下载...')
  let attachmentId: string = props.renderOnly ? config.value.value[index].url : uploadedValues.value.split(',')[index]
  const suffix = attachmentId.split('.').pop()
  uni.downloadFile({
    url: `${process.env.BASE_URL}/api/v1/dl_approval/file/download/proxy/${attachmentId}`,
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

const handlerDelete = (index: number): void => {
  uploadedNames.value.splice(index, 1)
  const lists = uploadedValues.value.split(',')
  lists.splice(index, 1)
  uploadedValues.value = lists.join(',')
}

const openPopup = (): void => {
  popupRef?.value?.open()
}

const chooseFileType = (type: 'album' | 'camera' | 'system'): void => {
  fileType.value = type
  popupRef?.value?.close()
  handlerFile()
}

const uploadFile = (path: string): void => {
  uni.uploadFile({
    url: `${process.env.BASE_URL}/api/v1/dl_approval/file/upload`,
    filePath: path,
    name: 'file',
    header: {
      Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
    },
    formData: {
      is_secret: 'true'
    },
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
    },
    complete: () => {
      toast.hiddenLoading()
    }
  })
}

const handlerFile = (): void => {
  if (props.isReview) {
    return
  }
  if (uploadedNames.value.length >= config.value.maxCount) {
    uni.showToast({
      title: `最多只能上传${config.value.maxCount}个附件`,
      icon: 'error'
    })
    return
  }
  if (fileType.value === 'system') {
    // #ifdef MP-LARK
    tt.filePicker({
      maxNum: 1,
      pickerTitle: 'Select a file',
      pickerConfirm: 'Confirm',
      isSystem: true,
      success(res) {
        toast.loading('上传中...')
        console.log(JSON.stringify(res))
        const tempFilePath = res.list[0].path
        uploadFile(tempFilePath)
      },
      fail(res) {
        console.log(`filePicker fail: ${JSON.stringify(res)}`)
      }
    })
    // #endif
  } else {
    uni.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [fileType.value], // 从相册选择
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
        const tempFilePath = tempFilePaths[0]
        toast.loading('上传中...')
        uploadFile(tempFilePath)
      }
    })
  }
}

const getConfig = (type: string): FormConfig => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const maxCount = (props.formItem.values.find((item) => item.name === '上传数量限制')?.value as string) || '5'
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const formValues = (titleItem?.form_values as string[]) ?? []
  let fileNames: { url: string; name: string }[] = []
  if (props.renderOnly || type === 'edit' || type === 'resubmit' || type === 'invalid' || type === 'modify') {
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
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    maxCount: parseInt(maxCount),
    required: required,
    value: fileNames
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig(type!.value)
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    console.log('edit', config.value)
    config.value.value.forEach((item) => {
      uploadedNames.value.push(item.name)
      uploadedValues.value = (uploadedValues.value ? uploadedValues.value + ',' : '') + item.url
    })
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_attachment.scss';
.popup-content {
  padding-top: 32rpx;
  .item {
    color: rgba(16, 20, 28, 1);
    font-size: 28rpx;
    height: 100rpx;
    text-align: center;
    line-height: 100rpx;
    border-bottom: 1px solid rgba(229, 230, 235, 0.4);
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
