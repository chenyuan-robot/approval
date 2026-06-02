<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <!-- <view v-if="!props.renderOnly" class="toolbar-container">
        <scroll-view class="toolbar-scroll" scroll-x="true" show-scrollbar="false">
          <view class="toolbar-content">
            <view class="item" @click="format('bold')">
              <text class="iconfont icon-bold" :class="{'active': formats.bold}">B</text>
            </view>
            <view class="item" @click="format('italic')">
              <text class="iconfont icon-italic" :class="{'active': formats.italic}">I</text>
            </view>
            <view class="item" @click="format('header', 'H2')">
              <text :class="{'active': formats.header === 2}">H2</text>
            </view>
          </view>
        </scroll-view>
      </view> -->
      
      <rich-text v-if="props.renderOnly" :nodes="config.value"></rich-text>
      <editor 
        v-else
        id="editor"
        :name="`COMP_DESC_INPUT___${props.formItem.sequence}`"
        class="component-style"
        style="height: 80rpx; width: 100%; display: block;"
        placeholder-style="color: #86909C; font-size: 28rpx;"
        :value="config.defaultValue"
        :placeholder="config.placeholder"
        :maxlength="config.maxlength"
        @ready="onEditorReady"
        @statuschange="onStatusChange"
      ></editor>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
  

  
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

const htmlContent = ref('');
const formats = ref({});
let editorCtx = null;

const onEditorReady = () => {
  uni.createSelectorQuery().select('#editor').context((res) => {
    editorCtx = res.context;
    if (htmlContent.value) {
      editorCtx.setContents({ html: htmlContent.value });
    }
  }).exec();
};

const format = (name, value) => {
  if (!editorCtx) return;
  editorCtx.format(name, value);
};

// 监听样式变化（比如点击了加粗文字，工具栏对应的按钮要高亮）
const onStatusChange = (e) => {
  formats.value = e.detail;
};

const undo = () => {
  editorCtx.undo();
};

const removeFormat = () => {
  editorCtx.removeFormat();
};

// const toggleMode = () => {
//   if (isEditing.value) {
//     editorCtx.getContents({
//       success: (res) => {
//         htmlContent.value = res.html;
//         isEditing.value = false;
//       }
//     });
//   } else {
//     isEditing.value = true;
//   }
// };

const saveContent = () => {
  editorCtx.getContents({
    success: (res) => {
      console.log('即将传给 Tiptap 的 HTML:', res.html);
    }
  });
};





defineOptions({
  name: 'DescInput',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxlength = props.formItem.values.find((item) => item.name === '字符数限制')?.value as string
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  // 该表单项校验规则
  formRulesUtil.depRules({
    name: `COMP_SINGLE_INPUT___${props.formItem.sequence}`,
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
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[])?.[0] ?? '') : '',
    maxlength: Number(maxlength) || 1000,
    required: required,
    value: titleItem?.form_value ?? '-'
  }
})
</script>

<style lang="scss" scoped>
@import './../../styles/common_input.scss';

// .toolbar-container {
//   border: 1px solid #eee;
//   background: #fff;
//   position: sticky;
//   top: 0;
//   z-index: 999;
// }

// .toolbar-scroll {
//   width: 100%;
//   white-space: nowrap;
// }

// .toolbar-content {
//   display: flex;
//   padding: 10px;
// }

// .item {
//   display: inline-block;
//   padding: 5px 15px;
//   margin-right: 5px;
//   background: #f0f0f0;
//   border-radius: 4px;
//   font-size: 14px;
// }

// .active {
//   color: #007aff;
//   font-weight: bold;
// }

// .action-bar {
//   display: flex;
//   justify-content: space-between;
//   padding: 10px 0;
// }

// .ql-container {
//   width: 100%;
//   height: 500rpx;
//   border: 1px solid #ddd;
//   padding: 10px;
// }

// .preview-wrapper {
//   padding: 10px;
//   border: 1px dashed #ccc;
// }

</style>
