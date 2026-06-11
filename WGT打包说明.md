# wgt 测试版 / 正式版 打包说明

本项目的 wgt 资源升级包支持「测试版（test）」和「正式版（prod）」两套后端地址，
两个版本 **appid、版本号完全一致，只有后端地址不同**：

| 环境 | BASE_URL | DIGITAL_BASE_URL | NEW_BASE_URL |
| --- | --- | --- | --- |
| test | approval.softtest | digital.softtest | newbasis.softtest |
| prod | approval.soft | digital.soft | newbasis.soft |

> 为什么不用 package.json 的自定义条件编译脚本来出 wgt？
> 因为 **HBuilderX「制作 wgt 包」的菜单不会执行 package.json 里的自定义脚本**，
> `process.env.BASE_URL` 等不会被注入，App 运行时会读到未替换的 `process.env.*` 直接报错。
> 所以本方案改为在 `vite.config.ts` 里、**仅针对 App 平台**做编译期注入，
> h5 / mp-lark 的运行发行完全不受影响。

## 改后端地址只改一处

所有地址都在 [env/config.ts](env/config.ts)，改完对两种出包方式都生效。

---

## 方式一：HBuilderX 图形界面出包（推荐日常用）

1. 切换环境（二选一）：
   ```bash
   npm run wgt:env:test   # 测试版
   npm run wgt:env:prod   # 正式版
   ```
   该命令只是把选择写进 [env/active.json](env/active.json)。
2. 在 HBuilderX 里：**发行 → 原生App-制作移动App资源升级包(wgt)**。
   构建日志里会打印 `[wgt] App 打包环境：xxx`，确认无误即可。

> `env/active.json` 只影响 App / wgt 打包，不影响 h5 / mp-lark 的日常开发，
> 切到 prod 后无需切回。

## 方式二：命令行一键出包（适合 CI / 自动化）

> 前置：先 `npm install`（需要 `@dcloudio/vite-plugin-uni`）；系统需有 `zip` 命令（macOS/Linux 自带）。

```bash
npm run build:wgt:test   # 出测试版 wgt
npm run build:wgt:prod   # 出正式版 wgt
```

产物：`unpackage/release/wgt/<appid>_<env>.wgt`，例如 `__UNI__301EBA1_prod.wgt`。

---

## 原理速记

- `vite.config.ts` 里 `buildEnvDefine()` 只在 `UNI_PLATFORM` 为 `app/app-plus` 时生效，
  把 `env/config.ts` 的值通过 Vite `define` 编译进 `process.env.*`。
- 环境来源优先级：`UNI_WGT_ENV`（命令行）> `env/active.json`（图形界面）> 默认 `test`。
- h5 / mp-lark 仍走 `package.json` 的 `uni-app.scripts`（lark-test / lark-prod / h5-dev），互不干扰。
