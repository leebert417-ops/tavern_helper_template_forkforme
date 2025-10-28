// ==================== 江畔夜总会状态栏 ====================
// 使用 TypeScript + 原生实现（不使用 Vue，参考掌上公寓的实现方式）
// 版本：规范化重构版

console.log('🌙 加载江畔夜总会状态栏插件...');

// ==================== 类型定义 ====================
interface NightclubData {
  时间信息?: {
    当前日期?: string;
    当前时间?: string;
    星期?: string;
    营业状态?: string;
  };
  地点信息?: {
    当前位置?: string;
  };
  夜总会经营?: {
    在职员工数?: number | string;
    VIP客户数?: number | string;
    待处理订单?: Array<{
      委托人?: string;
      需求类型?: string;
      具体要求?: string;
      截止日期?: string;
      [key: string]: any;
    }>;
  };
  工坊培养对象?: {
    当前培养人数?: number | string;
    培养列表?: Array<{
      姓名?: string;
      编号?: string;
      基本信息?: {
        年龄?: number | string;
        原始外貌?: string;
        来源?: string;
      };
      培养进度?: number | string;
      定制信息?: {
        对应订单?: string;
        目标形象?: string;
        特殊要求?: string;
      };
      备注?: string[];
    }>;
  };
  已归档?: {
    总数?: number | string;
    档案列表?: Array<{
      姓名?: string;
      艺名?: string;
      简述?: string;
      [key: string]: any;
    }>;
  };
  侦测数据?: {
    [key: string]: string;
  };
}

// ==================== 样式定义 ====================
/* eslint-disable */
const styles = `
<style id="nightclub-plugin-styles">
:root {
  --nightclub-primary: #e94560;
  --nightclub-secondary: #0f3460;
  --nightclub-bg-dark: #16213e;
  --nightclub-bg-mid: #1a2332;
  --nightclub-bg-light: #2a3447;
  --nightclub-text-light: #e4e7eb;
  --nightclub-text-dim: #a0a8b5;
}

/* ==================== 拖动按钮 */
.nightclub-toggle-btn {
  position: fixed !important;
  top: 100px;
  left: 20px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e94560 0%, #c8365a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 10000 !important;
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-size: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  /* 只对 transform 和 box-shadow 添加过渡，不影响拖动 */
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.nightclub-toggle-btn:hover {
  transform: scale(1.05);
}

.nightclub-toggle-btn.dragging {
  cursor: grabbing !important;
  opacity: 0.9;
  z-index: 10001 !important;
  /* 拖动时完全禁用过渡 */
  transition: none !important;
}

/* ==================== 主面板容器 */
.nightclub-main-panel {
  position: fixed !important;
  top: 50vh !important;
  left: 50vw !important;
  transform: translate(-50%, -50%) !important;
  width: 90vw !important;
  max-width: 800px !important;
  height: 85vh !important;
  max-height: 600px !important;
  background: var(--nightclub-bg-dark);
  background: linear-gradient(135deg, var(--nightclub-bg-dark) 0%, var(--nightclub-bg-mid) 100%);
  border: 2px solid var(--nightclub-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 9999 !important;
  display: none;
  flex-direction: column;
  overflow: hidden;
  color: var(--nightclub-text-light);
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.nightclub-main-panel.active {
  display: flex;
}

.nightclub-main-panel.dragging {
  transition: none !important;
}

/* ==================== 头部 */
.nightclub-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: var(--nightclub-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: opacity 0.2s;
  touch-action: none !important;
}

.nightclub-header.dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  transition: none !important;
}

/* ==================== 标签页导航 */
.nightclub-tabs {
  display: flex;
  flex-shrink: 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.nightclub-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  text-align: center;
}

.nightclub-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.nightclub-tab.active {
  color: var(--nightclub-primary);
  border-bottom-color: var(--nightclub-primary);
}

.nightclub-tab-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  background: var(--nightclub-primary);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.nightclub-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nightclub-header-title {
  font-size: 18px;
}

.nightclub-header-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.nightclub-close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.nightclub-close-btn:hover {
  transform: scale(1.1);
}

/* ==================== 内容区域 */
.nightclub-content {
     flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.nightclub-content::-webkit-scrollbar {
  width: 8px;
}

.nightclub-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.nightclub-content::-webkit-scrollbar-thumb {
  background: var(--nightclub-primary);
  border-radius: 4px;
}

/* ==================== 卡片样式 */
.nightclub-card {
  background: var(--nightclub-bg-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.nightclub-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(233, 69, 96, 0.2);
  font-weight: 600;
  font-size: 16px;
}

.nightclub-card-content {
  padding: 16px;
}

.nightclub-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nightclub-info-row:last-child {
  border-bottom: none;
}

.nightclub-info-label {
  color: var(--nightclub-text-dim);
  font-size: 14px;
}

.nightclub-info-value {
  color: var(--nightclub-text-light);
  font-weight: 500;
  text-align: right;
}

/* ==================== 进度条 */
.nightclub-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.nightclub-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e94560 0%, #ff6b81 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

/* ==================== 培养对象列表 */
.nightclub-trainee-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.nightclub-trainee-item:hover {
  border-color: var(--nightclub-primary);
  background: rgba(233, 69, 96, 0.1);
  transform: translateX(4px);
}

.nightclub-trainee-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.nightclub-trainee-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--nightclub-primary);
}

.nightclub-trainee-status {
  font-size: 12px;
  color: var(--nightclub-text-dim);
}

/* ==================== 归档艺人 */
.nightclub-archived-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.nightclub-archived-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s;
}

.nightclub-archived-item:hover {
  border-color: var(--nightclub-primary);
  transform: translateY(-2px);
}

.nightclub-archived-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.nightclub-archived-type {
  font-size: 12px;
  color: var(--nightclub-text-dim);
}

/* 归档艺人简述样式 */
.archived-description {
  padding: 8px 0;
  line-height: 1.6;
}

.archived-description-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--nightclub-primary);
  margin-right: 4px;
}

.archived-description-text {
  font-size: 14px;
  color: var(--nightclub-text-light);
  line-height: 1.6;
}

/* ==================== 空状态 */
.nightclub-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--nightclub-text-dim);
}

.nightclub-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.nightclub-empty-text {
  font-size: 14px;
}

/* ==================== 加载状态 */
.nightclub-loading {
  text-align: center;
  padding: 40px;
  color: var(--nightclub-text-dim);
}

.nightclub-loading-icon {
  font-size: 32px;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 对象侦测页面 */
.detection-current-display {
  margin-bottom: 16px;
}

.detection-display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px 8px 0 0;
}

.detection-display-title {
  font-weight: 600;
  font-size: 14px;
}

/* 侦测结果显示框 */
.detection-results-display {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.detection-results-header {
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.2);
}

.detection-results-title {
  font-weight: 600;
  font-size: 14px;
  color: #4caf50;
}

.detection-results-content {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.detection-result-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.detection-result-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateX(2px);
}

.detection-result-item:last-child {
  margin-bottom: 0;
}

.detection-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detection-result-name {
  font-weight: 600;
  color: #4caf50;
}

.detection-result-toggle {
  font-size: 12px;
  color: var(--nightclub-text-dim);
}

.detection-result-toggle:hover {
  color: var(--nightclub-text-light);
}

.detection-result-data {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;
}

.detection-result-data.expanded {
  grid-template-rows: 1fr;
}

.detection-result-data-inner {
  min-height: 0;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.detection-results-empty {
  text-align: center;
  padding: 24px;
  color: var(--nightclub-text-dim);
  font-style: italic;
}

.detection-display-content {
  padding: 12px;
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 8px 8px;
}

.detection-display-empty {
  text-align: center;
  padding: 20px;
  color: var(--nightclub-text-dim);
  font-size: 13px;
}

.detection-display-item {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
}

.detection-display-item:last-child {
  margin-bottom: 0;
}

.detection-display-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.detection-display-item-name {
  font-weight: 600;
  color: var(--nightclub-primary);
}

.detection-display-item-category {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  color: white;
  white-space: nowrap;
}

.detection-display-item-remove {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.detection-display-item-remove:hover {
  color: var(--nightclub-primary);
  transform: scale(1.2);
}

.detection-display-item-info {
  font-size: 12px;
  color: var(--nightclub-text-dim);
  line-height: 1.4;
}

.detection-description {
  padding: 12px 16px;
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid rgba(255, 193, 7, 0.5);
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--nightclub-text-light);
}

.detection-clear-btn {
  background: rgba(255, 69, 58, 0.2);
  border: 1px solid rgba(255, 69, 58, 0.5);
  color: #ff453a;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.detection-clear-btn:hover {
  background: rgba(255, 69, 58, 0.3);
}

.detection-targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detection-target-item {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.detection-target-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(233, 69, 96, 0.6);
  transform: translateY(-2px);
}

.detection-target-item.selected {
  background: rgba(233, 69, 96, 0.2);
  border-color: var(--nightclub-primary);
}

.detection-target-item.detected {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
  cursor: not-allowed;
  opacity: 0.8;
}

.detection-target-item.detected:hover {
  transform: none;
  border-color: rgba(255, 215, 0, 0.5);
}

.detection-target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detection-target-name {
  font-weight: 600;
  color: var(--nightclub-text-light);
}

.detection-target-category {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.detection-target-info {
  font-size: 12px;
  color: var(--nightclub-text-dim);
  margin-bottom: 8px;
}

.detection-target-status {
  font-size: 12px;
  color: var(--nightclub-primary);
  text-align: center;
  padding: 4px;
  background: rgba(233, 69, 96, 0.1);
  border-radius: 4px;
}

.detection-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.detection-action-btn {
  flex: 1;
  max-width: 250px;
  padding: 12px 24px;
  background: var(--nightclub-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.detection-action-btn:hover:not(:disabled) {
  background: #c8365a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.detection-action-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.4;
}

.detection-action-btn.detection-remove-btn {
  background: #444;
}

.detection-action-btn.detection-remove-btn:hover:not(:disabled) {
  background: #666;
}

/* ==================== 移动端适配 */
@media (max-width: 768px) {
  .nightclub-main-panel {
    width: 95vw;
    height: 90vh;
  }

  .nightclub-toggle-btn {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .nightclub-tab {
    font-size: 11px;
    padding: 10px 8px;
  }

  .detection-targets-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 确保按钮可交互 */
  .nightclub-toggle-btn {
    pointer-events: auto;
    z-index: 10002;
  }
}

/* 竖屏优化 */
@media (max-width: 480px) and (orientation: portrait) {
  .nightclub-main-panel {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    border: none;
  }

  .nightclub-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 22px;
  }

  .nightclub-tab {
    font-size: 10px;
    padding: 8px 4px;
  }

  /* 确保按钮在小屏幕下也能正常工作 */
  .nightclub-toggle-btn {
    z-index: 10002;
  }

  .detection-targets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 横屏优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .nightclub-main-panel {
    height: 95vh;
    max-height: none;
  }

  .nightclub-content {
    padding: 10px;
  }
}

/* ==================== 全局移动端优化 */
/* 防止双击缩放 */
* {
  touch-action: manipulation;
}

/* 允许按钮完全控制触摸行为 */
.nightclub-toggle-btn {
  touch-action: none !important;
}

/* 移除触摸高亮 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* 优化滚动体验（iOS 平滑滚动）*/
.nightclub-content {
  -webkit-overflow-scrolling: touch;
}

/* 移动端字体优化 */
body {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* 支持刘海屏等安全区域 - 仅在小屏幕应用 */
@supports (padding: max(0px)) {
  @media (max-width: 480px) {
    .nightclub-main-panel {
      padding-top: max(0px, env(safe-area-inset-top));
      padding-bottom: max(0px, env(safe-area-inset-bottom));
      padding-left: max(0px, env(safe-area-inset-left));
      padding-right: max(0px, env(safe-area-inset-right));
    }
  }
}

/* 移除所有按钮和可交互元素的焦点框 */
button:focus,
  button:active,
.nightclub-toggle-btn:focus,
.nightclub-toggle-btn:active,
.nightclub-close-btn:focus,
.nightclub-close-btn:active,
.nightclub-trainee-item:focus,
.nightclub-trainee-item:active {
  outline: none;
  outline-color: transparent;
}
  </style>
`;
/* eslint-enable */

// ==================== HTML 结构 ====================
const html = `
<!-- 拖动按钮 -->
<div id="nightclub-toggle-btn" class="nightclub-toggle-btn">
  <span>🌙</span>
</div>

<!-- 主面板 -->
<div id="nightclub-main-panel" class="nightclub-main-panel">
  <div class="nightclub-header">
    <div class="nightclub-header-left">
      <div class="nightclub-header-title">🌙 江畔夜总会</div>
      <div class="nightclub-header-subtitle" id="nightclub-time-display">加载中...</div>
    </div>
    <button class="nightclub-close-btn" id="nightclub-close-btn">×</button>
  </div>
  
  <!-- 标签页导航 -->
  <div class="nightclub-tabs">
    <button class="nightclub-tab active" data-page="club">
      🏢 会所状态
    </button>
    <button class="nightclub-tab" data-page="workshop">
      🏭 工坊状态<span class="nightclub-tab-badge" id="tab-badge-workshop">0</span>
    </button>
    <button class="nightclub-tab" data-page="trainees">
      👥 培养对象<span class="nightclub-tab-badge" id="tab-badge-trainees">0</span>
    </button>
    <button class="nightclub-tab" data-page="archived">
      📁 已归档<span class="nightclub-tab-badge" id="tab-badge-archived">0</span>
    </button>
    <button class="nightclub-tab" data-page="detection">
      🔍 对象侦测<span class="nightclub-tab-badge" id="tab-badge-detection">0</span>
    </button>
  </div>
  
  <div class="nightclub-content" id="nightclub-content">
    <div class="nightclub-loading">
      <div class="nightclub-loading-icon">⏳</div>
      <div>正在加载数据...</div>
    </div>
  </div>
</div>
`;

// ==================== 全局变量 ====================
let btnDragData: {
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
} | null = null;
let panelDragData: {
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
} | null = null;
let cachedMVUData: any = null;
const MAX_RETRIES = 5;
const RETRY_DELAY = 400;
let currentRetry = 0;
let currentPage: 'club' | 'workshop' | 'trainees' | 'archived' | 'detection' = 'club'; // 当前页面
const selectedDetectionTargets: Set<string> = new Set(); // 选中的侦测对象

// ==================== 工具函数 ====================
function safeGet(data: any, path: string, defaultValue: string = '未知'): string {
  if (!data) return defaultValue;
  const keys = path.split('.');
  let current = data;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  if (current === undefined || current === null) return defaultValue;
  return String(current) === '' ? defaultValue : String(current);
}

// ==================== 初始化函数 ====================
function initializeNightclubPlugin(): void {
  console.log('🚀 初始化江畔夜总会状态栏插件...');

  // 获取目标文档（添加错误处理，防止跨域问题）
  let targetDoc: Document;
  try {
    targetDoc = window.top ? window.top.document : document;
  } catch (e) {
    console.warn('⚠️ 无法访问 window.top，使用当前 document');
    targetDoc = document;
  }

  // 检查是否已存在
  if (targetDoc.getElementById('nightclub-toggle-btn')) {
    console.log('⚠️ 江畔夜总会状态栏已存在，先移除旧的');
    targetDoc.getElementById('nightclub-toggle-btn')?.remove();
    targetDoc.getElementById('nightclub-main-panel')?.remove();
    targetDoc.getElementById('nightclub-plugin-styles')?.remove();
    // 清理事件
    $(targetDoc).off('.nightclub-plugin');
  }

  // 注入样式
  if (!targetDoc.getElementById('nightclub-plugin-styles')) {
    targetDoc.head.insertAdjacentHTML('beforeend', styles);
    console.log('✅ 样式已注入');
  }

  // 注入 HTML
  targetDoc.body.insertAdjacentHTML('beforeend', html);
  console.log('✅ HTML 已注入');

  // 从 localStorage 恢复按钮位置
  const btn = targetDoc.getElementById('nightclub-toggle-btn');
  if (btn) {
    try {
      const saved = localStorage.getItem('nightclub-btn-position');
      if (saved) {
        const pos = JSON.parse(saved);
        btn.style.left = pos.left + 'px';
        btn.style.top = pos.top + 'px';
        console.log('📍 恢复按钮位置:', pos);
      }
    } catch (e) {
      console.warn('⚠️ 恢复按钮位置失败');
    }
  }

  // 初始化按钮拖动功能
  initializeButtonDrag(targetDoc);

  // 初始化面板功能
  initializePanelSystem(targetDoc);

  console.log('✅ 江畔夜总会状态栏插件初始化完成！');
}

// ==================== 按钮拖动功能 ====================
function initializeButtonDrag(targetDoc: Document): void {
  const btn = targetDoc.getElementById('nightclub-toggle-btn');
  const panel = targetDoc.getElementById('nightclub-main-panel');
  const $targetDoc = $(targetDoc);

  // 拖动开始
  function handleBtnDragStart(clientX: number, clientY: number): boolean {
    if (btnDragData) return false;

    const computedStyle = window.getComputedStyle(btn!);
    const currentLeft = parseInt(computedStyle.left) || 0;
    const currentTop = parseInt(computedStyle.top) || 0;

    btnDragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: currentLeft,
      initialTop: currentTop,
    };

    btn!.classList.add('dragging');
    console.log('🖱️ 开始拖动按钮');
    return true;
  }

  // 拖动移动
  function handleBtnDragMove(clientX: number, clientY: number): void {
    if (!btnDragData) return;

    const deltaX = clientX - btnDragData.startX;
    const deltaY = clientY - btnDragData.startY;

    let newLeft = btnDragData.initialLeft + deltaX;
    let newTop = btnDragData.initialTop + deltaY;

    // 限制范围
    const targetWindow = window.top || window;
    const maxX = $(targetWindow).width()! - 80;
    const maxY = $(targetWindow).height()! - 80;

    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));

    btn!.style.left = newLeft + 'px';
    btn!.style.top = newTop + 'px';
  }

  // 拖动结束
  function handleBtnDragEnd(clientX: number, clientY: number): void {
    if (!btnDragData) return;

    btn!.classList.remove('dragging');

    // 计算拖动距离
    const deltaX = clientX - btnDragData.startX;
    const deltaY = clientY - btnDragData.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 保存位置
    const computedStyle = window.getComputedStyle(btn!);
    const currentLeft = parseInt(computedStyle.left) || 0;
    const currentTop = parseInt(computedStyle.top) || 0;

    const position = {
      left: currentLeft,
      top: currentTop,
    };

    localStorage.setItem('nightclub-btn-position', JSON.stringify(position));
    console.log('✅ 按钮拖动结束，保存位置:', position);

    btnDragData = null;

    // 如果是点击（移动距离小于5像素），打开/关闭面板
    if (distance < 5) {
      console.log('🎨 检测到点击，切换面板');
      panel!.classList.toggle('active');
      // 打开面板时加载数据
      if (panel!.classList.contains('active')) {
        currentRetry = 0; // 重置重试计数器
        loadNightclubData(targetDoc);
      }
    }
  }

  // 绑定事件
  $(btn!).on('mousedown.nightclub-plugin', function (e) {
    if (handleBtnDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $(btn!).on('touchstart.nightclub-plugin', function (e) {
    const touch = e.originalEvent!.touches[0];
    if (handleBtnDragStart(touch.clientX, touch.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $targetDoc.on('mousemove.nightclub-plugin', function (e) {
    handleBtnDragMove(e.clientX, e.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('touchmove.nightclub-plugin', function (e) {
    const touch = e.originalEvent!.touches[0];
    handleBtnDragMove(touch.clientX, touch.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('mouseup.nightclub-plugin', function (e) {
    handleBtnDragEnd(e.clientX, e.clientY);
  });

  $targetDoc.on('touchend.nightclub-plugin touchcancel.nightclub-plugin', function (e) {
    const touch = e.originalEvent!.changedTouches[0];
    if (touch) {
      handleBtnDragEnd(touch.clientX, touch.clientY);
    } else {
      handleBtnDragEnd(0, 0);
    }
  });

  console.log('✅ 按钮拖动功能已初始化');
}

// ==================== 面板拖动 ====================
function initializePanelDrag(targetDoc: Document): void {
  const panel = $('#nightclub-main-panel', targetDoc)[0];
  const header = $('.nightclub-header', targetDoc)[0];
  const $targetDoc = $(targetDoc);

  if (!panel || !header) {
    console.error('❌ 面板或头部元素未找到');
    return;
  }

  function handlePanelDragStart(clientX: number, clientY: number): void {
    console.log('🖱️ 开始拖动面板');
    const rect = panel!.getBoundingClientRect();

    // 移除 transform 并设置新的 left/top (使用 important 覆盖)
    panel!.style.setProperty('transform', 'none', 'important');
    panel!.style.setProperty('left', `${rect.left}px`, 'important');
    panel!.style.setProperty('top', `${rect.top}px`, 'important');

    panelDragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
    $(panel!).addClass('dragging');
    $(header!).addClass('dragging');
    console.log('✅ 面板拖动数据已设置:', panelDragData);
  }

  function handlePanelDragMove(clientX: number, clientY: number): void {
    if (!panelDragData) return;

    const deltaX = clientX - panelDragData.startX;
    const deltaY = clientY - panelDragData.startY;
    const newLeft = panelDragData.initialLeft + deltaX;
    const newTop = panelDragData.initialTop + deltaY;

    console.log(`📍 移动面板: deltaX=${deltaX}, deltaY=${deltaY}, newLeft=${newLeft}, newTop=${newTop}`);

    panel!.style.setProperty('left', `${newLeft}px`, 'important');
    panel!.style.setProperty('top', `${newTop}px`, 'important');
  }

  function handlePanelDragEnd(): void {
    console.log('🖱️ 面板拖动结束');
    if (panelDragData) {
      // 保存位置
      const rect = panel!.getBoundingClientRect();
      const savedPosition = {
        left: rect.left,
        top: rect.top,
      };
      localStorage.setItem('nightclub-panel-position', JSON.stringify(savedPosition));
      console.log('✅ 面板拖动结束，保存位置:', savedPosition);
    }

    panelDragData = null;
    $(panel!).removeClass('dragging');
    $(header!).removeClass('dragging');
  }

  // 鼠标事件
  $(header!).on('mousedown.nightclub-panel-drag', function (e) {
    // 如果点击的是关闭按钮，不开始拖动
    if ($(e.target).closest('#nightclub-close-btn').length > 0) {
      console.log('⚠️ 点击了关闭按钮，跳过拖动');
      return;
    }
    e.preventDefault();
    handlePanelDragStart(e.clientX, e.clientY);
  });

  $targetDoc.on('mousemove.nightclub-panel-drag', function (e) {
    handlePanelDragMove(e.clientX, e.clientY);
  });

  $targetDoc.on('mouseup.nightclub-panel-drag', function () {
    handlePanelDragEnd();
  });

  // 触摸事件
  $(header!).on('touchstart.nightclub-panel-drag', function (e) {
    // 如果点击的是关闭按钮，不开始拖动
    if ($(e.target).closest('#nightclub-close-btn').length > 0) {
      console.log('⚠️ 触摸了关闭按钮，跳过拖动');
      return;
    }
    const touch = e.originalEvent!.touches[0];
    if (touch) {
      e.preventDefault();
      handlePanelDragStart(touch.clientX, touch.clientY);
    }
  });

  $targetDoc.on('touchmove.nightclub-panel-drag', function (e) {
    const touch = e.originalEvent!.touches[0];
    if (touch) {
      handlePanelDragMove(touch.clientX, touch.clientY);
    }
  });

  $targetDoc.on('touchend.nightclub-panel-drag touchcancel.nightclub-panel-drag', function () {
    handlePanelDragEnd();
  });

  // 恢复保存的位置
  const savedPos = localStorage.getItem('nightclub-panel-position');
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      panel!.style.setProperty('transform', 'none', 'important');
      panel!.style.setProperty('left', `${pos.left}px`, 'important');
      panel!.style.setProperty('top', `${pos.top}px`, 'important');
      console.log('✅ 已恢复面板位置:', pos);
    } catch (e) {
      console.error('❌ 恢复面板位置失败:', e);
    }
  }

  console.log('✅ 面板拖动功能已初始化');
}

// ==================== 面板系统 ====================
function initializePanelSystem(targetDoc: Document): void {
  const closeBtn = targetDoc.getElementById('nightclub-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.stopPropagation(); // 防止触发拖动
      const panel = targetDoc.getElementById('nightclub-main-panel');
      if (panel) {
        panel.classList.remove('active');
      }
    });
  }

  // 初始化标签页切换
  initializeTabSwitching(targetDoc);

  // 初始化面板拖动
  initializePanelDrag(targetDoc);

  console.log('✅ 面板系统已初始化');
}

// ==================== 标签页切换 ====================
function initializeTabSwitching(targetDoc: Document): void {
  const tabs = targetDoc.querySelectorAll('.nightclub-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.stopPropagation(); // 防止触发拖动

      const page = (this as HTMLElement).getAttribute('data-page') as
        | 'club'
        | 'workshop'
        | 'trainees'
        | 'archived'
        | 'detection';
      if (!page) return;

      // 更新当前页面
      currentPage = page;

      // 更新标签状态
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // 重新渲染当前页面内容
      if (cachedMVUData) {
        renderNightclubData(targetDoc, cachedMVUData);
      }

      console.log('📄 切换到页面:', page);
    });
  });

  console.log('✅ 标签页切换已初始化');
}

// ==================== 面板拖动功能（已禁用） ====================
// function initializePanelDrag(targetDoc: Document): void {
//   面板拖动功能已移除，专注于按钮拖动优化
// }

// togglePanel 函数已移除，面板切换现在直接在按钮拖动结束时处理

// ==================== 数据加载 ====================
async function loadNightclubData(targetDoc: Document): Promise<void> {
  try {
    // 检查 MVU 是否可用（改进版，更健壮）
    if (typeof Mvu === 'undefined') {
      // 尝试从父窗口获取（添加错误处理）
      try {
        if (window.parent && typeof (window.parent as any).Mvu !== 'undefined') {
          (window as any).Mvu = (window.parent as any).Mvu;
          console.log('✅ 已从父窗口引用 MVU');
        } else {
          throw new Error('父窗口中也没有 MVU');
        }
      } catch (e) {
        console.warn('⚠️ MVU 框架未加载或无法访问父窗口');
        if (currentRetry < MAX_RETRIES) {
          currentRetry++;
          console.log(`🔄 第 ${currentRetry}/${MAX_RETRIES} 次重试加载 MVU...`);
          setTimeout(() => loadNightclubData(targetDoc), RETRY_DELAY);
        } else {
          showError(targetDoc, 'MVU 框架未加载，请确保已安装酒馆助手并启用 MVU 框架');
        }
        return;
      }
    }

    // 获取最新消息的 MVU 数据
    const mvuResult = Mvu.getMvuData({
      type: 'message',
      message_id: 'latest',
    });

    const data = mvuResult?.stat_data;

    if (!data) {
      console.warn('⚠️ MVU 数据为空');
      if (currentRetry < MAX_RETRIES) {
        currentRetry++;
        setTimeout(() => loadNightclubData(targetDoc), RETRY_DELAY);
      } else {
        showError(targetDoc, '未能加载数据');
      }
      return;
    }

    cachedMVUData = data;
    console.log('✅ 数据加载成功', data);

    // 渲染数据
    renderNightclubData(targetDoc, data);
  } catch (error) {
    console.error('❌ 加载数据出错:', error);
    showError(targetDoc, '加载出错: ' + (error as Error).message);
  }
}

function showError(targetDoc: Document, message: string): void {
  const contentDiv = targetDoc.getElementById('nightclub-content');
  if (contentDiv) {
    contentDiv.innerHTML = `
      <div class="nightclub-empty">
        <div class="nightclub-empty-icon">⚠️</div>
        <div class="nightclub-empty-text">${message}</div>
      </div>
    `;
  }
}

// ==================== 数据渲染 ====================
function renderNightclubData(targetDoc: Document, data: NightclubData): void {
  const contentDiv = targetDoc.getElementById('nightclub-content');
  const timeDisplay = targetDoc.getElementById('nightclub-time-display');

  if (!contentDiv) return;

  // 更新时间显示
  if (timeDisplay && data.时间信息) {
    const dateText = safeGet(data, '时间信息.当前日期', '');
    const timeText = safeGet(data, '时间信息.当前时间', '');
    const statusText = safeGet(data, '时间信息.营业状态', '');
    const locationText = safeGet(data, '地点信息.当前位置', '');
    timeDisplay.textContent = `${dateText} ${timeText} | ${statusText}${locationText ? ` | ${locationText}` : ''}`;
  }

  // 更新标签徽章
  const ordersCount = data.夜总会经营?.待处理订单?.length || 0;
  const traineesCount = data.工坊培养对象?.培养列表?.length || 0;
  const archivedCount = data.已归档?.档案列表?.length || 0;
  const detectionCount = data.侦测数据 ? Object.keys(data.侦测数据).length : 0;

  const workshopBadge = targetDoc.getElementById('tab-badge-workshop');
  const traineesBadge = targetDoc.getElementById('tab-badge-trainees');
  const archivedBadge = targetDoc.getElementById('tab-badge-archived');
  const detectionBadge = targetDoc.getElementById('tab-badge-detection');

  if (workshopBadge) workshopBadge.textContent = String(ordersCount);
  if (traineesBadge) traineesBadge.textContent = String(traineesCount);
  if (archivedBadge) archivedBadge.textContent = String(archivedCount);
  if (detectionBadge) detectionBadge.textContent = String(detectionCount);

  // 构建 HTML
  let html = '';

  // 根据当前页面渲染不同内容
  if (currentPage === 'club') {
    // ========== 会所状态页面 ==========
    html += renderClubPage(data);
  } else if (currentPage === 'workshop') {
    // ========== 工坊状态页面 ==========
    html += renderWorkshopPage(data);
  } else if (currentPage === 'trainees') {
    // ========== 培养对象页面 ==========
    html += renderTraineesPage(data);
  } else if (currentPage === 'archived') {
    // ========== 已归档页面 ==========
    html += renderArchivedPage(data);
  } else if (currentPage === 'detection') {
    // ========== 对象侦测页面 ==========
    html += renderDetectionPage(data);
  }

  contentDiv.innerHTML = html;

  // 如果是侦测页面，需要绑定事件
  if (currentPage === 'detection') {
    initializeDetectionEvents(targetDoc);
  }
}

// ==================== 渲染会所状态页面 ====================
function renderClubPage(data: NightclubData): string {
  let html = '';

  // 经营状况
  if (data.夜总会经营) {
    html += `
      <div class="nightclub-card">
        <div class="nightclub-card-title">
          <span>💼</span>
          <span>经营状况</span>
        </div>
        <div class="nightclub-card-content">
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">VIP客户</span>
            <span class="nightclub-info-value">${safeGet(data, '夜总会经营.VIP客户数', '0')} 人</span>
          </div>
        </div>
      </div>
    `;
  }

  // 地上各区域状态（预留接口）
  html += `
    <div class="nightclub-card">
      <div class="nightclub-card-title">
        <span>🏢</span>
        <span>地上区域</span>
      </div>
      <div class="nightclub-card-content">
          <div class="nightclub-info-row">
          <span class="nightclub-info-label">酒水吧台</span>
          <span class="nightclub-info-value">正常营业</span>
          </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">豪华舞厅</span>
          <span class="nightclub-info-value">正常营业</span>
        </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">KTV包厢</span>
          <span class="nightclub-info-value">正常营业</span>
        </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">VIP休息室</span>
          <span class="nightclub-info-value">正常营业</span>
        </div>
        </div>
      </div>
    `;

  return html;
}

// ==================== 渲染工坊状态页面 ====================
function renderWorkshopPage(data: NightclubData): string {
  let html = '';

  // 地下各区域状态
  html += `
    <div class="nightclub-card">
      <div class="nightclub-card-title">
        <span>🏭</span>
        <span>地下区域</span>
      </div>
      <div class="nightclub-card-content">
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">基础培训中心</span>
          <span class="nightclub-info-value">运行中</span>
        </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">形体塑造中心</span>
          <span class="nightclub-info-value">运行中</span>
        </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">保养护理中心</span>
          <span class="nightclub-info-value">运行中</span>
        </div>
        <div class="nightclub-info-row">
          <span class="nightclub-info-label">当前培养人数</span>
          <span class="nightclub-info-value">${data.工坊培养对象?.当前培养人数 || 0} 人</span>
        </div>
      </div>
    </div>
  `;

  // 待处理订单详情
  if (data.夜总会经营?.待处理订单 && data.夜总会经营.待处理订单.length > 0) {
    const orders = data.夜总会经营.待处理订单;
    html += `
      <div class="nightclub-card">
        <div class="nightclub-card-title">
          <span>📋</span>
          <span>订单详情 (${orders.length})</span>
        </div>
        <div class="nightclub-card-content">
    `;

    orders.forEach(order => {
      const client = order.委托人 || '未知委托人';
      const type = order.需求类型 || '';
      const requirements = order.具体要求 || '';
      const deadline = order.截止日期 || '';

      html += `
        <div class="nightclub-trainee-item">
          <div class="nightclub-trainee-header">
            <span class="nightclub-trainee-name">${client}</span>
          </div>
          ${
            type
              ? `
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">需求类型</span>
            <span class="nightclub-info-value">${type}</span>
          </div>`
              : ''
          }
          ${
            requirements
              ? `
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">具体要求</span>
            <span class="nightclub-info-value">${requirements}</span>
          </div>`
              : ''
          }
          ${
            deadline
              ? `
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">截止日期</span>
            <span class="nightclub-info-value">${deadline}</span>
          </div>`
              : ''
          }
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="nightclub-empty">
        <div class="nightclub-empty-icon">📭</div>
        <div class="nightclub-empty-text">暂无待处理订单</div>
      </div>
    `;
  }

  return html;
}

// ==================== 渲染培养对象页面 ====================
function renderTraineesPage(data: NightclubData): string {
  let html = '';

  if (data.工坊培养对象) {
    const trainees = data.工坊培养对象.培养列表 || [];

    if (trainees.length === 0) {
      html += `
          <div class="nightclub-empty">
            <div class="nightclub-empty-icon">📭</div>
            <div class="nightclub-empty-text">暂无培养对象</div>
          </div>
      `;
    } else {
      html += `
        <div class="nightclub-card">
          <div class="nightclub-card-title">
            <span>👥</span>
            <span>工坊培养对象 (${trainees.length})</span>
          </div>
          <div class="nightclub-card-content">
      `;

      trainees.forEach(trainee => {
        const name = trainee.姓名 || '未知';
        const age = trainee.基本信息?.年龄 || '';
        const origin = trainee.基本信息?.来源 || '';
        const appearance = trainee.基本信息?.原始外貌 || '';
        const progress = typeof trainee.培养进度 === 'number' ? trainee.培养进度 : trainee.培养进度 || '0';
        const order = trainee.定制信息?.对应订单 || '无';
        const target = trainee.定制信息?.目标形象 || '未定';
        const requirements = trainee.定制信息?.特殊要求 || '';

        html += `
          <div class="nightclub-trainee-item">
            <div class="nightclub-trainee-header">
              <span class="nightclub-trainee-name">${name}</span>
            </div>
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">年龄 / 来源</span>
              <span class="nightclub-info-value">${age}岁 / ${origin}</span>
            </div>
            ${
              appearance
                ? `
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">原始外貌</span>
              <span class="nightclub-info-value">${appearance}</span>
            </div>`
                : ''
            }
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">培养进度</span>
              <span class="nightclub-info-value">${progress}%</span>
            </div>
            <div class="nightclub-progress-bar">
              <div class="nightclub-progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">对应订单</span>
              <span class="nightclub-info-value">${order}</span>
            </div>
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">目标形象</span>
              <span class="nightclub-info-value">${target}</span>
            </div>
            ${
              requirements
                ? `
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">特殊要求</span>
              <span class="nightclub-info-value">${requirements}</span>
            </div>`
                : ''
            }
          </div>
        `;
      });

      html += `
        </div>
      </div>
    `;
    }
  }

  return html;
}

// ==================== 渲染已归档页面 ====================
function renderArchivedPage(data: NightclubData): string {
  let html = '';

  if (data.已归档) {
    const archived = data.已归档.档案列表 || [];

    if (archived.length === 0) {
      html += `
          <div class="nightclub-empty">
            <div class="nightclub-empty-icon">📭</div>
            <div class="nightclub-empty-text">暂无归档艺人</div>
          </div>
      `;
    } else {
      html += `
        <div class="nightclub-card">
          <div class="nightclub-card-title">
            <span>📁</span>
            <span>已归档 (${archived.length})</span>
          </div>
          <div class="nightclub-card-content">
      `;

      archived.forEach(artist => {
        const realName = artist.姓名 || '';
        const stageName = artist.艺名 || '未知';
        const description = artist.简述 || '';

        html += `
          <div class="nightclub-trainee-item">
            <div class="nightclub-trainee-header">
              <span class="nightclub-trainee-name">${stageName}${realName ? ` (${realName})` : ''}</span>
            </div>
            ${
              description
                ? `
            <div class="archived-description">
              <span class="archived-description-label">简述：</span><span class="archived-description-text">${description}</span>
            </div>`
                : ''
            }
          </div>
        `;
      });

      html += `
          </div>
          </div>
        `;
    }
  }

  return html;
}

// ==================== 渲染对象侦测页面 ====================
function renderDetectionPage(data: NightclubData): string {
  let html = '';

  // 获取已有的侦测数据
  const detectionData = data.侦测数据 || {};
  const detectionCount = Object.keys(detectionData).length;

  // 辅助函数：将 \n 转换为 <br>
  const formatDetectionText = (text: string): string => {
    return text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
  };

  // 收集所有可侦测的角色
  const availableTargets: Array<{ name: string; category: string; info: string }> = [];

  // 添加培养对象
  if (data.工坊培养对象?.培养列表) {
    data.工坊培养对象.培养列表.forEach(trainee => {
      if (trainee.姓名) {
        availableTargets.push({
          name: trainee.姓名,
          category: '培养对象',
          info: `编号: ${trainee.编号 || '未知'} | 培养进度: ${trainee.培养进度 || '0'}%`,
        });
      }
    });
  }

  // 添加已归档对象
  if (data.已归档?.档案列表) {
    data.已归档.档案列表.forEach(artist => {
      if (artist.艺名) {
        availableTargets.push({
          name: artist.艺名,
          category: '已归档',
          info: artist.简述 || '暂无简述',
        });
      }
    });
  }

  // 添加云舒和云卷
  availableTargets.push(
    { name: '云舒', category: '管理层', info: '会所管理者 | 地上业务负责人' },
    { name: '云卷', category: '管理层', info: '工坊管理者 | 地下业务负责人' },
  );

  html += `
    <div class="nightclub-card">
      <div class="nightclub-card-title">
        <span>🔍</span>
        <span>对象侦测</span>
        </div>
      <div class="nightclub-card-content">
        <!-- 已有侦测结果显示框 -->
        <div class="detection-results-display">
          <div class="detection-results-header">
            <span class="detection-results-title">📊 侦测结果 (${detectionCount})</span>
          </div>
          <div class="detection-results-content">
            ${
              detectionCount === 0
                ? `<div class="detection-results-empty">暂无侦测数据</div>`
                : Object.entries(detectionData)
                    .map(([name, detectionText]) => {
                      const escapedName = name.replace(/'/g, "\\'");
                      const formattedText = formatDetectionText(detectionText);
                      return `
                      <div class="detection-result-item" data-detection-target="${escapedName}">
                        <div class="detection-result-header">
                          <span class="detection-result-name">${name}</span>
                          <span class="detection-result-toggle">点击展开/收起</span>
                        </div>
                        <div class="detection-result-data">
                          <div class="detection-result-data-inner">${formattedText}</div>
                        </div>
                      </div>
                    `;
                    })
                    .join('')
            }
          </div>
        </div>
        
        <!-- 当前选中对象显示框 -->
        <div class="detection-current-display">
          <div class="detection-display-header">
            <span class="detection-display-title">📋 当前选中对象 (${selectedDetectionTargets.size}/3)</span>
            ${
              selectedDetectionTargets.size > 0
                ? `<button class="detection-clear-btn" id="detection-clear-all">清空</button>`
                : ''
            }
          </div>
          <div class="detection-display-content">
            ${
              selectedDetectionTargets.size === 0
                ? `<div class="detection-display-empty">暂未选择任何对象，请从下方列表中选择</div>`
                : Array.from(selectedDetectionTargets)
                    .map(targetName => {
                      const target = availableTargets.find(t => t.name === targetName);
                      if (!target) return '';
                      return `
                      <div class="detection-display-item">
                        <div class="detection-display-item-header">
                          <span class="detection-display-item-name">${target.name}</span>
                          <span class="detection-display-item-category">${target.category}</span>
                          <button class="detection-display-item-remove" data-remove-target="${target.name}">×</button>
                        </div>
      </div>
    `;
                    })
                    .join('')
            }
          </div>
        </div>
        
        <div class="detection-description">
          💡 提示：点击下方卡片选择对象（建议3个以下），侦测将包括：整体情况、神情、嘴部、胸部、乳头、乳晕、屁股、小穴、屁眼等详细数据
        </div>
        
        <div class="detection-targets-grid">
  `;

  availableTargets.forEach(target => {
    const isSelected = selectedDetectionTargets.has(target.name);
    const hasDetectionData = detectionData.hasOwnProperty(target.name);
    const statusClass = hasDetectionData ? 'detected' : isSelected ? 'selected' : '';
    const statusText = hasDetectionData ? '🔍 已侦测' : isSelected ? '✓ 已选择' : '点击选择';

    html += `
      <div class="detection-target-item ${statusClass}" data-target-name="${target.name}" ${hasDetectionData ? 'data-detected="true"' : ''}>
        <div class="detection-target-header">
          <span class="detection-target-name">${target.name}</span>
          <span class="detection-target-category">${target.category}</span>
        </div>
        <div class="detection-target-status">${statusText}</div>
      </div>
    `;
  });

  html += `
        </div>
        
        <div class="detection-actions">
          <button class="detection-action-btn" id="detection-start-btn" ${selectedDetectionTargets.size === 0 ? 'disabled' : ''}>
            🔍 开始侦测
          </button>
          <button class="detection-action-btn detection-remove-btn" id="detection-remove-btn" ${detectionCount === 0 ? 'disabled' : ''}>
            🗑️ 删除侦测数据
          </button>
        </div>
      </div>
    </div>
  `;

  return html;
}

// ==================== 初始化侦测页面事件 ====================
function initializeDetectionEvents(targetDoc: Document): void {
  console.log('🔧 初始化侦测页面事件，当前选中对象:', selectedDetectionTargets);

  // 侦测结果展开/收起事件
  const resultItems = targetDoc.querySelectorAll('.detection-result-item');
  resultItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      const dataElement = (this as HTMLElement).querySelector('.detection-result-data');
      if (dataElement) {
        dataElement.classList.toggle('expanded');
      }
    });
  });

  // 目标选择事件
  const targetItems = targetDoc.querySelectorAll('.detection-target-item');
  console.log('🎯 找到目标卡片数量:', targetItems.length);
  targetItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();

      // 检查是否已有侦测数据，如果有则不响应点击
      const isDetected = (this as HTMLElement).getAttribute('data-detected') === 'true';
      if (isDetected) {
        console.log('⚠️ 该对象已有侦测数据，无法选择');
        return;
      }

      const targetName = (this as HTMLElement).getAttribute('data-target-name');
      console.log('👆 点击了卡片:', targetName);
      if (!targetName) return;

      if (selectedDetectionTargets.has(targetName)) {
        selectedDetectionTargets.delete(targetName);
        console.log('➖ 取消选择:', targetName);
      } else {
        if (selectedDetectionTargets.size >= 3) {
          alert('建议最多选择3个对象进行侦测');
          return;
        }
        selectedDetectionTargets.add(targetName);
        console.log('➕ 添加选择:', targetName);
      }

      console.log('📊 更新后的选中对象:', selectedDetectionTargets);
      // 重新渲染页面
      if (cachedMVUData) {
        renderNightclubData(targetDoc, cachedMVUData);
      }
    });
  });

  // 清空选择按钮
  const clearAllBtn = targetDoc.getElementById('detection-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', e => {
      e.stopPropagation();
      console.log('🗑️ 清空所有选择');
      selectedDetectionTargets.clear();
      if (cachedMVUData) {
        renderNightclubData(targetDoc, cachedMVUData);
      }
    });
  }

  // 移除单个对象按钮
  const removeButtons = targetDoc.querySelectorAll('.detection-display-item-remove');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const targetName = (this as HTMLElement).getAttribute('data-remove-target');
      console.log('❌ 移除单个对象:', targetName);
      if (targetName && selectedDetectionTargets.has(targetName)) {
        selectedDetectionTargets.delete(targetName);
        if (cachedMVUData) {
          renderNightclubData(targetDoc, cachedMVUData);
        }
      }
    });
  });

  // 开始侦测按钮
  const startBtn = targetDoc.getElementById('detection-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (selectedDetectionTargets.size === 0) return;

      const targets = Array.from(selectedDetectionTargets);
      let command = `request: 本回合不要输出正文内容！！！\n\n对以下对象进行详细身体数据侦测：`;

      targets.forEach((target, index) => {
        command += `【${target}】`;
        if (index < targets.length - 1) {
          command += `、`;
        }
      });

      command += `\n\n请侦测以下部位（每个部位描述后用换行符分割）：1. 整体情况 2. 神情 3. 嘴部 4. 胸部 5. 乳头 6. 乳晕 7. 屁股 8. 小穴 9. 屁眼`;

      fillCommand(command);
    });
  }

  // 删除侦测数据按钮
  const removeBtn = targetDoc.getElementById('detection-remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      // 获取所有已侦测的对象
      const detectionData = cachedMVUData?.侦测数据 || {};
      const detectedTargets = Object.keys(detectionData);

      if (detectedTargets.length === 0) return;

      let command = `删除以下对象的侦测数据：\n\n`;

      detectedTargets.forEach(target => {
        command += `_.remove('侦测数据', '${target}')\n`;
      });

      fillCommand(command);

      // 不立即清空选择和重新渲染，等下回合检测到数据被删除后再清理
    });
  }
}

// 填充命令到输入框
function fillCommand(command: string): void {
  try {
    const chatInput = (parent.document || document).querySelector('#send_textarea') as HTMLTextAreaElement;
    if (chatInput) {
      if (chatInput.value.trim() !== '') {
        chatInput.value += '\n\n' + command;
      } else {
        chatInput.value = command;
      }
      chatInput.focus();
      console.log('✅ 命令已填充到输入框');
    } else {
      throw new Error('未找到输入框');
    }
  } catch (e) {
    alert('未能自动找到输入框，请手动复制命令：\n\n' + command);
    console.error('填充命令失败:', e);
  }
}

// ==================== 启动脚本 ====================
// 等待 jQuery 加载完成
function waitForJQuery(callback: () => void): void {
  if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
    console.log('✅ jQuery 已就绪');
    callback();
  } else {
    console.log('⏳ 等待 jQuery...');
    setTimeout(() => waitForJQuery(callback), 100);
  }
}

// 使用 jQuery 的方式初始化（符合项目规范，不使用 DOMContentLoaded）
waitForJQuery(() => {
  $(() => {
    console.log('✅ 开始初始化江畔夜总会状态栏');
    initializeNightclubPlugin();
  });
});

console.log('✅ 江畔夜总会状态栏插件脚本加载完成');

// 导出一个值以使其成为合法的ES Module，支持通过import语句加载
export const __initialized__ = true;
