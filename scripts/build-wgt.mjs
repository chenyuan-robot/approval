// 命令行一键出 wgt 包（测试版 / 正式版）。
// 用法：node scripts/build-wgt.mjs <test|prod>
//   （一般通过 npm run build:wgt:test / npm run build:wgt:prod 调用）
//
// 流程：
//   1. 设定 UNI_WGT_ENV，让 vite.config.ts 注入对应环境的后端地址
//   2. 调 uni CLI 编译 app 平台资源
//   3. 把产物目录打成 .wgt（zip，manifest.json 位于压缩包根目录）
//
// 依赖：需先 npm install（要有 @dcloudio/vite-plugin-uni）；系统需有 zip 命令（macOS / Linux 自带）。
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const env = process.argv[2]
if (env !== 'test' && env !== 'prod') {
  console.error('用法: node scripts/build-wgt.mjs <test|prod>')
  process.exit(1)
}

const OUTPUT_DIR = path.join(ROOT, 'unpackage/dist/build/app-plus')

// 1 + 2：编译 app 平台
console.log(`\n[wgt] 开始编译 App 资源（环境：${env}）...\n`)
const build = spawnSync('npx', ['uni', 'build', '-p', 'app'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    UNI_WGT_ENV: env,
    UNI_OUTPUT_DIR: OUTPUT_DIR
  }
})
if (build.status !== 0) {
  console.error('\n[wgt] 编译失败。')
  process.exit(build.status ?? 1)
}

if (!fs.existsSync(path.join(OUTPUT_DIR, 'manifest.json'))) {
  console.error(`\n[wgt] 未找到产物 ${OUTPUT_DIR}/manifest.json，无法打包。`)
  process.exit(1)
}

// 3：打成 .wgt
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf-8'))
const appid = manifest.appid || 'app'
const releaseDir = path.join(ROOT, 'unpackage/release/wgt')
fs.mkdirSync(releaseDir, { recursive: true })

const wgtName = `${appid}_${env}.wgt`
const wgtPath = path.join(releaseDir, wgtName)
fs.rmSync(wgtPath, { force: true })

// zip 压缩包根目录必须直接是 manifest.json，所以 cwd 进产物目录、打包 "."
const zip = spawnSync('zip', ['-r', '-q', wgtPath, '.'], {
  cwd: OUTPUT_DIR,
  stdio: 'inherit'
})
if (zip.status !== 0) {
  console.error('\n[wgt] zip 打包失败（请确认系统已安装 zip 命令）。')
  process.exit(zip.status ?? 1)
}

console.log(`\n✔ wgt 打包完成：${path.relative(ROOT, wgtPath)}`)
console.log(`  环境：${env}　版本：${manifest.versionName}(${manifest.versionCode})`)
