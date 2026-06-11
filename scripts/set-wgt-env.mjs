// 切换「HBuilderX 图形界面制作 wgt 包」要用的环境。
// 用法：node scripts/set-wgt-env.mjs <test|prod>
//   （一般通过 npm run wgt:env:test / npm run wgt:env:prod 调用）
//
// 它只是把选择写进 env/active.json；之后在 HBuilderX 里
// 「发行 → 原生App-制作移动App资源升级包(wgt)」即可，vite.config.ts 会读取该文件。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const env = process.argv[2]
if (env !== 'test' && env !== 'prod') {
  console.error('用法: node scripts/set-wgt-env.mjs <test|prod>')
  process.exit(1)
}

const file = path.resolve(__dirname, '../env/active.json')
fs.writeFileSync(file, JSON.stringify({ env }, null, 2) + '\n')

console.log(`✔ 已将 wgt 打包环境切换为：${env}`)
console.log('  下一步：在 HBuilderX 里「发行 → 原生App-制作移动App资源升级包(wgt)」。')
console.log('  （h5 / mp-lark 的运行发行不受影响，仍走 package.json 自定义脚本）')
