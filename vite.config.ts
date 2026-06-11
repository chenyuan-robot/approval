import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import fs from 'node:fs'
import path from 'node:path'
import { ENV_CONFIG, SHARED_ENV, type WgtEnv } from './env/config'

/**
 * 解析「App / wgt」打包要用的环境（测试版 test / 正式版 prod）。
 * 优先级：
 *   1. 环境变量 UNI_WGT_ENV —— 命令行出包用（npm run build:wgt:test / :prod）
 *   2. env/active.json —— HBuilderX 图形界面出包用（npm run wgt:env:test / :prod 写入）
 *   3. 默认 test
 */
function resolveWgtEnv(): WgtEnv {
  const fromEnv = process.env.UNI_WGT_ENV
  if (fromEnv === 'test' || fromEnv === 'prod') return fromEnv
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'env/active.json'), 'utf-8')
    const env = JSON.parse(raw).env
    if (env === 'test' || env === 'prod') return env
  } catch {
    // 读不到就用默认值
  }
  return 'test'
}

/**
 * 只在「App / wgt」打包时，把环境变量编译进 process.env.*。
 *
 * 原因：HBuilderX 制作 wgt 包的菜单不会执行 package.json 里的自定义条件编译脚本，
 * 所以 process.env.BASE_URL 等不会被注入，App 运行时读到未替换的 process.env.* 会直接报错。
 * 这里统一在编译期用 define 补齐。
 *
 * h5 / mp-lark 不在此处理（return {}），完全保留原有的自定义脚本注入逻辑，互不干扰。
 */
function buildEnvDefine(): Record<string, string> {
  const platform = process.env.UNI_PLATFORM
  const isApp = platform === 'app' || platform === 'app-plus'
  if (!isApp) return {}

  const wgtEnv = resolveWgtEnv()
  const values: Record<string, string> = {
    ...SHARED_ENV,
    ...ENV_CONFIG[wgtEnv],
    ENV_TYPE: wgtEnv
  }

  const define: Record<string, string> = {}
  for (const [key, val] of Object.entries(values)) {
    // 若已有外部注入（极少数走 App 自定义脚本的情况），以外部为准
    if (process.env[key] === undefined) {
      define[`process.env.${key}`] = JSON.stringify(val)
    }
  }
  // 方便排查：构建日志里能看到本次 wgt 用的是哪个环境
  console.log(`[wgt] App 打包环境：${wgtEnv}（${ENV_CONFIG[wgtEnv].BASE_URL}）`)
  return define
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  define: buildEnvDefine(),
  server: {
    port: 5173
  }
})
