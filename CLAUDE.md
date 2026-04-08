# 职信通 (zhixintong) — CLAUDE.md

职业信用管理平台，基于 Taro + React + NestJS 构建。

## 项目结构

```
E:/claude/zhixintong/
├── src/                  # 前端 Taro 小程序
│   ├── pages/            # 页面（每个页面含 index.tsx + index.config.ts）
│   ├── components/ui/    # shadcn 风格 UI 组件库
│   ├── stores/user.ts    # Zustand 全局状态（含 persist）
│   ├── network.ts        # 网络请求封装
│   └── app.config.ts     # 路由与 tabBar 配置
└── server/src/modules/   # NestJS 后端模块
    ├── auth/             # 登录注册、logout
    ├── credit/           # 信用评分
    ├── report/           # 信用报告
    ├── resume/           # 可信简历
    └── enhancement/      # 提升信用
```

## 技术栈

- **前端**：Taro 4.1.9 + React 18 + TypeScript
- **样式**：Tailwind CSS v4 + weapp-tailwindcss（跨端兼容）
- **状态**：Zustand v5 + persist（Taro Storage adapter）
- **图标**：lucide-react-taro
- **后端**：NestJS，纯内存 Map 存储（无数据库）
- **平台**：H5（开发调试）+ 微信小程序 + 抖音小程序

## 开发命令

```bash
pnpm dev          # 同时启动前端(H5) + 后端
pnpm dev:web      # 仅前端 H5，访问 http://localhost:10086
pnpm dev:server   # 仅后端，端口 3000
pnpm dev:weapp    # 微信小程序 watch
```

H5 开发时 `/api` 请求通过 webpack devServer proxy 转发到 `localhost:3000`。

## 页面路由

| 路径 | 说明 | 类型 |
|------|------|------|
| `/pages/index/index` | 首页（信用评分） | tabBar |
| `/pages/report/index` | 信用报告 | tabBar |
| `/pages/resume/index` | 可信简历 | tabBar |
| `/pages/profile/index` | 我的 | tabBar |
| `/pages/login/index` | 登录 | 普通页 |
| `/pages/payment/index` | 支付页 | 普通页 |
| `/pages/authorize/index` | 授权页 | 普通页 |
| `/pages/report-form/index` | 信息填写 | 普通页 |
| `/pages/sample-report/index` | 样例报告 | 普通页 |
| `/pages/enhancement/index` | 提升信用 | 普通页 |
| `/pages/credit-repair/index` | 信用修复 | 普通页 |
| `/pages/resume-edit/index` | 简历编辑 | 普通页 |
| `/pages/work-history/index` | 工作履历 | 普通页 |

**新增页面必须同时在 `src/app.config.ts` 的 `pages` 数组中注册。**

## 关键约定

### 页面跳转
- tabBar 页面用 `Taro.switchTab()`，普通页面用 `Taro.navigateTo()`
- tabBar 页面用 `useDidShow` 而非 `useEffect` 监听返回刷新

### UI 组件
- 通用组件优先从 `@/components/ui/*` 导入（Button、Card、Badge、Progress 等）
- 禁止用 View/Text 手写已有的通用组件

### 样式
- 使用 Tailwind 类名，颜色参考 `design_guidelines.md`
- 主色：`blue-500/600`，背景：`gray-50`，卡片：`bg-white rounded-xl`

### 后端数据
- 所有数据存在内存 Map 中，**每次登录和退出登录均会清空该用户的报告、信用评分、可信简历数据**（方便演示重置）
- 后端无持久化，服务重启数据清空
- 登录/退出同时调用 `reportService.clearUserData`、`creditService.clearUserData`、`resumeService.clearUserData`

### 信用评分维度（6个）
真实性 / 稳定性 / 合规性 / 安全性 / 专业性 / 可靠性

## 用户状态流转（演示流程）

新用户登录后所有数据为空，需按顺序操作：

1. **首页**：无信用评分（显示 `-`），CTA 按钮跳转至信用报告页
2. **信用报告页**：生成报告后，信用评分写入（650分），首页评分显示
3. **可信简历页**：生成报告后点击"更新可信简历"才会填充简历数据，否则显示空状态
4. **提升信用页**：个性化增信建议在生成报告后出现，其他模块始终可见

## 支付流程

```
首页/报告页 → 支付页(?price=50&type=create) → 授权页 → 信息填写 → 信用报告页
                                              (?price=9.9&type=update) → 返回报告页
```

## 弹窗实现注意事项

- **全屏弹窗**：外层用 `fixed inset-0 flex flex-col`，内层用 `flex-1 flex flex-col overflow-hidden`，**不要用 `height: 100vh`**（移动端浏览器地址栏会导致按钮被遮挡）
- 弹窗内滚动区用 `flex-1 overflow-y-auto`，底部按钮用 `flex-shrink-0` 固定在底部
- Taro 页面 config 修改（如 navigationBarTitleText）需完整重启 `pnpm dev` 才能生效，HMR 不会热更新 config

## 设计规范 - 字体要求（Figma push 必须遵守）

**所有推送到 Figma 的界面，文字必须使用 `Noto Sans SC`，禁止使用 Inter、Roboto 等默认字体。**

> `Noto Sans SC` 是 Source Han Sans SC 的 Google 版本，字形完全一致，是该 Figma 文件中实际可用的字体名。

### Figma Plugin API 标准写法

每次 push 脚本**开头**必须加载：

```js
await figma.loadFontAsync({ family: 'Noto Sans SC', style: 'Regular' })
await figma.loadFontAsync({ family: 'Noto Sans SC', style: 'Medium' })
await figma.loadFontAsync({ family: 'Noto Sans SC', style: 'Bold' })
```


字重映射：

| 用途 | 禁止 | 必须使用 |
|------|------|----------|
| 正文 / 说明文字 | `Inter Regular` | `{ family: 'Noto Sans SC', style: 'Regular' }` |
| 次级标题 / 强调 | `Inter Semi Bold` | `{ family: 'Noto Sans SC', style: 'Medium' }` |
| 主标题 / 粗体 | `Inter Bold` | `{ family: 'Noto Sans SC', style: 'Bold' }` |

可用字重完整列表：Thin / Light / DemiLight / Regular / Medium / Bold / Black

## Figma 图标规范（push 到画布必须遵守）

**每次将代码 push 到 Figma 画布时，必须用 SVG vector 路径完整绘制图标，严禁用纯色色块（Ellipse / Rectangle）替代。**

代码使用 `lucide-react-taro` 图标，push 时用以下方式实现：

```js
// 创建图标 vector（stroke-only，无 fill）
const v = figma.createVector();
v.vectorPaths = [{ windingRule: 'NONZERO', data: scaledPathData }];
v.fills = [];
v.strokes = [{ type: 'SOLID', color: iconColor }];
v.strokeWeight = 1.5;  // 按目标尺寸调整，原始 24px 对应 2px
v.strokeCap = 'ROUND';
v.strokeJoin = 'ROUND';
```

路径按目标尺寸等比缩放（scale = targetSize / 24），缩放时 arc 参数中 x-rotation、large-arc-flag、sweep-flag 不缩放。

### 常用 Lucide 图标 SVG 路径（24×24 原始坐标）

| 图标 | 场景 | path data |
|------|------|-----------|
| FileText | 文件/报告标题、预览按钮 | `M14.5 2 H6 a2 2 0 0 0-2 2 v16 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 V7.5 Z M14 2 L14 8 L20 8 M16 13 H8 M16 17 H8 M10 9 H8` |
| CircleCheck | 已完成状态、勾选 | `M2 12 A10 10 0 1 0 22 12 A10 10 0 1 0 2 12 Z M9 12 l2 2 l4-4` |
| Download | 下载按钮 | `M21 15 v4 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 v-4 M7 10 L12 15 L17 10 M12 3 L12 15` |
| Share | 分享按钮 | `M4 12 v8 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 v-8 M16 6 L12 2 L8 6 M12 2 L12 15` |
| RotateCcw | 更新/重置 | `M3 12 a9 9 0 1 0 9-9 a9.75 9.75 0 0 0-6.74 2.74 L3 8 M3 3 v5 h5` |
| RefreshCw | 刷新/同步简历 | `M3 12 a9 9 0 0 1 9-9 a9.75 9.75 0 0 1 6.74 2.74 L21 8 M21 3 v5 h-5 M21 12 a9 9 0 0 1-9 9 a9.75 9.75 0 0 1-6.74-2.74 L3 16 M8 16 H3 v5` |
| Eye | 预览/查看样例 | `M2 12 C2 12 5 5 12 5 C19 5 22 12 22 12 C22 12 19 19 12 19 C5 19 2 12 2 12 Z M9 12 A3 3 0 1 0 15 12 A3 3 0 1 0 9 12 Z` |
| FileSearch | 搜索/暂无报告 | `M4 22 h14 a2 2 0 0 0 2-2 V7.5 L14.5 2 H6 a2 2 0 0 0-2 2 v3 M5 14 A4 4 0 1 0 13 14 A4 4 0 1 0 5 14 Z M15 17 L18 20` |
| ArrowRight | 跳转引导 | `M5 12 H19 M12 5 l7 7-7 7` |
| CircleAlert | 错误/失败状态 | `M2 12 A10 10 0 1 0 22 12 A10 10 0 1 0 2 12 Z M12 8 L12 12 M12 16 L12 16` |

## Figma

画布：`https://www.figma.com/design/2Rhdg900hQyX74xfbyDjtv/`

已在画布中完成的设计稿：
- `首页 - Home`（节点 24:2）
- `职业信用评分说明` 弹窗（节点 56:2）— 在首页内以内联弹窗实现，非独立页面
- `样例报告 - Sample Report`（节点 65:2）
- `提升信用 - Enhancement`（节点 83:2）
- `职业信用报告 - Report`（节点 239:2）
- `我的 - Profile`（节点 265:2）
