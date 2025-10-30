# “网红小区”动态模拟版 - 改造计划 (To-Do List)

本项目旨在将静态的 `网红小区` 世界书设定, 改造为一个动态的、单页应用的模拟经营游戏.

## Phase 1: 项目基础框架搭建

- [ ] 在 `src` 目录下创建新的项目文件夹 `网红小区-单页版`.
- [ ] 在 `网红小区-单页版` 内部创建前端应用的核心文件:
  - [ ] `index.html` (SPA 页面入口)
  - [ ] `index.ts` (Vue 应用挂载点)
  - [ ] `App.vue` (游戏主界面根组件)
  - [ ] `gameStore.ts` (Pinia 状态管理中心)
- [ ] 编写 `index.ts` 的基础代码, 完成 Vue 应用的创建和挂载.

## Phase 2: 状态与数据迁移

- [ ] 在 `gameStore.ts` 中, 根据 `变量初始化.xyaml` 设计完整的 Pinia state 结构, 包括: `world`, `apartments`, `tenants`, `player`.
- [ ] (可选, 推荐) 编写一个一次性脚本, 用于解析旧版 `网红小区` 目录下的 `.xyaml` 文件, 将其数据转换为 `gameStore.ts` 中可以使用的初始状态对象.
- [ ] 实现游戏状态的持久化:
  - [ ] 在 `App.vue` 加载时, 通过 `getVariables` 读取并恢复 `gameStore` 的状态.
  - [ ] 使用 `watchEffect` 监听 `gameStore` 的变化, 并通过 `replaceVariables` 将其自动保存到消息楼层变量中.

## Phase 3: 核心游戏循环

- [ ] 在 `gameStore.ts` 中实现 `advanceTime(hours: number)` 核心函数.
- [ ] 确定租客"位置逻辑"的数据结构 (例如, 在租客对象中添加 `schedule` 数组).
- [ ] 在 `advanceTime` 函数中, 实现根据时间变化和 `schedule` 来更新所有租客 `currentLocation` 的逻辑.
- [ ] 在 `advanceTime` 函数中, 添加检查特殊事件触发条件的逻辑 (如好感度/性欲阈值, 特定时间点等).

## Phase 4: 用户界面 (UI) 开发

- [ ] **地图/位置视图**: 在 `App.vue` 中创建一个组件, 用于可视化展示公寓的楼层、房间, 以及玩家和租客的当前位置.
- [ ] **状态显示组件**: 创建用于显示游戏内时间、日期以及玩家核心状态的组件.
- [ ] **行动面板组件**:
  - [ ] 实现地点移动功能, 允许玩家在不同房间之间切换.
  - [ ] 实现"等待/推进时间"功能, 调用 `advanceTime` 函数.
  - [ ] 实现上下文相关的"互动"按钮 (当玩家与租客在同一房间时显示).
- [ ] **叙事窗口组件**: 创建一个用于展示剧情描述和角色对话的文本区域, 可选加入打字机效果.

## Phase 5: 交互与事件实现

- [ ] 应用"混合模式", 实现处理玩家与租客互动的核心函数 (例如 `interactWithTenant`).
- [ ] 在该函数中, 实现 `generate()` + `Mvu.parseMessage()` 的完整后台交互循环.
- [ ] 实现特殊事件的启动和处理逻辑, 调用 `generate()` 来驱动事件剧情发展.
- [ ] 将 LLM 返回的叙事文本和 `Mvu.parseMessage()` 生成的 `display_data` 渲染到 UI 的叙事窗口中.
