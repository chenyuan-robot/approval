import { createSSRApp } from 'vue'
import App from './App.vue'
import './uni.promisify.adaptor'
import store from './store'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import UiPopup from '@/components/ui/ui-popup/components/uni-popup/uni-popup.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import UiDataSelect from '@/components/ui/ui-data-select/components/uni-data-select/uni-data-select.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import StatusTag from '@/components/status-tag/status-tag.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.component('ui-popup', UiPopup)
  app.component('ui-data-select', UiDataSelect)
  app.component('status-tag', StatusTag)
  return {
    app
  }
}
