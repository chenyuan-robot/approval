<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="handleOpenPanel">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <input
          placeholder-style="color: #86909C; font-size: 28rpx;"
          :name="`COMP_CITY___${props.formItem.sequence}`"
          class="component-style"
          style="height: 80rpx; pointer-events: none"
          disabled="true"
          :placeholder="config.placeholder"
          :value="selectedValue"
        />
        <image
          class="suffix-icon"
          :src="`${selectedValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import type { ProvinceCityAreaItem } from '@/apis/typings/form'
import { getProvinceCityAreaList } from '@/apis/modules/form'
import { formRulesUtil } from '@/pages/form/utils/rules'
import { uniq } from 'lodash'

interface Item extends ProvinceCityAreaItem {
  checked: boolean
}

defineOptions({
  name: 'City',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const page = {
  page: 1,
  page_size: 50
}
const isLimited = ref(false)
const limitedValue = ref<string[]>([])
const popupRef = ref()
const provinceList = ref<Item[]>([])
const cityList = ref<Item[]>([])
const areaList = ref<Item[]>([])
const provinceSelected = ref<Item | null>(null)
const citySelected = ref<Item | null>(null)
const selectedValue = ref<string>('')
const selectedLists = ref<string[]>([])
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200

const handleClear = () => {
  if (selectedValue.value) {
    selectedLists.value = []
    selectedValue.value = ''
    cityList.value.forEach((city) => {
      city.checked = false
    })
    areaList.value.forEach((area) => {
      area.checked = false
    })
  }
}
const handleOpenPanel = () => {
  console.log(config.value.single)
  if (props.renderOnly) return
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
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const single = selectionMode === '单项'
  const formValues = (titleItem?.form_values as string[]) ?? []
  formRulesUtil.depRules({
    name: `COMP_CITY___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择内容',
    showFieldDesc: showFieldDesc,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    single,
    required,
    value: single ? formValues?.join('/') : formValues?.join(', ')
  }
})

const getCityList = async (province: string) => {
  const res_city = await getProvinceCityAreaList({
    ...page,
    level: 2,
    province
  })
  if (isLimited.value) {
    const result = limitedValue.value.filter(
      (item: string) => item.split('/')?.[0] === province && !item.split('/')?.[1]
    )
    if (result.length === 1) {
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
    } else {
      const cities = uniq(
        limitedValue.value
          .filter((item: string) => item.split('/')?.[0] === province)
          .map((item: string) => item.split('/')?.[1])
      )
      const lists = res_city.data?.city_levels
        ?.filter((item) => cities.includes(item.city))
        ?.map((item) => ({
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
    }
  } else {
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
  }
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
  if (isLimited.value) {
    const datas = limitedValue.value.filter(
      (item: string) => item.split('/')?.[0] === province && !item.split('/')?.[1]
    )
    const result = limitedValue.value.filter(
      (item: string) => item.split('/')?.[0] === province && item.split('/')?.[1] === city && !item.split('/')?.[2]
    )
    if (result.length === 1 || datas.length === 1) {
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
    } else {
      const areas = uniq(
        limitedValue.value
          .filter((item: string) => item.split('/')?.[0] === province && item.split('/')?.[1] === city)
          .map((item: string) => item.split('/')?.[2])
      )
      const lists = res_area.data?.city_levels
        ?.filter((item) => areas.includes(item.county))
        ?.map((item) => ({
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
  } else {
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
}

onMounted(async () => {
  const selectionRange = props.formItem.values.find((item) => item.name === '选择范围')
  const value = selectionRange?.value as string
  isLimited.value = value === '部分'
  const specific_value = selectionRange?.specific_value ?? []
  limitedValue.value = specific_value
  const limitProvinces = uniq(specific_value.map((item: string) => item.split('/')?.[0]))
  // 获取省市区列表
  const res_province = await getProvinceCityAreaList({
    ...page,
    level: 1
  })
  if (isLimited.value) {
    provinceList.value = res_province.data?.city_levels
      ?.filter((item) => limitProvinces.includes(item.province))
      ?.map((item) => ({
        ...item,
        checked: false
      })) as Item[]
  } else {
    provinceList.value = res_province.data?.city_levels?.map((item) => ({
      ...item,
      checked: false
    })) as Item[]
  }
  provinceSelected.value = provinceList.value[0]
  if (provinceSelected.value) {
    await getCityList(provinceList.value[0]?.province || '')
    // console.log('省市区列表：', provinceList.value)
  }
})
</script>

<style lang="scss" scoped>
@import './../../styles/common_select.scss';
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
</style>
