# 职业信用管理平台 - 设计指南

## 1. 品牌定位

**应用定位**：职业信用管理平台，帮助用户建立、维护和展示个人职业信用
**设计风格**：专业、稳重、可信、现代
**目标用户**：职场人士、求职者、HR、招聘机构
**核心价值**：可信、专业、便捷

## 2. 配色方案

### 主色板

**主色（Primary）**：深蓝色系 - 传递专业与信任
- 主色：`#1e40af` (blue-800) - 主要按钮、重要信息
- 深主色：`#1e3a8a` (blue-900) - 按钮悬停状态
- 浅主色：`#3b82f6` (blue-500) - 链接、次要按钮

**辅色（Accent）**：金色系 - 传递价值与成就
- 金色：`#d97706` (amber-600) - 评分、成就徽章、重要数据
- 深金色：`#b45309` (amber-700) - 按钮悬停状态

### 中性色

**灰度色阶**
- 标题文字：`#111827` (gray-900)
- 正文文字：`#374151` (gray-700)
- 次要文字：`#6b7280` (gray-500)
- 占位符：`#9ca3af` (gray-400)
- 分割线：`#e5e7eb` (gray-200)
- 背景色：`#f9fafb` (gray-50)

### 语义色

**成功（Success）**：`#10b981` (emerald-500)
- 高信用分、认证通过、操作成功

**警告（Warning）**：`#f59e0b` (amber-500)
- 中等信用分、待审核状态

**错误（Error）**：`#ef4444` (red-500)
- 低信用分、认证失败、错误提示

**信息（Info）**：`#3b82f6` (blue-500)
- 提示信息、链接

## 3. 字体规范

### 字号层级

- **H1 页面标题**：`text-2xl` (24px) - `font-bold`
- **H2 区块标题**：`text-xl` (20px) - `font-semibold`
- **H3 卡片标题**：`text-lg` (18px) - `font-semibold`
- **Body 正文**：`text-base` (16px) - `font-normal`
- **Caption 说明文字**：`text-sm` (14px) - `font-normal`
- **Small 辅助文字**：`text-xs` (12px) - `font-normal`

### 字重使用

- **Bold (700)**：页面标题、重要数据
- **Semibold (600)**：区块标题、卡片标题
- **Medium (500)**：按钮文字、强调内容
- **Normal (400)**：正文、说明文字

## 4. 间距系统

### 页面边距

- 页面容器：`p-4` (16px)
- 内容区域：`px-4` (16px)

### 组件间距

- 卡片之间：`gap-4` (16px)
- 列表项之间：`gap-3` (12px)
- 表单项之间：`gap-4` (16px)
- 按钮组之间：`gap-3` (12px)

### 卡片内边距

- 大卡片：`p-6` (24px)
- 标准卡片：`p-4` (16px)
- 小卡片：`p-3` (12px)

## 5. 组件使用原则

**强制规则**：
- 所有通用 UI 组件（Button、Input、Card、Dialog、Toast、Tabs 等）优先从 `@/components/ui/*` 导入
- 禁止用 View/Text + Tailwind 手搓通用组件
- 页面实现前必须先判断需要的 UI 单元，并优先映射到组件库

### 常用组件选型

| 场景 | 组件 | 来源 |
|------|------|------|
| 主要操作 | Button | `@/components/ui/button` |
| 文本输入 | Input | `@/components/ui/input` |
| 多行输入 | Textarea | `@/components/ui/textarea` |
| 信息卡片 | Card | `@/components/ui/card` |
| 状态标签 | Badge | `@/components/ui/badge` |
| 分段切换 | Tabs | `@/components/ui/tabs` |
| 弹窗确认 | Dialog | `@/components/ui/dialog` |
| 轻提示 | Toast | `@/components/ui/toast` |
| 进度展示 | Progress | `@/components/ui/progress` |
| 评分展示 | 自定义圆形仪表盘 | 使用 Canvas 或自定义组件 |

## 6. 导航结构

### TabBar 配置

```typescript
tabBar: {
  color: '#9ca3af',
  selectedColor: '#1e40af',
  backgroundColor: '#ffffff',
  borderStyle: 'black',
  list: [
    {
      pagePath: 'pages/index/index',
      text: '首页',
      iconPath: './assets/tabbar/home.png',
      selectedIconPath: './assets/tabbar/home-active.png',
    },
    {
      pagePath: 'pages/report/index',
      text: '信用报告',
      iconPath: './assets/tabbar/file-text.png',
      selectedIconPath: './assets/tabbar/file-text-active.png',
    },
    {
      pagePath: 'pages/resume/index',
      text: '可信简历',
      iconPath: './assets/tabbar/user.png',
      selectedIconPath: './assets/tabbar/user-active.png',
    },
    {
      pagePath: 'pages/profile/index',
      text: '我的',
      iconPath: './assets/tabbar/user-circle.png',
      selectedIconPath: './assets/tabbar/user-circle-active.png',
    },
  ]
}
```

### 页面跳转规范

- TabBar 页面跳转：`Taro.switchTab()`
- 普通页面跳转：`Taro.navigateTo()`
- 关闭当前页面跳转：`Taro.redirectTo()`

## 7. 页面布局规范

### 首页布局

- 顶部：职业信用评分仪表盘（圆形）
- 中部：功能入口卡片（生成报告、可信简历、增信等）
- 底部：个人信息摘要

### 卡片样式

- 圆角：`rounded-xl` (12px)
- 阴影：`shadow-sm`
- 背景：`bg-white`
- 边框：`border border-gray-100`

### 状态展示

**空状态**：
- 使用 `@/components/ui/skeleton` 作为加载态
- 空数据展示友好的提示信息

**加载态**：
- 优先使用 `Skeleton` 组件
- 关键操作显示加载动画

## 8. 小程序约束

### 包体积

- 主包体积 ≤ 2MB
- 总包体积 ≤ 20MB

### 图片策略

- TabBar 图标使用 PNG 格式
- 使用 CLI 工具生成图标
- 图片资源放至 `src/assets/` 目录

### 性能优化

- 使用虚拟列表处理长列表
- 图片懒加载
- 分包加载

## 9. 特殊场景设计

### 信用评分展示

- 使用圆形仪表盘设计
- 颜色渐变：低分（红）→ 中（黄）→ 高（绿）
- 分值范围：300-850（参考信用评分标准）

### 报告生成流程

1. 点击查询按钮
2. 授权平台查询
3. 信息采集步骤（可跳过）
   - 身份学历
   - 职业资格
   - 诉讼记录
   - 投资任职
   - 金融信用
   - 黑名单
4. 生成报告

### 增信功能

- 提升信用分指引
- 自证工具操作指引
- 工作履历维护
