# 网红小区 Vue 版重构计划

## 📋 项目概述

将现有的 2174 行单文件 TypeScript 脚本重构为基于 Vue 3 + TypeScript + Pinia 的模块化架构。

---

## 🎯 重构目标

- ✅ 模块化代码结构，提高可维护性
- ✅ 使用 Vue 3 Composition API 替代原生 DOM 操作
- ✅ 使用 Pinia 进行状态管理，替代全局变量
- ✅ 组件化 UI，提高代码复用性
- ✅ 保持原有功能完整性
- ✅ 优化性能和用户体验

---

## 📁 文件结构规划

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
│   ├── ui.ts                        # UI 状态 Store（模态框、面板显示等）
│   └── settings.ts                  # 设置 Store（自动刷新等）
├── types/                            # TypeScript 类型定义目录
│   └── index.ts                     # 类型定义文件
├── styles/                           # 样式文件目录
│   ├── variables.css                # CSS 变量定义
│   ├── common.css                   # 通用样式
│   └── animations.css               # 动画样式
└── utils/                            # 工具函数目录
    ├── mvuHelper.ts                 # MVU 数据处理工具
    └── commandHelper.ts             # 命令填充工具
```

---

## 🔧 技术栈

- **Vue 3** - 使用 Composition API
- **TypeScript** - 完整类型支持
- **Pinia** - 状态管理
- **VueUse** - 组合式工具库（已配置自动导入）
- **SCSS** - 样式预处理器（可选）

---

## 📝 详细任务清单

### 阶段 1：基础架构搭建 (优先级：高)

- [ ] **1.1 创建项目结构**
  - [ ] 创建所有目录
  - [ ] 创建占位文件

- [ ] **1.2 类型定义** (`types/index.ts`)
  - [ ] 定义 MVU 数据类型
  - [ ] 定义房间类型
  - [ ] 定义楼层类型
  - [ ] 定义租客类型
  - [ ] 定义拖动数据类型
  - [ ] 定义位置数据类型

- [ ] **1.3 工具函数** (`utils/`)
  - [ ] `mvuHelper.ts` - 迁移 `safeGetValue` 函数
  - [ ] `commandHelper.ts` - 封装 `fillCommand` 函数

- [ ] **1.4 样式文件** (`styles/`)
  - [ ] `variables.css` - 提取 CSS 变量（:root 部分）
  - [ ] `common.css` - 提取通用样式
  - [ ] `animations.css` - 提取动画样式（@keyframes）

---

### 阶段 2：状态管理 (优先级：高)

- [ ] **2.1 公寓数据 Store** (`stores/apartment.ts`)
  - [ ] 定义 state：`mvuData`, `floors`, `rooms`, `tenants`
  - [ ] 定义 getters：计算楼层列表、房间列表等
  - [ ] 定义 actions：`loadData()`, `refreshData()`
  - [ ] 集成 MVU 数据加载逻辑

- [ ] **2.2 UI 状态 Store** (`stores/ui.ts`)
  - [ ] 定义 state：`isPanelVisible`, `activeModal`, `currentRoom`
  - [ ] 定义 actions：`openPanel()`, `closePanel()`, `openModal()`, `closeModal()`

- [ ] **2.3 设置 Store** (`stores/settings.ts`)
  - [ ] 定义 state：`autoRefreshEnabled`, `refreshInterval`
  - [ ] 定义 actions：`toggleAutoRefresh()`, `setRefreshInterval()`
  - [ ] 集成 localStorage 持久化

---

### 阶段 3：组合式函数 (优先级：高)

- [ ] **3.1 拖动功能** (`composables/useDrag.ts`)
  - [ ] 实现通用拖动逻辑
  - [ ] 支持鼠标和触摸事件
  - [ ] 支持边界限制
  - [ ] 支持点击检测（移动距离 < 5px）
  - [ ] 返回：`isDragging`, `position`, `startDrag`, `stopDrag`

- [ ] **3.2 MVU 数据加载** (`composables/useMVUData.ts`)
  - [ ] 封装 MVU 数据获取逻辑
  - [ ] 实现重试机制（最多 5 次）
  - [ ] 错误处理
  - [ ] 返回：`data`, `loading`, `error`, `retry`

- [ ] **3.3 位置保存/恢复** (`composables/usePosition.ts`)
  - [ ] 从 localStorage 读取位置
  - [ ] 保存位置到 localStorage
  - [ ] 验证位置是否在屏幕内
  - [ ] 返回：`position`, `savePosition`, `restorePosition`

- [ ] **3.4 自动刷新** (`composables/useAutoRefresh.ts`)
  - [ ] 实现定时刷新逻辑
  - [ ] 支持开关控制
  - [ ] 支持自定义间隔
  - [ ] 返回：`isEnabled`, `toggle`, `setInterval`

---

### 阶段 4：核心组件开发 (优先级：高)

- [ ] **4.1 拖动按钮** (`components/ToggleButton.vue`)
  - [ ] 使用 `useDrag` 实现拖动
  - [ ] 使用 `usePosition` 保存/恢复位置
  - [ ] 点击切换面板显示
  - [ ] 样式迁移（.ngq-toggle-btn）

- [ ] **4.2 主面板** (`components/MainPanel.vue`)
  - [ ] 使用 `useDrag` 实现拖动（仅头部可拖动）
  - [ ] 使用 `usePosition` 保存/恢复位置
  - [ ] 集成头部、内容区
  - [ ] 关闭按钮功能
  - [ ] 时间显示更新
  - [ ] 样式迁移（.ngq-main-panel, .ngq-header）

- [ ] **4.3 楼层视图** (`components/FloorView.vue`)
  - [ ] 接收楼层数据 props
  - [ ] 渲染房间网格
  - [ ] 使用 `RoomCard` 组件
  - [ ] 样式迁移（.ngq-floor-level, .ngq-floor-grid）

- [ ] **4.4 房间卡片** (`components/RoomCard.vue`)
  - [ ] 接收房间数据 props
  - [ ] 根据房间类型显示不同样式
  - [ ] 点击事件处理（打开详情/装修模态框）
  - [ ] 支持合并房间显示
  - [ ] 样式迁移（.ngq-room-card 及其变体）

- [ ] **4.5 管理操作** (`components/ManagementActions.vue`)
  - [ ] 招募租客按钮
  - [ ] 购置楼层按钮
  - [ ] 刷新数据按钮
  - [ ] 自动刷新开关
  - [ ] 样式迁移（.ngq-management-actions）

---

### 阶段 5：模态框组件 (优先级：中)

- [ ] **5.1 房间详情模态框** (`components/modals/RoomModal.vue`)
  - [ ] 显示房间基本信息
  - [ ] 显示租客信息（如果有）
  - [ ] 显示好感度/性欲进度条
  - [ ] 拆除房间功能（用户自定义功能性房间）
  - [ ] 样式迁移（.ngq-modal-overlay, .ngq-modal-content）

- [ ] **5.2 招募租客模态框** (`components/modals/RecruitmentModal.vue`)
  - [ ] 输入框（租客特征）
  - [ ] 确认/取消按钮
  - [ ] 调用 `fillCommand` 填充命令
  - [ ] 样式迁移

- [ ] **5.3 装修选择模态框** (`components/modals/RenovateModal.vue`)
  - [ ] 标准套间按钮
  - [ ] 功能性房间按钮
  - [ ] 打开功能性房间输入模态框
  - [ ] 样式迁移

- [ ] **5.4 功能性房间输入模态框** (`components/modals/FunctionalInputModal.vue`)
  - [ ] 房间名称输入
  - [ ] 房间作用输入
  - [ ] 确认/取消按钮
  - [ ] 调用 `fillCommand` 填充命令
  - [ ] 样式迁移

---

### 阶段 6：根组件和入口 (优先级：高)

- [ ] **6.1 根组件** (`App.vue`)
  - [ ] 组合 `ToggleButton` 和 `MainPanel`
  - [ ] 组合所有模态框
  - [ ] 全局样式导入
  - [ ] 初始化数据加载

- [ ] **6.2 入口文件** (`index.ts`)
  - [ ] 创建 Vue 应用
  - [ ] 注册 Pinia
  - [ ] 挂载到 `window.top.document.body`
  - [ ] 生命周期管理（卸载清理）
  - [ ] 参考 `src/脚本示例/设置界面.ts` 的模式

---

### 阶段 7：功能迁移验证 (优先级：高)

- [ ] **7.1 核心功能验证**
  - [ ] 按钮拖动功能正常
  - [ ] 面板拖动功能正常
  - [ ] 面板显示/隐藏正常
  - [ ] 数据加载正常
  - [ ] 楼层和房间渲染正常

- [ ] **7.2 交互功能验证**
  - [ ] 点击房间卡片打开详情
  - [ ] 点击空房间打开装修选择
  - [ ] 招募租客功能正常
  - [ ] 装修房间功能正常
  - [ ] 拆除房间功能正常

- [ ] **7.3 数据功能验证**
  - [ ] MVU 数据正确解析
  - [ ] 好感度/性欲进度条显示正确
  - [ ] 租客信息显示完整
  - [ ] 房间状态显示正确

- [ ] **7.4 持久化功能验证**
  - [ ] 按钮位置保存/恢复
  - [ ] 面板位置保存/恢复
  - [ ] 自动刷新设置保存

---

### 阶段 8：优化和完善 (优先级：中)

- [ ] **8.1 性能优化**
  - [ ] 使用 `computed` 缓存计算结果
  - [ ] 使用 `v-memo` 优化列表渲染
  - [ ] 懒加载模态框组件
  - [ ] 防抖/节流处理（拖动、刷新）

- [ ] **8.2 用户体验优化**
  - [ ] 添加加载动画
  - [ ] 添加过渡动画（Vue Transition）
  - [ ] 优化移动端适配
  - [ ] 添加错误提示

- [ ] **8.3 代码质量**
  - [ ] 添加 JSDoc 注释
  - [ ] 完善 TypeScript 类型
  - [ ] 代码格式化
  - [ ] ESLint 检查通过

---

### 阶段 9：测试和文档 (优先级：低)

- [ ] **9.1 功能测试**
  - [ ] 桌面端浏览器测试
  - [ ] 移动端浏览器测试
  - [ ] 不同分辨率测试
  - [ ] 边界情况测试

- [ ] **9.2 文档编写**
  - [ ] README.md - 项目说明
  - [ ] CHANGELOG.md - 变更日志
  - [ ] 组件使用文档
  - [ ] API 文档

---

## 🎨 样式迁移清单

### CSS 变量（提取到 `styles/variables.css`）
- [ ] `--apt-primary`
- [ ] `--apt-secondary`
- [ ] `--apt-bg`
- [ ] `--apt-card`
- [ ] `--apt-border`
- [ ] `--apt-text`
- [ ] `--apt-dim`

### 组件样式（迁移到对应 `.vue` 文件的 `<style scoped>`）
- [ ] 拖动按钮样式（.ngq-toggle-btn）
- [ ] 主面板样式（.ngq-main-panel, .ngq-header）
- [ ] 楼层样式（.ngq-floor-level, .ngq-floor-grid）
- [ ] 房间卡片样式（.ngq-room-card 及其变体）
- [ ] 模态框样式（.ngq-modal-overlay, .ngq-modal-content）
- [ ] 按钮样式（.ngq-btn）
- [ ] 进度条样式（.ngq-progress-bar, .ngq-progress-fill）

### 响应式样式
- [ ] 移动端适配（@media 查询）
- [ ] 横屏适配
- [ ] 安全区域适配（safe-area-inset）

---

## ⚠️ 注意事项

1. **保持向后兼容**
   - 确保与现有 MVU 数据格式兼容
   - 保持 localStorage 键名一致
   - 保持 DOM 注入方式（`window.top.document`）

2. **避免重复绑定**
   - 使用 Vue 的生命周期管理事件
   - 卸载时清理所有事件监听器
   - 避免内存泄漏

3. **全局变量处理**
   - `Mvu` - 从 `window` 或 `window.parent` 获取
   - `fillCommand` - 确保全局可用
   - `$` (jQuery) - 仅在必要时使用

4. **打包体积控制**
   - Vue 会增加约 100KB（压缩后）
   - 考虑使用 CDN 外部化 Vue（已配置）
   - 使用 Tree Shaking 减少体积

5. **开发调试**
   - 使用 Vue DevTools
   - 保留 console.log（开发模式）
   - Source Map 已配置

---

## 📊 预期收益

### 代码质量
- **可维护性** ⬆️⬆️⬆️ - 从单文件 2174 行拆分为多个小文件
- **可读性** ⬆️⬆️⬆️ - Vue 模板比字符串拼接更清晰
- **可测试性** ⬆️⬆️ - 组件化后更易单元测试
- **类型安全** ⬆️⬆️ - Vue 3 + TypeScript 类型推导更好

### 开发体验
- **开发效率** ⬆️⬆️ - 组件复用、自动导入
- **调试体验** ⬆️⬆️ - Vue DevTools 支持
- **热重载** ⬆️⬆️ - 修改即时生效

### 用户体验
- **性能** ⬆️ - Vue 虚拟 DOM 优化
- **动画** ⬆️⬆️ - Vue Transition 更流畅
- **响应速度** ➡️ - 基本持平（可能略有提升）

### 成本
- **打包体积** ⬇️ - 增加约 100KB（可通过 CDN 外部化）
- **学习成本** ⬇️ - 需要熟悉 Vue 3 Composition API
- **迁移时间** ⬇️⬇️ - 预计 2-3 天完成基础迁移

---

## 🚀 开始开发

### 推荐开发顺序

1. **第一步**：创建类型定义和工具函数（阶段 1）
2. **第二步**：创建 Pinia Stores（阶段 2）
3. **第三步**：创建 Composables（阶段 3）
4. **第四步**：创建核心组件（阶段 4）
5. **第五步**：创建模态框组件（阶段 5）
6. **第六步**：组装根组件和入口（阶段 6）
7. **第七步**：功能验证（阶段 7）
8. **第八步**：优化完善（阶段 8）

### 开发命令

```bash
# 开发模式（带热重载）
npm run dev

# 生产构建
npm run build

# 类型检查
npm run type-check
```

---

## 📚 参考资料

- Vue 3 官方文档：https://vuejs.org/
- Pinia 官方文档：https://pinia.vuejs.org/
- VueUse 文档：https://vueuse.org/
- 现有代码：`src/网红小区/index.ts`
- 示例代码：`src/脚本示例/设置界面.vue`

---

**最后更新时间**：2025-10-31

