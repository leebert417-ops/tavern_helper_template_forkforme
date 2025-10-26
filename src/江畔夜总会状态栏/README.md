# 江畔夜总会状态栏

一个符合酒馆助手规范的悬浮状态栏脚本，用于显示江畔夜总会的经营状况、工坊培养进度等信息。

## 功能特点

- ✅ 使用 TypeScript + Vue 3 编写，符合项目规范
- ✅ 使用 Zod 进行数据校验和类型安全
- ✅ 支持拖动的浮动按钮
- ✅ 美观的管理面板界面
- ✅ 实时显示 MVU 变量数据
- ✅ 响应式设计，支持移动端

## 项目结构

```
src/江畔夜总会状态栏/
├── index.ts           # 主入口文件，处理初始化和生命周期
├── MainPanel.vue      # 主面板 Vue 组件
├── types.ts           # TypeScript 类型定义和 Zod Schema
├── styles.scss        # 样式文件
└── README.md          # 说明文档
```

## 数据格式

脚本从 MVU 框架读取最新消息楼层的 `stat_data`，期望的数据结构如下：

```yaml
时间信息:
  当前日期: "2025年10月25日"
  当前时间: "20:30"
  营业状态: "营业中"

地点信息:
  当前位置: "江畔夜总会"

夜总会经营:
  本月营收: "500"
  在职员工数: "30"
  VIP客户数: "15"
  待处理订单: []

工坊培养对象:
  当前培养人数: "2"
  培养列表:
    - 姓名: "张三"
      编号: "001"
      基本信息:
        培养天数: "10"
      定制信息:
        目标形象: "高端名媛"
        对应订单: "VIP-001"
      当前状态: "基础培训中"
      培养进度:
        社交礼仪: "60"
        才艺培养: "45"
        性爱技巧: "30"
        形体改造: "50"
        综合完成度: "46"

已归档艺人:
  总数: "10"
  档案列表:
    - 艺名: "小雪"
      类型: "名媛"
      当前状态: "活跃"

鹿忧传媒联系:
  可调派艺人数: "20"
  本月已调派: "5"
```

## 使用方法

### 1. 打包脚本

在项目根目录运行：

```bash
pnpm run build
```

### 2. 导入到酒馆

1. 打包后，在 `dist/江畔夜总会状态栏/` 文件夹中会生成 `index.js`
2. 在酒馆助手的脚本管理界面中导入该脚本
3. 启用脚本

### 3. 使用插件

- 页面右下角会出现一个 🌙 浮动按钮
- 点击按钮打开管理面板
- 可以拖动按钮到任意位置
- 点击面板外部或 × 按钮关闭面板

## 技术栈

- **TypeScript**: 类型安全的 JavaScript
- **Vue 3**: 响应式 UI 框架
- **Zod**: 运行时数据校验
- **SCSS**: CSS 预处理器
- **MVU**: 酒馆变量管理框架
- **jQuery**: DOM 操作（用于兼容性）

## 规范遵循

本项目严格遵循 `tavern_helper_template` 的最佳实践：

1. ✅ 使用 TypeScript 而非 JavaScript
2. ✅ 使用 Vue 3 组件而非 jQuery DOM 操作
3. ✅ 使用 Zod 进行数据校验
4. ✅ 使用 `$(() => {})` 处理加载
5. ✅ 使用 `$(window).on('pagehide')` 处理卸载
6. ✅ 使用 `await waitGlobalInitialized('Mvu')` 等待 MVU 初始化
7. ✅ 使用酒馆助手提供的接口
8. ✅ 模块化的项目结构

## 开发说明

### 修改样式

编辑 `styles.scss` 文件，使用 CSS 变量进行主题定制：

```scss
:root {
  --nightclub-primary: #e94560;     // 主色调
  --nightclub-bg-dark: #1a1a2e;     // 深色背景
  --nightclub-bg-mid: #16213e;      // 中间色背景
  --nightclub-text-light: #eee;     // 浅色文字
  --nightclub-text-dim: #aaa;       // 暗色文字
  --nightclub-text-dimmer: #bbb;    // 更暗的文字
}
```

### 修改数据结构

如果需要适配不同的数据结构，修改 `types.ts` 中的 Zod Schema：

```typescript
export const NightclubDataSchema = z.object({
  // 添加或修改字段
});
```

### 修改 UI

编辑 `MainPanel.vue` 组件，使用 Vue 3 的组合式 API。

## 许可证

与主项目相同
