# 网红小区 Vue 版 - 使用说明

## 🚀 快速开始

### 1. 构建项目

```bash
npm run build
```

构建成功后，会在 `dist/网红小区vue版/` 目录下生成：
- `index.js` - 主文件
- `index.js.map` - Source Map（调试用）

### 2. 在 SillyTavern 中加载

#### 方法 1：本地加载（推荐用于开发）

1. 将 `dist/网红小区vue版/index.js` 复制到 SillyTavern 的脚本目录
2. 在 SillyTavern 中加载该脚本

#### 方法 2：网络加载

1. 将 `dist/网红小区vue版/index.js` 上传到网络（如 GitHub、CDN）
2. 在 SillyTavern 中使用网络链接加载

```javascript
import('https://your-cdn.com/网红小区vue版/index.js');
```

### 3. 验证加载

加载成功后，你应该看到：
- 右下角出现一个粉色的 🏢 按钮
- 控制台输出：`✅ 网红小区 Vue 版初始化成功`

---

## 🎮 功能说明

### 拖动按钮 🏢

**位置：** 屏幕左侧（默认位置：left: 20px, top: 100px）

**功能：**
- **拖动：** 按住按钮拖动可以移动位置
- **点击：** 点击按钮切换主面板显示/隐藏
- **位置保存：** 拖动后的位置会自动保存到 localStorage

**技术细节：**
- 移动距离 < 5px 视为点击
- 移动距离 >= 5px 视为拖动
- 拖动时按钮会变为半透明
- 拖动范围限制在视口内

### 调试面板 🧪

**位置：** 右下角的 🧪 图标

**功能：**
- 显示 Stores 状态（公寓数据、面板状态、设置）
- 测试数据加载
- 测试面板切换
- 测试自动刷新

**使用方法：**
1. 点击右下角的 🧪 图标打开调试面板
2. 查看当前状态
3. 点击测试按钮进行功能测试
4. 点击"关闭"按钮关闭调试面板

---

## 🔧 配置说明

### 自动刷新设置

**默认值：**
- 启用状态：`false`（禁用）
- 刷新间隔：`30000` 毫秒（30 秒）

**修改方法：**
1. 打开调试面板
2. 点击"切换自动刷新"按钮
3. 设置会自动保存到 localStorage

**代码修改：**
```typescript
// src/网红小区vue版/types/index.ts
export const DEFAULT_SETTINGS: PluginSettings = {
  autoRefreshEnabled: false, // 改为 true 启用
  refreshInterval: 30000,    // 修改刷新间隔（毫秒）
};
```

### 按钮默认位置

**修改方法：**
```typescript
// src/网红小区vue版/components/ToggleButton.vue
const { position, savePosition, restorePosition } = usePosition({
  key: 'button',
  defaultPosition: { left: 20, top: 100 }, // 修改这里
  autoSave: false,
});
```

---

## 🐛 故障排除

### 问题 1：按钮不显示

**可能原因：**
- 脚本未正确加载
- MVU 框架未加载
- 初始化失败

**解决方法：**
1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 检查是否输出：`✅ 网红小区 Vue 版初始化成功`
4. 如果没有，查看错误信息并根据提示解决

### 问题 2：拖动不流畅

**可能原因：**
- 浏览器性能问题
- 其他脚本冲突

**解决方法：**
1. 关闭其他不必要的脚本
2. 刷新页面重新加载
3. 检查浏览器控制台是否有错误

### 问题 3：位置保存失败

**可能原因：**
- localStorage 被禁用
- 浏览器隐私模式

**解决方法：**
1. 检查浏览器设置，确保允许 localStorage
2. 退出隐私模式
3. 清除浏览器缓存后重试

### 问题 4：数据加载失败

**可能原因：**
- MVU 框架未正确加载
- 没有可用的 MVU 数据

**解决方法：**
1. 确保酒馆助手已安装并启用 MVU 框架
2. 确保当前聊天中有 MVU 数据
3. 打开调试面板，点击"加载数据"按钮测试
4. 查看控制台错误信息

---

## 📝 开发说明

### 开发模式

```bash
# 启动开发服务器（带热重载）
npm run dev

# 构建生产版本
npm run build
```

### 调试技巧

1. **使用调试面板**
   - 打开调试面板查看实时状态
   - 测试各项功能是否正常

2. **查看控制台日志**
   - 所有重要操作都有日志输出
   - 日志格式：`✅ 成功` / `❌ 失败` / `🔄 进行中`

3. **检查 localStorage**
   ```javascript
   // 查看保存的位置
   localStorage.getItem('ngq-plugin-position');
   
   // 查看保存的设置
   localStorage.getItem('ngq-plugin-settings');
   ```

4. **清除保存的数据**
   ```javascript
   // 清除位置
   localStorage.removeItem('ngq-plugin-position');
   
   // 清除设置
   localStorage.removeItem('ngq-plugin-settings');
   ```

### 代码结构

```
src/网红小区vue版/
├── index.ts              # 入口文件
├── App.vue               # 根组件
├── components/           # 组件目录
│   └── ToggleButton.vue  # 拖动按钮
├── composables/          # 组合式函数
│   ├── useDrag.ts        # 拖动功能
│   ├── useMVUData.ts     # 数据加载
│   ├── usePosition.ts    # 位置管理
│   └── useAutoRefresh.ts # 自动刷新
├── stores/               # 状态管理
│   ├── apartment.ts      # 公寓数据
│   ├── ui.ts             # UI 状态
│   └── settings.ts       # 设置
├── types/                # 类型定义
│   └── index.ts
├── utils/                # 工具函数
│   ├── mvuHelper.ts      # MVU 工具
│   └── commandHelper.ts  # 命令工具
└── styles/               # 样式文件
    ├── variables.css     # CSS 变量
    ├── animations.css    # 动画
    └── common.css        # 通用样式
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**
   - README.md - 项目说明
   - TEST_REPORT.md - 测试报告
   - to_do.md - 任务清单

2. **检查控制台**
   - 打开浏览器控制台（F12）
   - 查看错误信息和日志

3. **使用调试面板**
   - 点击右下角 🧪 图标
   - 查看状态和测试功能

4. **提交问题**
   - GitHub Issues
   - 项目讨论区

---

**版本：** 1.0.0  
**最后更新：** 2025-10-31  
**作者：** AI Assistant

