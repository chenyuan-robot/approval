<template>
  <view class="uni-form-component">
    <view class="component-label">
      <view class="field-desc">
        <text>{{ props.formItem.label }}</text>
        <text class="required" v-if="config.required">*</text>
      </view>
    </view>
    <view class="component-value" @click="handleOpenPanel">
      <!-- 城市单选 -->
      <input
        :name="`COMP_CITY___${props.formItem.sequence}`"
        class="component-style"
        disabled="true"
        :placeholder="config.placeholder"
        :value="selectedValue"
      />
      <!-- <picker class="component-style" v-if="config.single" mode="region">
        <view class="select-result">1234</view>
      </picker> -->
      <!-- 城市多选 -->
      <!-- <view v-else class="component-style"> 多选 </view> -->
    </view>
    <uni-popup
      ref="popupRef"
      type="bottom"
      style="z-index: 9999"
      background-color="#fff"
      border-radius="10px 10px 0 0"
      :mask-closable="true"
    >
      <view class="popup-content" :style="{ height: scrollHeight + 'px' }">
        <view class="tabs">
          <view class="tab-item">省份</view>
          <view class="tab-item">城市</view>
          <view class="tab-item">区县</view>
        </view>
        <scroll-view
          scroll-top="0"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          class="overlay-content-province"
          @click.stop
        >
          <view class="overlay-item" v-for="value in provinceList" :key="value.id" @click="handleProvinceItem(value)">
            {{ value.province }}
          </view>
        </scroll-view>
        <scroll-view
          scroll-top="0"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          class="overlay-content-city"
          @click.stop
        >
          <view class="overlay-item" v-for="value in cityList" :key="value.id" @click="handleCityItem(value)">
            <text>{{ value.city }}</text>
            <text class="check-icon" v-if="value.checked">√</text>
          </view>
        </scroll-view>
        <scroll-view
          scroll-top="0"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          class="overlay-content-area"
          @click.stop
        >
          <view class="overlay-item" v-for="value in areaList" :key="value.id" @click="handleAreaItem(value)">
            <text>{{ value.county }}</text>
            <text class="check-icon" v-if="value.checked">√</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import type { ProvinceCityAreaItem } from '@/apis/typings/form'
import { getProvinceCityAreaList } from '@/apis/modules/form'
import { formRulesUtil } from '@/pages/form/utils/rules'

interface Item extends ProvinceCityAreaItem {
  checked: boolean
}

defineOptions({
  name: 'City',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const page = {
  page: 1,
  page_size: 50
}
const popupRef = ref()
const provinceList = ref<Item[]>([])
const cityList = ref<Item[]>([])
const areaList = ref<Item[]>([])
const provinceSelected = ref<Item | null>(null)
const citySelected = ref<Item | null>(null)
const selectedValue = ref<string>('')
const selectedLists = ref<string[]>([])
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200

const handleOpenPanel = () => {
  console.log(config.value.single)
  popupRef?.value?.open()
}

const handleProvinceItem = async (item: Item) => {
  console.log('选择的省份：', item)
  provinceSelected.value = item
  await getCityList(item.province)
}

const handleCityItem = async (item: Item) => {
  console.log('选择的城市：', item)
  citySelected.value = item
  if (item.city === '暂不选择') {
    const value = provinceSelected.value?.province
    if (config.value.single) {
      selectedValue.value = value || ''
      popupRef?.value?.close()
    } else {
      const index = selectedLists.value.findIndex((item) => item === value)
      if (index > -1) {
        selectedLists.value.splice(index, 1)
      } else {
        selectedLists.value.push(value || '')
      }
      selectedValue.value = selectedLists.value.join(',')
      cityList.value.forEach((city) => {
        if (city.city === item.city) {
          city.checked = !city.checked
        }
      })
    }
    return
  }
  await getAreaList(item.province, item.city)
}

const handleAreaItem = async (item: Item) => {
  console.log('选择的区县：', item)
  if (item.county === '暂不选择') {
    if (config.value.single) {
      selectedValue.value = provinceSelected.value?.province + '/' + citySelected.value?.city
      popupRef?.value?.close()
    } else {
      const value = provinceSelected.value?.province + '/' + citySelected.value?.city
      const index = selectedLists.value.findIndex((item) => item === value)
      if (index > -1) {
        selectedLists.value.splice(index, 1)
      } else {
        selectedLists.value.push(value)
      }
      selectedValue.value = selectedLists.value.join(',')
      areaList.value.forEach((area) => {
        if (area.county === item.county) {
          area.checked = !area.checked
        }
      })
    }
    return
  }
  if (config.value.single) {
    selectedValue.value = provinceSelected.value?.province + '/' + citySelected.value?.city + '/' + item.county
    popupRef?.value?.close()
  } else {
    const value = provinceSelected.value?.province + '/' + citySelected.value?.city + '/' + item.county
    const index = selectedLists.value.findIndex((item) => item === value)
    if (index > -1) {
      selectedLists.value.splice(index, 1)
    } else {
      selectedLists.value.push(value)
    }
    selectedValue.value = selectedLists.value.join(',')
    areaList.value.forEach((area) => {
      if (area.county === item.county) {
        area.checked = !area.checked
      }
    })
  }
}

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  formRulesUtil.depRules({
    name: `COMP_CITY___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择${props.formItem.label}`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    single: selectionMode === '单项',
    required
  }
})

const getCityList = async (province: string) => {
  const res_city = await getProvinceCityAreaList({
    ...page,
    level: 2,
    province
  })
  const lists = res_city.data?.city_levels.map((item) => ({
    ...item,
    checked: false
  })) as Item[]
  cityList.value = [
    {
      id: 0,
      province: '',
      city: '暂不选择',
      county: '',
      checked: selectedLists.value.includes(province),
      code: '',
      country: '',
      level: 0
    }
  ].concat(lists)
  citySelected.value = cityList.value[1]
  await getAreaList(province, cityList.value[1]?.city || '')
}

const getAreaList = async (province: string, city: string) => {
  const res_area = await getProvinceCityAreaList({
    ...page,
    level: 3,
    province,
    city
  })
  const lists = res_area.data?.city_levels.map((item) => ({
    ...item,
    checked: selectedLists.value.includes(province + '/' + city + '/' + item.county)
  })) as Item[]
  areaList.value = [
    {
      id: 0,
      province: '',
      city: '',
      county: '暂不选择',
      checked: selectedLists.value.includes(province + '/' + city),
      code: '',
      country: '',
      level: 0
    }
  ].concat(lists)
}

onMounted(async () => {
  // 获取省市区列表
  const res_province = await getProvinceCityAreaList({
    ...page,
    level: 1
  })
  provinceList.value = res_province.data?.city_levels.map((item) => ({
    ...item,
    checked: false
  })) as Item[]
  provinceSelected.value = provinceList.value[0]
  if (provinceSelected.value) {
    await getCityList(provinceList.value[0]?.province || '')
    // console.log('省市区列表：', provinceList.value)
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .component-label {
    margin-left: 32rpx;
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
  .component-value {
    display: flex;
    align-items: center;
    margin-right: 32rpx;
    .component-style {
      pointer-events: none;
      width: 380rpx;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
      .select-result {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        box-sizing: border-box;
        color: #606266;
      }
    }
  }
  .popup-content {
    position: relative;
    background-color: #fff;
    width: 100%;
    .tabs {
      height: 39px;
      width: 100%;
      display: flex;
      border-bottom: 1px solid #f0f0f0;
      .tab-item {
        font-size: 28rpx;
        line-height: 40px;
        text-align: left;
        padding-left: 10rpx;
        width: 33.33%;
      }
    }
    .overlay-content-province {
      position: absolute;
      left: 0;
      top: 40px;
      height: calc(100% - 40px);
      width: 33.33%;
      border-right: 1px solid #f0f0f0;
    }
    .overlay-content-city {
      position: absolute;
      left: 33.33%;
      top: 40px;
      height: calc(100% - 40px);
      width: 33.33%;
      border-right: 1px solid #f0f0f0;
    }
    .overlay-content-area {
      position: absolute;
      left: 66.66%;
      top: 40px;
      height: calc(100% - 40px);
      width: 33.33%;
    }
    .overlay-item {
      padding: 10rpx;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
