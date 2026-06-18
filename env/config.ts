/**
 * wgt 测试版 / 正式版 的环境配置（唯一数据源）。
 *
 * - 修改后端地址只改这里即可，vite.config.ts 会在「App / wgt」打包时把这些值
 *   编译进 process.env.*，HBuilderX 图形界面出包和命令行出包都会读取。
 * - h5 / mp-lark 的运行与发行仍然走 package.json 里的自定义条件编译脚本
 *   （lark-test / lark-prod / h5-dev），不受这里影响。
 */

export type WgtEnv = 'test' | 'prod'

/** 各环境独有的后端地址 */
export const ENV_CONFIG: Record<
  WgtEnv,
  { BASE_URL: string; DIGITAL_BASE_URL: string; NEW_BASE_URL: string; APP_ID: string; APP_SECRET: string }
> = {
  test: {
    BASE_URL: 'https://approval.softtest.cowarobot.com',
    DIGITAL_BASE_URL: 'https://digital.softtest.cowarobot.com',
    NEW_BASE_URL: 'https://newbasis.softtest.cowarobot.com',
    APP_ID: 'cli_aa896edfa6b91cc4',
    APP_SECRET: 'NTrZj7yEW9xlGFWspbavLe0w0L53hYNB',
  },
  prod: {
    BASE_URL: 'https://coowa.tech',
    DIGITAL_BASE_URL: 'https://callcenter.coowa.tech',
    NEW_BASE_URL: 'https://coowa.tech',
    APP_ID: 'cli_aaba54586e799cde',
    APP_SECRET: 'tetQpeOl3Pis1utOnnJq4fjLQPeesvFm',
  }
}

/** 测试版 / 正式版 共用、与环境无关的配置 */
export const SHARED_ENV: Record<string, string> = {
  TENANT_ABBR: 'coowa',
  REDIRECT_URI: 'http://172.16.115.41:5174/'
}
