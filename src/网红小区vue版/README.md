# 网红小区 Vue 版

基于 Vue 3 + TypeScript + Pinia 的模块化重构版本。

## 📁 项目结构

```
src/网红小区vue版/
├── index.ts                          # 主入口文件（挂载 Vue 应用）
├── App.vue                           # 根组件
├── components/                       # 组件目录
│   ├── ToggleButton.vue             # 拖动按钮组件
│   ├── MainPanel.vue                # 主面板容器组件
│   ├── FloorView.vue                # 楼层视图组件
│   ├── RoomCard.vue                 # 房间卡片组件
│   ├── ManagementActions.vue        # 管理操作按钮组件
│   └── modals/                      # 模态框组件目录
│       ├── RoomModal.vue            # 房间详情模态框
│       ├── RecruitmentModal.vue     # 招募租客模态框
│       ├── RenovateModal.vue        # 装修选择模态框
│       └── FunctionalInputModal.vue # 功能性房间输入模态框
├── composables/                      # 组合式函数目录
│   ├── useDrag.ts                   # 拖动功能 Hook
│   ├── useMVUData.ts                # MVU 数据加载 Hook
│   ├── usePosition.ts               # 位置保存/恢复 Hook
│   └── useAutoRefresh.ts            # 自动刷新 Hook
├── stores/                           # Pinia 状态管理目录
│   ├── apartment.ts                 # 公寓数据 Store
│   ├── ui.ts                        # UI 状态 Store
│   └── settings.ts                  # 设置 Store
├── types/                            # TypeScript 类型定义目录
│   └── index.ts                     # ✅ 类型定义文件
├── styles/                           # 样式文件目录
│   ├── variables.css                # ✅ CSS 变量定义
│   ├── common.css                   # ✅ 通用样式
│   └── animations.css               # ✅ 动画样式
├── utils/                            # 工具函数目录
│   ├── mvuHelper.ts                 # ✅ MVU 数据处理工具
│   └── commandHelper.ts             # ✅ 命令填充工具
├── to_do.md                          # ✅ 任务清单
└── README.md                         # ✅ 项目说明（本文件）
```

## ✅ 已完成

### 阶段 1：基础架构搭建 ✅

- [x] **类型定义** (`types/index.ts`)
  - MVU 数据类型
  - 房间、楼层、租客类型
  - 拖动、位置数据类型
  - UI 状态类型
  - 全局类型声明

- [x] **工具函数** (`utils/`)
  - `mvuHelper.ts` - MVU 数据处理工具
    - `safeGetValue()` - 安全获取深层属性
    - `unwrapMVU()` - 解包 MVU 数组
    - `getMVUInstance()` - 获取 MVU 实例
    - `formatProgress()` - 格式化进度显示
  - `commandHelper.ts` - 命令填充工具
    - `fillCommand()` - 填充命令到输入框
    - `generateXxxCommand()` - 生成各类命令

- [x] **样式文件** (`styles/`)
  - `variables.css` - CSS 变量（颜色、间距、阴影等）
  - `animations.css` - 动画定义（旋转、淡入淡出等）
  - `common.css` - 通用样式（按钮、输入框、工具类等）

### 阶段 2：状态管理（Pinia Stores） ✅

- [x] **公寓数据 Store** (`stores/apartment.ts`)
  - 管理 MVU 原始数据
  - 提供楼层、房间、租客的 getters
  - 实现数据加载、刷新、重试逻辑
  - 统计信息（房间数、出租率等）

- [x] **UI 状态 Store** (`stores/ui.ts`)
  - 管理面板显示状态
  - 管理模态框状态
  - 管理当前选中房间
  - 提供打开/关闭各类模态框的方法

- [x] **设置 Store** (`stores/settings.ts`)
  - 管理自动刷新设置
  - localStorage 持久化
  - 提供设置导入/导出功能

### 阶段 3：组合式函数（Composables） ✅

- [x] **拖动功能** (`composables/useDrag.ts`)
  - 支持鼠标和触摸事件
  - 支持边界限制
  - 支持点击检测（移动距离 < 5px）
  - 提供拖动开始/移动/结束回调

- [x] **MVU 数据加载** (`composables/useMVUData.ts`)
  - 封装 Apartment Store 的数据访问
  - 提供响应式数据引用
  - 简化组件中的数据使用

- [x] **位置保存/恢复** (`composables/usePosition.ts`)
  - localStorage 持久化位置
  - 支持多个元素独立保存
  - 自动验证位置在视口内
  - 支持自动保存模式

- [x] **自动刷新** (`composables/useAutoRefresh.ts`)
  - 定时刷新逻辑
  - 与设置 Store 集成
  - 支持启动/停止/切换
  - 自动清理定时器

### 测试阶段：验证架构 ✅

- [x] **入口文件** (`index.ts`)
  - Vue 应用创建和挂载
  - 全局样式导入
  - 生命周期管理
  - 错误处理

- [x] **根组件** (`App.vue`)
  - 集成 ToggleButton 组件
  - 调试面板（开发时使用）
  - Stores 状态显示
  - 测试操作按钮

- [x] **ToggleButton 组件** (`components/ToggleButton.vue`)
  - 拖动功能集成
  - 位置保存/恢复
  - 点击检测（< 5px）
  - UI Store 集成

- [x] **构建测试**
  - ✅ Webpack 编译成功
  - ✅ 生成 `dist/网红小区vue版/index.js`
  - ✅ 生成 Source Map
  - ✅ 无编译错误

## 🎉 测试结果

### ✅ 编译成功

```
webpack 5.102.1 compiled successfully in 7533 ms
```

**生成文件：**
- `dist/网红小区vue版/index.js` - 压缩后的主文件
- `dist/网红小区vue版/index.js.map` - Source Map

**编译统计：**
- 模块数量：84.9 KiB
- Vue 组件：2 个（App.vue, ToggleButton.vue）
- 样式文件：已集成到 JS 中
- 无编译错误 ✅

### 🧪 测试功能

已实现的测试功能：
1. **拖动按钮** - 可拖动，位置保存
2. **点击检测** - 移动 < 5px 视为点击
3. **面板切换** - 点击按钮切换面板状态
4. **调试面板** - 显示 Stores 状态和测试按钮
5. **数据加载** - 测试 MVU 数据加载
6. **自动刷新** - 测试自动刷新开关

## 🚀 下一步

### 阶段 4：核心组件

- [ ] `components/MainPanel.vue` - 主面板
- [ ] `components/FloorView.vue` - 楼层视图
- [ ] `components/RoomCard.vue` - 房间卡片
- [ ] `components/ManagementActions.vue` - 管理操作

### 阶段 5：模态框组件

- [ ] `components/modals/RoomModal.vue` - 房间详情
- [ ] `components/modals/RecruitmentModal.vue` - 招募租客
- [ ] `components/modals/RenovateModal.vue` - 装修选择
- [ ] `components/modals/FunctionalInputModal.vue` - 功能性房间输入

### 阶段 6：根组件和入口

- [ ] `App.vue` - 根组件
- [ ] `index.ts` - 入口文件

## 🎯 技术栈

- **Vue 3** - 使用 Composition API
- **TypeScript** - 完整类型支持
- **Pinia** - 状态管理
- **VueUse** - 组合式工具库（自动导入）
- **CSS3** - 样式（支持 SCSS）

## 📚 开发规范

### 命名规范

- **组件文件**：PascalCase（如 `ToggleButton.vue`）
- **组合式函数**：use 前缀 + camelCase（如 `useDrag.ts`）
- **Store 文件**：camelCase（如 `apartment.ts`）
- **工具函数**：camelCase（如 `mvuHelper.ts`）
- **CSS 类名**：kebab-case，ngq 前缀（如 `.ngq-toggle-btn`）
- **CSS 变量**：kebab-case，apt 前缀（如 `--apt-primary`）

### 代码风格

- 使用 TypeScript 严格模式
- 优先使用 Composition API
- 组件使用 `<script setup>` 语法
- 样式使用 `<style scoped>`
- 添加 JSDoc 注释

### Git 提交规范

- `feat:` 新功能
- `fix:` 修复 bug
- `refactor:` 重构
- `style:` 样式调整
- `docs:` 文档更新
- `chore:` 构建/工具变动

## 🔧 开发命令

```bash
# 开发模式（带热重载）
npm run dev

# 生产构建
npm run build

# 类型检查
npm run type-check
```

## 📖 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [VueUse 文档](https://vueuse.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 📝 注意事项

1. **MVU 数据格式**：注意 MVU 框架的数组包装格式 `[value]`
2. **全局注入**：组件挂载到 `window.top.document.body`
3. **事件清理**：组件卸载时清理所有事件监听器
4. **位置保存**：使用 localStorage 持久化按钮和面板位置
5. **拖动检测**：移动距离 < 5px 视为点击，否则视为拖动

## 📄 License

MIT

