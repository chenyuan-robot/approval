<template>
  <ui-popup ref="popup" type="center" background-color="#fff" border-radius="10px 10px 10px 10px" :mask-closable="true">
    <view class="popup-content">
      <image class="search-icon" :src="props.blobData" mode="aspectFit" />
    </view>
  </ui-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
defineOptions({
  name: 'ImagePreview'
})

const props = defineProps({
  blobData: { type: String, default: '', required: false }
})

const popup = ref()

const open = () => {
  popup.value?.open()
}

const close = () => {
  popup.value?.close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.popup-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
</style>
