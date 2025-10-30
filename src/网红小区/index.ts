// ==================== 网红小区 - 公寓管理 ====================
// 使用 TypeScript + 原生实现（参考江畔夜总会的架构）
// 版本：重构版

console.log('🏠 加载网红小区公寓管理插件...');

// ==================== 类型定义 ====================
type AnyObject = Record<string, any>;

// ==================== 样式定义 ====================
/* eslint-disable */
const styles = `
<style id="ngq-plugin-styles">
:root {
  --apt-primary: #ff6b9d;
  --apt-secondary: #c44569;
  --apt-bg: #1a1a2e;
  --apt-card: #16213e;
  --apt-border: rgba(255, 107, 157, 0.2);
  --apt-text: #e8eaf6;
  --apt-dim: #e5e7eb;
}

/* ==================== 拖动按钮 */
.ngq-toggle-btn {
  position: fixed !important;
  top: 100px;
  left: 20px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 10000 !important;
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-size: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.ngq-toggle-btn:hover {
  transform: scale(1.05);
}

.ngq-toggle-btn.dragging {
  cursor: grabbing !important;
  opacity: 0.9;
  z-index: 10001 !important;
  transition: none !important;
}

/* ==================== 主面板容器 */
.ngq-main-panel {
  position: fixed !important;
  top: 50vh !important;
  left: 50vw !important;
  transform: translate(-50%, -50%) !important;
  width: 90vw !important;
  max-width: 900px !important;
  height: 85vh !important;
  max-height: 650px !important;
  background: var(--apt-bg);
  background: linear-gradient(135deg, var(--apt-bg) 0%, #16213e 100%);
  border: 2px solid var(--apt-primary);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 9999 !important;
  display: none;
  flex-direction: column;
  overflow: hidden;
  color: var(--apt-text);
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.ngq-main-panel.active {
  display: flex;
}

.ngq-main-panel.dragging {
  transition: none !important;
}

/* ==================== 头部 */
.ngq-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
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

.ngq-header.dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  transition: none !important;
}

.ngq-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ngq-header-title {
  font-size: 18px;
  font-weight: 700;
}

.ngq-header-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.ngq-close-btn {
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

.ngq-close-btn:hover {
  transform: scale(1.1);
}

/* ==================== 标签页导航 */
.ngq-tabs {
  display: flex;
  flex-shrink: 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.ngq-tab {
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

.ngq-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.ngq-tab.active {
  color: var(--apt-primary);
  border-bottom-color: var(--apt-primary);
}

.ngq-tab-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  background: var(--apt-primary);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

/* ==================== 内容区域 */
.ngq-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.ngq-content::-webkit-scrollbar {
  width: 8px;
}

.ngq-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.ngq-content::-webkit-scrollbar-thumb {
  background: var(--apt-primary);
  border-radius: 4px;
}

/* ==================== 卡片样式 */
.ngq-card {
  background: var(--apt-card);
  border: 1px solid var(--apt-border);
  border-radius: 10px;
  margin-bottom: 16px;
  overflow: hidden;
}

.ngq-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 157, 0.15);
  font-weight: 600;
  font-size: 16px;
}

.ngq-card-body {
  padding: 16px;
}

.ngq-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ngq-info-row:last-child {
  border-bottom: none;
}

.ngq-info-label {
  color: var(--apt-dim);
  font-size: 14px;
}

.ngq-info-value {
  color: var(--apt-text);
  font-weight: 500;
  text-align: right;
}

/* ==================== 楼层样式 */
.ngq-floor-level {
  background: var(--apt-card);
  border: 1px solid var(--apt-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.ngq-floor-level-title {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--apt-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.ngq-floor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

.ngq-room-card {
  border-radius: 10px;
  padding: 18px 12px;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-weight: 600;
  font-size: 0.9em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.ngq-room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.3);
  border-color: var(--apt-primary);
}

.ngq-room-card.bedroom {
  background: linear-gradient(135deg, #592e39 0%, #7a4053 100%);
}

.ngq-room-card.bedroom.vacant {
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.6) 0%, rgba(255, 192, 203, 0.7) 100%);
  border-color: rgba(255, 182, 193, 0.8);
  backdrop-filter: blur(2px);
}

.ngq-room-card.empty {
  background: linear-gradient(135deg, #3d3f47 0%, #4a4f5a 100%);
  border-color: #5a5f6b;
  opacity: 0.7;
}

.ngq-room-card.your {
  background: linear-gradient(135deg, #2e5266 0%, #3a6d8c 100%);
  border-color: #5dade2;
}

/* 公共客厅 - 温馨橙色 */
.ngq-room-card.public-lounge {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  border-color: #fbbf24;
}

/* 健身房 - 活力绿色 */
.ngq-room-card.public-gym {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
}

/* 洗衣间 - 清新蓝色 */
.ngq-room-card.public-laundry {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  border-color: #38bdf8;
}

/* 用户自定义功能性房间 - 半透明绿色 */
.ngq-room-card.custom-functional {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.6) 0%, rgba(52, 211, 153, 0.7) 100%);
  border-color: rgba(52, 211, 153, 0.8);
  opacity: 0.95;
}

/* 合并房间 - 占据双倍宽度 */
.ngq-room-card.merged {
  grid-column: span 2;
}

.ngq-room-name {
  font-weight: bold;
  font-size: 0.95em;
}

.ngq-room-occupant {
  font-size: 0.75em;
  color: var(--apt-dim);
  margin-top: 4px;
}

/* ==================== 租客卡片 */
.ngq-tenant-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.ngq-tenant-card:hover {
  border-color: var(--apt-primary);
  background: rgba(255, 107, 157, 0.1);
  transform: translateX(4px);
}

.ngq-tenant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ngq-tenant-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--apt-primary);
}

.ngq-tenant-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* ==================== 按钮 */
.ngq-btn {
  padding: 10px 16px;
  background: var(--apt-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.ngq-btn:hover:not(:disabled) {
  background: var(--apt-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.ngq-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.4;
}

.ngq-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.ngq-management-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
}

.ngq-management-actions .ngq-btn {
  flex: 1;
  padding: 14px 20px;
  min-width: 0;
}

@media (max-width: 768px) and (orientation: portrait) {
  .ngq-management-actions {
    flex-direction: column;
  }
  
  .ngq-management-actions .ngq-btn {
    width: 100%;
  }
}

.ngq-tenant-actions {
  margin-bottom: 16px;
  text-align: center;
}

/* ==================== 空状态 */
.ngq-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--apt-dim);
}

.ngq-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.ngq-empty-text {
  font-size: 14px;
}

/* ==================== 模态框 */
.ngq-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10500 !important;
  opacity: 1;
  transition: opacity 0.3s;
}

.ngq-modal-overlay.hidden {
  display: none;
  opacity: 0;
}

.ngq-modal-content {
  background: var(--apt-card);
  color: var(--apt-text);
  padding: 28px;
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 2px solid var(--apt-border);
}

.ngq-modal-title {
  margin: 0;
  font-size: 1.4em;
  font-weight: 700;
  color: var(--apt-primary);
}

.ngq-modal-subtitle {
  color: var(--apt-dim);
  margin: 0;
  font-size: 0.95em;
  line-height: 1.5;
}

.ngq-modal-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 8px;
  color: var(--apt-text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.ngq-modal-input:focus {
  border-color: var(--apt-primary);
}

.ngq-modal-input::placeholder {
  color: var(--apt-dim);
}

.ngq-modal-actions {
  display: flex;
  gap: 12px;
}

.ngq-modal-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.ngq-modal-btn-confirm {
  background: var(--apt-primary);
  color: #fff;
}

.ngq-modal-btn-confirm:hover {
  background: var(--apt-secondary);
  transform: translateY(-1px);
}

.ngq-modal-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--apt-text);
}

.ngq-modal-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ==================== 加载状态 */
.ngq-loading {
  text-align: center;
  padding: 40px;
  color: var(--apt-dim);
}

.ngq-loading-icon {
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

/* ==================== 进度条 */
.ngq-progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-top: 6px;
}

.ngq-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ngq-progress-fill.favor {
  background: linear-gradient(90deg, #ff6b9d 0%, #ff8fab 100%);
}

.ngq-progress-fill.lust {
  background: linear-gradient(90deg, #ff4757 0%, #ff6348 100%);
}

.ngq-info-block {
  display: block;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ngq-info-block:last-child {
  border-bottom: none;
}

.ngq-info-block .ngq-info-label {
  display: block;
  margin-bottom: 6px;
}

.ngq-info-block .ngq-info-value {
  display: block;
  text-align: left;
  line-height: 1.5;
}

/* ==================== 移动端适配 */
@media (max-width: 768px) {
  .ngq-main-panel {
    width: 95vw;
    height: 90vh;
  }

  .ngq-toggle-btn {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .ngq-tab {
    font-size: 12px;
    padding: 10px 8px;
  }

  .ngq-toggle-btn {
    pointer-events: auto;
    z-index: 10002;
  }
}

@media (max-width: 480px) and (orientation: portrait) {
  .ngq-main-panel {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    border: none;
  }

  .ngq-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 22px;
  }

  .ngq-tab {
    font-size: 11px;
    padding: 8px 4px;
  }

  .ngq-toggle-btn {
    z-index: 10002;
  }
}

@media (max-height: 600px) and (orientation: landscape) {
  .ngq-main-panel {
    height: 95vh;
    max-height: none;
  }

  .ngq-content {
    padding: 10px;
  }
}

/* ==================== 全局移动端优化 */
* {
  touch-action: manipulation;
}

.ngq-toggle-btn {
  touch-action: none !important;
}

* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.ngq-content {
  -webkit-overflow-scrolling: touch;
}

body {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

@supports (padding: max(0px)) {
  @media (max-width: 480px) {
    .ngq-main-panel {
      padding-top: max(0px, env(safe-area-inset-top));
      padding-bottom: max(0px, env(safe-area-inset-bottom));
      padding-left: max(0px, env(safe-area-inset-left));
      padding-right: max(0px, env(safe-area-inset-right));
    }
  }
}

button:focus,
button:active,
.ngq-toggle-btn:focus,
.ngq-toggle-btn:active,
.ngq-close-btn:focus,
.ngq-close-btn:active,
.ngq-tenant-card:focus,
.ngq-tenant-card:active {
  outline: none;
  outline-color: transparent;
}
</style>
`;
/* eslint-enable */

// ==================== HTML 结构 ====================
const html = `
<!-- 拖动按钮 -->
<div id="ngq-toggle-btn" class="ngq-toggle-btn">
  <span>🏠</span>
</div>

<!-- 主面板 -->
<div id="ngq-main-panel" class="ngq-main-panel">
  <div class="ngq-header">
    <div class="ngq-header-left">
      <div class="ngq-header-title">🏠 网红小区</div>
      <div class="ngq-header-subtitle" id="ngq-time-display">东海市·荟萃城</div>
    </div>
    <button class="ngq-close-btn" id="ngq-close-btn">×</button>
  </div>
  
  <div class="ngq-content" id="ngq-content">
    <div class="ngq-loading">
      <div class="ngq-loading-icon">⏳</div>
      <div>正在加载数据...</div>
    </div>
  </div>
</div>

<!-- 招募租客模态框 -->
<div id="ngq-recruitment-modal" class="ngq-modal-overlay hidden">
  <div class="ngq-modal-content">
    <h2 class="ngq-modal-title">👤 招募新租客</h2>
    <p class="ngq-modal-subtitle">网红小区专注于内容创作者，请输入您期望的租客特征</p>
    <input type="text" id="ngq-recruitment-keywords" class="ngq-modal-input" placeholder="例如：美妆博主、游戏主播、舞蹈UP主">
    <div class="ngq-modal-actions">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" id="ngq-modal-cancel">取消</button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" id="ngq-modal-confirm">确认招募</button>
    </div>
  </div>
</div>

<!-- 房间详情模态框 -->
<div id="ngq-room-modal" class="ngq-modal-overlay hidden">
  <div class="ngq-modal-content" style="max-width: 500px">
    <h2 class="ngq-modal-title" id="ngq-room-modal-title">🏠 房间详情</h2>
    <div id="ngq-room-modal-body"></div>
    <div class="ngq-modal-actions" id="ngq-room-modal-actions">
      <button class="ngq-modal-btn ngq-modal-btn-confirm" id="ngq-room-modal-close" style="width:100%">关闭</button>
    </div>
    <div class="ngq-modal-actions" id="ngq-room-demolish-actions" style="display:none; margin-top: 8px;">
      <button class="ngq-modal-btn" id="ngq-room-demolish" style="width:100%; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
        🗑️ 拆除房间
      </button>
    </div>
  </div>
</div>

<!-- 装修选择模态框 -->
<div id="ngq-renovate-modal" class="ngq-modal-overlay hidden">
  <div class="ngq-modal-content" style="max-width: 450px">
    <h2 class="ngq-modal-title">🔨 装修选择</h2>
    <p class="ngq-modal-subtitle" id="ngq-renovate-room-info">选择要将此空房间装修为何种类型：</p>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
      <button class="ngq-modal-btn ngq-modal-btn-confirm" id="ngq-renovate-suite" style="padding: 16px; font-size: 15px;">
        🏠 标准套间
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">一室一厅一卫一厨，可出租给租客</div>
      </button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" id="ngq-renovate-functional" style="padding: 16px; font-size: 15px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);">
        🔧 功能性房间
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">公共设施（客厅/健身房/洗衣间等）</div>
      </button>
    </div>
    <div class="ngq-modal-actions" style="margin-top: 16px;">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" id="ngq-renovate-cancel" style="width:100%">取消</button>
    </div>
  </div>
</div>

<!-- 功能性房间详情输入模态框 -->
<div id="ngq-functional-input-modal" class="ngq-modal-overlay hidden">
  <div class="ngq-modal-content" style="max-width: 450px">
    <h2 class="ngq-modal-title">🔧 功能性房间详情</h2>
    <p class="ngq-modal-subtitle" id="ngq-functional-room-info">请输入功能性房间的详细信息：</p>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
      <div>
        <label style="display: block; margin-bottom: 6px; color: var(--apt-dim); font-size: 14px;">房间名称</label>
        <input type="text" id="ngq-functional-name" class="ngq-modal-input" placeholder="例如：健身房、影音室、茶室">
      </div>
      <div>
        <label style="display: block; margin-bottom: 6px; color: var(--apt-dim); font-size: 14px;">房间作用</label>
        <input type="text" id="ngq-functional-purpose" class="ngq-modal-input" placeholder="例如：配备跑步机和瑜伽垫，供租客免费使用">
      </div>
    </div>
    <div class="ngq-modal-actions" style="margin-top: 16px;">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" id="ngq-functional-cancel">取消</button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" id="ngq-functional-confirm">确认装修</button>
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
let autoRefreshTimer: number | null = null;
let contentEventsInitialized = false; // 标记内容区事件是否已绑定
let currentRenovatingRoom = ''; // 当前正在装修的房间号
let currentRoomForDemolish = ''; // 当前待拆除的房间号

// ==================== 工具函数 ====================
function safeGetValue(obj: AnyObject | undefined, path: string, defaultValue: string = ''): string {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return defaultValue;
    // 先解包 MVU 数组格式
    if (Array.isArray(current)) {
      current = current[0];
    }
    if (typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }
  // 最后解包 MVU 数组格式
  if (Array.isArray(current)) return current.length > 0 ? String(current[0] ?? defaultValue) : defaultValue;
  if (current === undefined || current === null) return defaultValue;
  return String(current);
}

// ==================== 初始化函数 ====================
function initializeNgqPlugin(): void {
  console.log('🚀 初始化网红小区插件...');

  // 获取目标文档
  let targetDoc: Document;
  try {
    targetDoc = window.top ? window.top.document : document;
  } catch (e) {
    console.warn('⚠️ 无法访问 window.top，使用当前 document');
    targetDoc = document;
  }

  // 检查是否已存在
  if (targetDoc.getElementById('ngq-toggle-btn')) {
    console.log('⚠️ 网红小区插件已存在，先移除旧的');
    targetDoc.getElementById('ngq-toggle-btn')?.remove();
    targetDoc.getElementById('ngq-main-panel')?.remove();
    targetDoc.getElementById('ngq-plugin-styles')?.remove();
    targetDoc.getElementById('ngq-recruitment-modal')?.remove();
    targetDoc.getElementById('ngq-room-modal')?.remove();
    targetDoc.getElementById('ngq-renovate-modal')?.remove();
    targetDoc.getElementById('ngq-functional-input-modal')?.remove();
    // 清理事件
    $(targetDoc).off('.ngq-plugin');
    // 重置事件绑定标志
    contentEventsInitialized = false;
  }

  // 注入样式
  if (!targetDoc.getElementById('ngq-plugin-styles')) {
    targetDoc.head.insertAdjacentHTML('beforeend', styles);
    console.log('✅ 样式已注入');
  }

  // 注入 HTML
  targetDoc.body.insertAdjacentHTML('beforeend', html);
  console.log('✅ HTML 已注入');

  // 从 localStorage 恢复按钮位置
  const btn = targetDoc.getElementById('ngq-toggle-btn');
  if (btn) {
    try {
      const saved = localStorage.getItem('ngq-btn-position');
      if (saved) {
        const pos = JSON.parse(saved);
        // 验证位置是否在屏幕内
        const targetWindow = window.top || window;
        const maxX = $(targetWindow).width()! - 80;
        const maxY = $(targetWindow).height()! - 80;

        // 确保位置有效
        if (pos.left >= 0 && pos.left <= maxX && pos.top >= 0 && pos.top <= maxY) {
          btn.style.left = pos.left + 'px';
          btn.style.top = pos.top + 'px';
          console.log('📍 恢复按钮位置:', pos);
        } else {
          console.log('⚠️ 保存的位置无效，使用默认位置');
        }
      }
    } catch (e) {
      console.warn('⚠️ 恢复按钮位置失败');
    }
  }

  // 初始化按钮拖动功能
  initializeButtonDrag(targetDoc);

  // 初始化面板功能
  initializePanelSystem(targetDoc);

  // 初始化模态框事件
  initializeModalEvents(targetDoc);

  console.log('✅ 网红小区插件初始化完成！');
}

// ==================== 按钮拖动功能 ====================
function initializeButtonDrag(targetDoc: Document): void {
  const btn = targetDoc.getElementById('ngq-toggle-btn');
  const panel = targetDoc.getElementById('ngq-main-panel');
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

    localStorage.setItem('ngq-btn-position', JSON.stringify(position));
    console.log('✅ 按钮拖动结束，保存位置:', position);

    btnDragData = null;

    // 如果是点击（移动距离小于5像素），打开/关闭面板
    if (distance < 5) {
      console.log('🎨 检测到点击，切换面板');
      panel!.classList.toggle('active');
      // 打开面板时加载数据
      if (panel!.classList.contains('active')) {
        currentRetry = 0;
        loadNgqData(targetDoc);
      }
    }
  }

  // 绑定事件
  $(btn!).on('mousedown.ngq-plugin', function (e) {
    if (handleBtnDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $(btn!).on('touchstart.ngq-plugin', function (e) {
    const touch = e.originalEvent!.touches[0];
    if (handleBtnDragStart(touch.clientX, touch.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $targetDoc.on('mousemove.ngq-plugin', function (e) {
    handleBtnDragMove(e.clientX, e.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('touchmove.ngq-plugin', function (e) {
    const touch = e.originalEvent!.touches[0];
    handleBtnDragMove(touch.clientX, touch.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('mouseup.ngq-plugin', function (e) {
    handleBtnDragEnd(e.clientX, e.clientY);
  });

  $targetDoc.on('touchend.ngq-plugin touchcancel.ngq-plugin', function (e) {
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
  const panel = $('#ngq-main-panel', targetDoc)[0];
  const header = $('.ngq-header', targetDoc)[0];
  const $targetDoc = $(targetDoc);

  if (!panel || !header) {
    console.error('❌ 面板或头部元素未找到');
    return;
  }

  function handlePanelDragStart(clientX: number, clientY: number): void {
    console.log('🖱️ 开始拖动面板');
    const rect = panel!.getBoundingClientRect();

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

    panel!.style.setProperty('left', `${newLeft}px`, 'important');
    panel!.style.setProperty('top', `${newTop}px`, 'important');
  }

  function handlePanelDragEnd(): void {
    console.log('🖱️ 面板拖动结束');
    if (panelDragData) {
      const rect = panel!.getBoundingClientRect();
      const savedPosition = {
        left: rect.left,
        top: rect.top,
      };
      localStorage.setItem('ngq-panel-position', JSON.stringify(savedPosition));
      console.log('✅ 面板拖动结束，保存位置:', savedPosition);
    }

    panelDragData = null;
    $(panel!).removeClass('dragging');
    $(header!).removeClass('dragging');
  }

  // 鼠标事件
  $(header!).on('mousedown.ngq-panel-drag', function (e) {
    if ($(e.target).closest('#ngq-close-btn').length > 0) {
      console.log('⚠️ 点击了关闭按钮，跳过拖动');
      return;
    }
    e.preventDefault();
    handlePanelDragStart(e.clientX, e.clientY);
  });

  $targetDoc.on('mousemove.ngq-panel-drag', function (e) {
    handlePanelDragMove(e.clientX, e.clientY);
  });

  $targetDoc.on('mouseup.ngq-panel-drag', function () {
    handlePanelDragEnd();
  });

  // 触摸事件
  $(header!).on('touchstart.ngq-panel-drag', function (e) {
    if ($(e.target).closest('#ngq-close-btn').length > 0) {
      console.log('⚠️ 触摸了关闭按钮，跳过拖动');
      return;
    }
    const touch = e.originalEvent!.touches[0];
    if (touch) {
      e.preventDefault();
      handlePanelDragStart(touch.clientX, touch.clientY);
    }
  });

  $targetDoc.on('touchmove.ngq-panel-drag', function (e) {
    const touch = e.originalEvent!.touches[0];
    if (touch) {
      handlePanelDragMove(touch.clientX, touch.clientY);
    }
  });

  $targetDoc.on('touchend.ngq-panel-drag touchcancel.ngq-panel-drag', function () {
    handlePanelDragEnd();
  });

  // 恢复保存的位置
  const savedPos = localStorage.getItem('ngq-panel-position');
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
  const closeBtn = targetDoc.getElementById('ngq-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = targetDoc.getElementById('ngq-main-panel');
      if (panel) {
        panel.classList.remove('active');
      }
    });
  }

  // 初始化面板拖动
  initializePanelDrag(targetDoc);

  console.log('✅ 面板系统已初始化');
}

// ==================== 数据加载 ====================
async function loadNgqData(targetDoc: Document): Promise<void> {
  try {
    // 检查 MVU 是否可用
    if (typeof Mvu === 'undefined') {
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
          setTimeout(() => loadNgqData(targetDoc), RETRY_DELAY);
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
        setTimeout(() => loadNgqData(targetDoc), RETRY_DELAY);
      } else {
        showError(targetDoc, '未能加载数据');
      }
      return;
    }

    cachedMVUData = data;
    console.log('✅ 数据加载成功', data);

    // 渲染数据
    renderNgqData(targetDoc, data);
  } catch (error) {
    console.error('❌ 加载数据出错:', error);
    showError(targetDoc, '加载出错: ' + (error as Error).message);
  }
}

function showError(targetDoc: Document, message: string): void {
  const contentDiv = targetDoc.getElementById('ngq-content');
  if (contentDiv) {
    contentDiv.innerHTML = `
      <div class="ngq-empty">
        <div class="ngq-empty-icon">⚠️</div>
        <div class="ngq-empty-text">${message}</div>
      </div>
    `;
  }
}

// ==================== 数据渲染 ====================
function renderNgqData(targetDoc: Document, data: AnyObject): void {
  const contentDiv = targetDoc.getElementById('ngq-content');
  const timeDisplay = targetDoc.getElementById('ngq-time-display');

  if (!contentDiv) return;

  // 更新时间显示
  if (timeDisplay) {
    const date =
      `${safeGetValue(data, '世界.年份', '')} ${safeGetValue(data, '世界.日期', '')} ${safeGetValue(data, '世界.星期', '')}`.trim();
    const time = safeGetValue(data, '世界.时间', '');
    const location = safeGetValue(data, '世界.地点', '东海市·荟萃城');
    timeDisplay.textContent = `${location} | ${date} ${time}`;
  }

  // 构建 HTML
  const html = renderOverviewPage(data);

  contentDiv.innerHTML = html;

  // 只在第一次绑定事件（避免重复绑定导致多次触发）
  if (!contentEventsInitialized) {
    initializeContentEvents(targetDoc);
    contentEventsInitialized = true;
    console.log('✅ 内容区事件已绑定（首次）');
  }
}

// ==================== 渲染总览页面 ====================
function renderOverviewPage(data: AnyObject): string {
  if (!data) {
    return '<div class="ngq-empty"><div class="ngq-empty-icon">📭</div><div>暂无数据</div></div>';
  }

  const cfg = data?.公寓?.楼层配置 || {};
  const rooms = (data?.公寓?.房间列表 && data.公寓.房间列表[0]) || {};

  const floors = Object.keys(cfg)
    .filter(k => k !== '$meta')
    .map(k => ({
      key: k,
      order: parseFloat(safeGetValue(cfg[k], '顺序', '0')) || 0,
      name: safeGetValue(cfg[k], '显示名称', k),
      capacity: safeGetValue(cfg[k], '总容量', '10'),
    }))
    .sort((a, b) => b.order - a.order);

  if (floors.length === 0) {
    return '<div class="ngq-empty"><div class="ngq-empty-icon">🏗️</div><div>未找到楼层数据</div></div>';
  }

  let html = '<div style="display:flex;flex-direction:column;gap:12px">';

  floors.forEach(floor => {
    html += renderSingleFloor(floor, rooms);
  });

  html += '</div>';

  // 添加操作按钮
  html += `
    <div class="ngq-card" style="margin-top:16px">
      <div class="ngq-card-title">
        <span>🏢</span>
        <span>小区管理</span>
      </div>
      <div class="ngq-card-body">
        <div class="ngq-management-actions">
          <button class="ngq-btn" data-action="recruit">👤 招募新租客</button>
          <button class="ngq-btn" data-action="buy-floor">🏗️ 购置新楼层</button>
        </div>
        <div class="ngq-management-actions" style="margin-top:12px">
          <button class="ngq-btn" data-action="refresh">🔄 刷新数据</button>
          <button class="ngq-btn" data-action="auto-refresh" id="auto-refresh-btn">⏱️ 自动刷新: 关</button>
        </div>
        <div style="margin-top:12px;padding:12px;background:rgba(255,107,157,0.1);border-radius:8px;font-size:13px;color:var(--apt-dim);line-height:1.5">
          💡 提示：购置新楼层将同时建造4个公寓单元（如四楼：401/402/403/404）
        </div>
      </div>
    </div>
  `;

  return html;
}

function renderSingleFloor(floor: any, rooms: any): string {
  let html = `<div class="ngq-floor-level">`;
  html += `<div class="ngq-floor-level-title">🏢 ${floor.name}</div>`;
  html += `<div class="ngq-floor-grid">`;

  const floorRooms: Array<{ name: string; type: string; tenant: string; position: string }> = [];
  const roomKeys = Object.keys(rooms).filter(k => k !== '$meta');

  roomKeys.forEach(roomKey => {
    const r = rooms[roomKey];
    const layout = r?.布局;
    if (!layout || typeof layout !== 'object') return;

    const floorName = typeof layout.楼层 === 'string' ? layout.楼层 : String(layout.楼层 || '');
    if (floorName !== floor.name) return;

    const type = safeGetValue(r, '类型', '套间');
    const tenant = safeGetValue(r, '住户', '未知');
    const position = typeof layout.位置 === 'string' ? layout.位置 : String(layout.位置 || '');
    floorRooms.push({ name: roomKey, type, tenant, position });
  });

  // 按单元号排序：A/B/C/D区（01/02/03/04）
  floorRooms.sort((a, b) => {
    const getOrder = (pos: string) => {
      if (pos.includes('A区') || pos.includes('01')) return 1;
      if (pos.includes('B区') || pos.includes('02')) return 2;
      if (pos.includes('C区') || pos.includes('03')) return 3;
      if (pos.includes('D区') || pos.includes('04')) return 4;
      return 0;
    };
    const orderDiff = getOrder(a.position) - getOrder(b.position);
    return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name);
  });

  if (floorRooms.length === 0) {
    html += `<div style="padding:20px;text-align:center;color:var(--apt-dim)">该楼层暂无房间</div>`;
    html += `</div></div>`;
    return html;
  }

  // 合并相邻的同类型公共设施
  const mergedRooms: Array<{
    rooms: string[];
    type: string;
    tenant: string;
    isMerged: boolean;
  }> = [];
  const skipIndices = new Set<number>();

  for (let i = 0; i < floorRooms.length; i++) {
    if (skipIndices.has(i)) continue;

    const currentRoom = floorRooms[i];
    const isPublic = ['公共客厅', '健身房'].includes(currentRoom.type);

    // 检查下一个房间是否是相同类型的公共设施
    if (isPublic && i + 1 < floorRooms.length) {
      const nextRoom = floorRooms[i + 1];
      if (nextRoom.type === currentRoom.type) {
        // 合并两个房间
        mergedRooms.push({
          rooms: [currentRoom.name, nextRoom.name],
          type: currentRoom.type,
          tenant: currentRoom.tenant,
          isMerged: true,
        });
        skipIndices.add(i + 1);
        continue;
      }
    }

    // 不合并，单独显示
    mergedRooms.push({
      rooms: [currentRoom.name],
      type: currentRoom.type,
      tenant: currentRoom.tenant,
      isMerged: false,
    });
  }

  // 渲染房间（包括合并的）
  mergedRooms.forEach(roomGroup => {
    const isYourRoom = roomGroup.type === '您的房间';
    const isEmptyRoom = roomGroup.type === '空房间';
    const isSuite = roomGroup.type === '套间';
    const isPublicLounge = roomGroup.type === '公共客厅';
    const isPublicGym = roomGroup.type === '健身房';
    const isPublicLaundry = roomGroup.type === '洗衣间';
    const isDefaultPublic = isPublicLounge || isPublicGym || isPublicLaundry;
    // 用户自定义功能性房间：不是套间、不是您的房间、不是空房间、也不是默认公共设施
    const isCustomFunctional = !isSuite && !isYourRoom && !isEmptyRoom && !isDefaultPublic;
    const isVacant = roomGroup.tenant === '未知' && isSuite;

    let cls = '';
    if (isYourRoom) cls = 'your';
    else if (isEmptyRoom) cls = 'empty';
    else if (isPublicLounge) cls = 'public-lounge';
    else if (isPublicGym) cls = 'public-gym';
    else if (isPublicLaundry) cls = 'public-laundry';
    else if (isCustomFunctional) cls = 'custom-functional';
    else if (isVacant) cls = 'bedroom vacant';
    else cls = 'bedroom';

    if (roomGroup.isMerged) cls += ' merged';

    const tenantDisplay = roomGroup.tenant === '<user>' ? '房东' : roomGroup.tenant === '未知' ? '' : roomGroup.tenant;

    // 图标选择
    let roomIcon = '🏠';
    if (isYourRoom) roomIcon = '👑';
    else if (isEmptyRoom) roomIcon = '🔧';
    else if (isPublicLounge) roomIcon = '🛋️';
    else if (isPublicGym) roomIcon = '💪';
    else if (isPublicLaundry) roomIcon = '🧺';
    else if (isCustomFunctional) roomIcon = '🏢'; // 用户自定义功能性房间使用建筑图标

    // 房间名称显示
    const roomName = roomGroup.isMerged ? `${roomGroup.rooms[0]}-${roomGroup.rooms[1]}` : roomGroup.rooms[0];

    // 房间类型标签
    let typeLabel = '';
    if (isPublicLounge) typeLabel = '公共客厅';
    else if (isPublicGym) typeLabel = '健身房';
    else if (isPublicLaundry) typeLabel = '洗衣间';
    else if (isCustomFunctional) typeLabel = roomGroup.type; // 用户自定义功能性房间显示类型名称

    html += `<div class="ngq-room-card ${cls}" data-room="${roomGroup.rooms[0]}" data-room-type="${roomGroup.type}" data-room-tenant="${roomGroup.tenant}">`;
    html += `<div class="ngq-room-name">${roomIcon} ${roomName}</div>`;
    if (isYourRoom) {
      html += `<div class="ngq-room-occupant">🔑 房东自住</div>`;
    } else if (isEmptyRoom) {
      html += `<div class="ngq-room-occupant">🔨 未装修</div>`;
    } else if (isDefaultPublic) {
      html += `<div class="ngq-room-occupant">✨ ${typeLabel}</div>`;
    } else if (isCustomFunctional) {
      html += `<div class="ngq-room-occupant">🎨 ${typeLabel}</div>`; // 显示房间名称
    } else if (tenantDisplay) {
      html += `<div class="ngq-room-occupant">👤 ${tenantDisplay}</div>`;
    } else {
      html += `<div class="ngq-room-occupant">🏷️ 待出租</div>`;
    }
    html += `</div>`;
  });

  html += `</div></div>`;
  return html;
}

// ==================== 内容事件绑定 ====================
// 注意：此函数只在第一次渲染时调用一次，避免重复绑定事件导致多次触发
function initializeContentEvents(targetDoc: Document): void {
  const content = targetDoc.getElementById('ngq-content');
  if (!content) return;

  // 房间卡片点击事件
  content.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    const roomCard = target.closest('.ngq-room-card') as HTMLElement;
    if (roomCard) {
      e.preventDefault();
      e.stopPropagation();
      const roomName = roomCard.getAttribute('data-room');
      const roomType = roomCard.getAttribute('data-room-type');
      const roomTenant = roomCard.getAttribute('data-room-tenant');
      console.log('🖱️ 点击房间卡片:', { roomName, roomType, roomTenant });
      console.log('🔍 roomCard HTML:', roomCard.outerHTML.substring(0, 200));
      if (roomName) {
        // 如果是空房间，打开装修选择模态框
        if (roomType === '空房间') {
          console.log('✅ 检测到空房间，打开装修选择模态框');
          openRenovateModal(targetDoc, roomName);
        } else {
          // 否则打开房间详情模态框
          console.log('✅ 打开房间详情模态框');
          openRoomModal(targetDoc, roomName, roomType || '', roomTenant || '');
        }
      } else {
        console.warn('⚠️ roomName 为空，无法打开模态框');
      }
      return;
    }
  });

  // 按钮点击事件（使用事件委托）
  content.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (!target.matches('button[data-action]')) return;

    const action = target.getAttribute('data-action');
    const name = target.getAttribute('data-name');

    if (action === 'favor-add' && name) {
      e.preventDefault();
      e.stopPropagation();
      fillCommand(`_.add('租客列表[0].${name}.好感度[0]', 5); // 交互友好，略微提升好感`);
    } else if (action === 'recruit') {
      e.preventDefault();
      e.stopPropagation();
      openRecruitmentModal(targetDoc);
    } else if (action === 'buy-floor') {
      e.preventDefault();
      e.stopPropagation();
      fillCommand(`购置新楼层（需同时建造4个公寓单元：01/02/03/04）`);
    } else if (action === 'refresh') {
      e.preventDefault();
      e.stopPropagation();
      void loadNgqData(targetDoc);
    } else if (action === 'auto-refresh') {
      e.preventDefault();
      e.stopPropagation();
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
        target.textContent = '⏱️ 自动刷新: 关';
      } else {
        autoRefreshTimer = window.setInterval(() => {
          void loadNgqData(targetDoc);
        }, 4000);
        target.textContent = '⏱️ 自动刷新: 开';
      }
    }
  });
}

// ==================== 模态框功能 ====================
function openRecruitmentModal(targetDoc: Document): void {
  const modal = targetDoc.getElementById('ngq-recruitment-modal');
  const input = targetDoc.getElementById('ngq-recruitment-keywords') as HTMLInputElement;
  if (modal && input) {
    modal.classList.remove('hidden');
    // 清空输入框并聚焦
    input.value = '';
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}

function closeRecruitmentModal(targetDoc: Document): void {
  const modal = targetDoc.getElementById('ngq-recruitment-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function confirmRecruitment(targetDoc: Document): void {
  const input = targetDoc.getElementById('ngq-recruitment-keywords') as HTMLInputElement;
  if (input) {
    const keywords = input.value.trim();
    if (keywords) {
      fillCommand(`招募一名符合以下特征的租客：${keywords}`);
    } else {
      alert('请输入租客特征后再确认。');
      return;
    }
    closeRecruitmentModal(targetDoc);
  }
}

// 房间详情模态框
function openRoomModal(targetDoc: Document, roomName: string, roomType: string, tenantName: string): void {
  const modal = targetDoc.getElementById('ngq-room-modal');
  const title = targetDoc.getElementById('ngq-room-modal-title');
  const body = targetDoc.getElementById('ngq-room-modal-body');

  if (!modal || !title || !body || !cachedMVUData) return;

  // 获取完整房间数据
  const roomData = cachedMVUData?.公寓?.房间列表?.[0]?.[roomName];

  // 设置标题
  const isYourRoom = roomType === '您的房间';
  const isPublicLounge = roomType === '公共客厅';
  const isPublicGym = roomType === '健身房';
  const isPublicLaundry = roomType === '洗衣间';
  const isPublic = isPublicLounge || isPublicGym || isPublicLaundry;

  let roomIcon = '🏠';
  if (isYourRoom) roomIcon = '👑';
  else if (isPublicLounge) roomIcon = '🛋️';
  else if (isPublicGym) roomIcon = '💪';
  else if (isPublicLaundry) roomIcon = '🧺';

  title.textContent = `${roomIcon} ${roomName}`;

  // 构建内容
  let content = '';

  if (!roomData) {
    content = '<div class="ngq-empty"><div class="ngq-empty-icon">❓</div><div>房间数据不存在</div></div>';
  } else {
    // 房间基本信息
    content += '<div style="margin-bottom:16px">';
    content += `<div class="ngq-info-row"><span class="ngq-info-label">房间类型</span><span class="ngq-info-value">${roomType}</span></div>`;

    const layout = roomData?.布局;
    if (layout && typeof layout === 'object') {
      const floor = layout.楼层 || '未知';
      const position = layout.位置 || '未知';
      const positionIcon =
        position === 'A区'
          ? '🅰 A区'
          : position === 'B区'
            ? '🅱 B区'
            : position === 'C区'
              ? '🅲 C区'
              : position === 'D区'
                ? '🅳 D区'
                : position;
      content += `<div class="ngq-info-row"><span class="ngq-info-label">所在楼层</span><span class="ngq-info-value">${floor}</span></div>`;
      content += `<div class="ngq-info-row"><span class="ngq-info-label">位置</span><span class="ngq-info-value">${positionIcon}</span></div>`;
    }

    const desc = safeGetValue(roomData, '描述', '');
    if (desc) {
      content += `<div class="ngq-info-row" style="display:block"><span class="ngq-info-label">房间描述</span><div style="margin-top:6px;color:var(--apt-text);line-height:1.5">${desc}</div></div>`;
    }

    content += '</div>';

    // 如果是套间且有租客，显示租客信息
    if (roomType === '套间' && tenantName && tenantName !== '未知') {
      const tenantData = cachedMVUData?.租客列表?.[0]?.[tenantName];

      if (tenantData) {
        content += '<div style="border-top:1px solid var(--apt-border);padding-top:16px;margin-top:8px">';
        content +=
          '<div style="font-size:1.1em;font-weight:600;margin-bottom:12px;color:var(--apt-primary)">👤 租客信息</div>';

        const age = safeGetValue(tenantData, '年龄', '-');
        const job = safeGetValue(tenantData, '职业', '-');
        const creatorType = safeGetValue(tenantData, '创作内容', '-');
        const appearance = safeGetValue(tenantData, '外貌', '-');
        const personality = safeGetValue(tenantData, '性格', '-');
        const favorValue = parseInt(safeGetValue(tenantData, '好感度', '0')) || 0;
        const lustValue = parseInt(safeGetValue(tenantData, '性欲', '0')) || 0;
        const days = safeGetValue(tenantData, '入住天数', '0');
        const state = safeGetValue(tenantData, '状态', '-');
        const mood = safeGetValue(tenantData, '内心', '-');

        // 基本信息
        content += `<div class="ngq-info-row"><span class="ngq-info-label">姓名</span><span class="ngq-info-value">${tenantName}</span></div>`;
        content += `<div class="ngq-info-row"><span class="ngq-info-label">年龄</span><span class="ngq-info-value">${age}岁</span></div>`;
        content += `<div class="ngq-info-row"><span class="ngq-info-label">职业</span><span class="ngq-info-value">📱 ${job}</span></div>`;
        content += `<div class="ngq-info-row"><span class="ngq-info-label">创作内容</span><span class="ngq-info-value">✨ ${creatorType}</span></div>`;

        // 好感度进度条
        content += `<div class="ngq-info-block">`;
        content += `<span class="ngq-info-label">❤️ 好感度</span>`;
        content += `<div class="ngq-progress-bar">`;
        content += `<div class="ngq-progress-fill favor" style="width:${favorValue}%">${favorValue}</div>`;
        content += `</div></div>`;

        // 性欲进度条
        content += `<div class="ngq-info-block">`;
        content += `<span class="ngq-info-label">🔥 性欲</span>`;
        content += `<div class="ngq-progress-bar">`;
        content += `<div class="ngq-progress-fill lust" style="width:${lustValue}%">${lustValue}</div>`;
        content += `</div></div>`;

        // 长文本信息（块级显示）
        content += `<div class="ngq-info-block"><span class="ngq-info-label">外貌特征</span><div class="ngq-info-value">${appearance}</div></div>`;
        content += `<div class="ngq-info-block"><span class="ngq-info-label">性格</span><div class="ngq-info-value">${personality}</div></div>`;
        content += `<div class="ngq-info-block"><span class="ngq-info-label">当前状态</span><div class="ngq-info-value">${state}</div></div>`;
        content += `<div class="ngq-info-block"><span class="ngq-info-label">内心想法</span><div class="ngq-info-value">${mood}</div></div>`;

        // 其他信息（行内显示）
        content += `<div class="ngq-info-row"><span class="ngq-info-label">入住天数</span><span class="ngq-info-value">📅 ${days}天</span></div>`;

        content += '</div>';
      }
    } else if (roomType === '套间') {
      content += '<div style="text-align:center;padding:20px;color:var(--apt-dim)">🏠 该套间暂无租客入住</div>';
    } else if (isYourRoom) {
      content += '<div style="text-align:center;padding:20px;color:var(--apt-dim)">👑 这是您的私人套间</div>';
    } else if (isPublic) {
      // 显示公共设施信息
      const desc = typeof roomData?.描述 === 'string' ? roomData.描述 : '';
      const funcArea = typeof roomData?.功能区 === 'string' ? roomData.功能区 : '';

      // 根据设施类型设置标题颜色
      let facilityColor = 'var(--apt-primary)';
      let facilityIcon = '✨';
      if (isPublicLounge) {
        facilityColor = '#f59e0b';
        facilityIcon = '🛋️';
      } else if (isPublicGym) {
        facilityColor = '#10b981';
        facilityIcon = '💪';
      } else if (isPublicLaundry) {
        facilityColor = '#0ea5e9';
        facilityIcon = '🧺';
      }

      content += `<div style="text-align:center;padding:20px;color:var(--apt-text)">`;
      content += `<div style="font-size:16px;font-weight:600;color:${facilityColor};margin-bottom:16px">${facilityIcon} ${roomType}</div>`;
      if (desc) {
        content += `<div style="margin-bottom:12px;font-size:14px;color:var(--apt-dim);line-height:1.6">${desc}</div>`;
      }
      if (funcArea) {
        content += `<div style="font-size:13px;color:${facilityColor};margin-top:12px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px">🔧 ${funcArea}</div>`;
      }
      content += `<div style="margin-top:16px;font-size:13px;color:var(--apt-dim);padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px dashed ${facilityColor}">✨ 免费对所有租客开放</div>`;
      content += `</div>`;
    }
  }

  body.innerHTML = content;

  // 判断是否显示拆除按钮
  const demolishActionsDiv = targetDoc.getElementById('ngq-room-demolish-actions');
  if (demolishActionsDiv) {
    // 默认公共设施房间号（不可拆除）
    const defaultPublicRooms = ['101', '102', '103', '104', '204', '304'];

    // 判断是否可拆除
    const canDemolish =
      !isYourRoom && // 不是用户的房间
      !defaultPublicRooms.includes(roomName) && // 不是默认公共设施
      (roomType === '套间' ? tenantName === '未知' : true); // 套间需无人入住

    if (canDemolish) {
      demolishActionsDiv.style.display = 'flex';
      currentRoomForDemolish = roomName;
    } else {
      demolishActionsDiv.style.display = 'none';
      currentRoomForDemolish = '';
    }
  }

  modal.classList.remove('hidden');
}

function closeRoomModal(targetDoc: Document): void {
  const modal = targetDoc.getElementById('ngq-room-modal');
  if (modal) {
    modal.classList.add('hidden');
    currentRoomForDemolish = '';
  }
}

// 拆除房间
function demolishRoom(targetDoc: Document): void {
  if (!currentRoomForDemolish) return;

  const confirmed = confirm(`确定要拆除 ${currentRoomForDemolish} 吗？\n拆除后将变为空房间，需要重新装修才能使用。`);

  if (confirmed) {
    const command = `拆除 ${currentRoomForDemolish}，将其还原为空房间状态`;
    fillCommand(command);
    closeRoomModal(targetDoc);
  }
}

// ==================== 装修选择模态框 ====================
function openRenovateModal(targetDoc: Document, roomName: string): void {
  console.log('🔍 openRenovateModal 被调用，传入的 roomName:', roomName, '类型:', typeof roomName);

  const modal = targetDoc.getElementById('ngq-renovate-modal');
  const info = targetDoc.getElementById('ngq-renovate-room-info');

  if (!modal || !info) {
    console.error('❌ 找不到装修模态框元素');
    return;
  }

  currentRenovatingRoom = roomName;
  console.log('✅ 已设置 currentRenovatingRoom:', currentRenovatingRoom);
  info.textContent = `选择要将 ${roomName} 装修为何种类型：`;
  modal.classList.remove('hidden');
}

function closeRenovateModal(targetDoc: Document, clearRoomName = true): void {
  const modal = targetDoc.getElementById('ngq-renovate-modal');
  if (modal) {
    modal.classList.add('hidden');
    // 只有在需要时才清空房间号（装修为标准套间时清空，转到功能性房间输入时保留）
    if (clearRoomName) {
      currentRenovatingRoom = '';
    }
  }
}

function renovateToSuite(targetDoc: Document): void {
  if (!currentRenovatingRoom) return;

  const command = `将 ${currentRenovatingRoom} 装修为标准套间（一室一厅一卫一厨，35-50㎡）`;
  fillCommand(command);
  closeRenovateModal(targetDoc);
}

function renovateToFunctional(targetDoc: Document): void {
  if (!currentRenovatingRoom) return;

  // 先打开功能性房间输入模态框，再关闭装修选择模态框（不清空 currentRenovatingRoom）
  openFunctionalInputModal(targetDoc);
  closeRenovateModal(targetDoc, false); // 传入 false 保留房间号
}

// ==================== 功能性房间详情输入模态框 ====================
function openFunctionalInputModal(targetDoc: Document): void {
  console.log('🔍 openFunctionalInputModal 被调用，房间号:', currentRenovatingRoom);

  const modal = targetDoc.getElementById('ngq-functional-input-modal');
  const info = targetDoc.getElementById('ngq-functional-room-info');
  const nameInput = targetDoc.getElementById('ngq-functional-name') as HTMLInputElement;
  const purposeInput = targetDoc.getElementById('ngq-functional-purpose') as HTMLInputElement;

  console.log('🔍 找到的元素:', { modal, info, nameInput, purposeInput });

  if (!modal || !info || !nameInput || !purposeInput) {
    console.error('❌ 缺少必要元素，无法打开模态框');
    return;
  }

  info.textContent = `请输入 ${currentRenovatingRoom} 的详细信息：`;
  nameInput.value = '';
  purposeInput.value = '';
  modal.classList.remove('hidden');
  setTimeout(() => nameInput.focus(), 100);
  console.log('✅ 功能性房间输入模态框已打开');
}

function closeFunctionalInputModal(targetDoc: Document): void {
  const modal = targetDoc.getElementById('ngq-functional-input-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function confirmFunctionalRenovate(targetDoc: Document): void {
  console.log('🔍 confirmFunctionalRenovate 被调用');
  console.log('🔍 currentRenovatingRoom:', currentRenovatingRoom);

  if (!currentRenovatingRoom) {
    console.warn('⚠️ currentRenovatingRoom 为空，退出');
    return;
  }

  const nameInput = targetDoc.getElementById('ngq-functional-name') as HTMLInputElement;
  const purposeInput = targetDoc.getElementById('ngq-functional-purpose') as HTMLInputElement;

  console.log('🔍 找到的输入框:', { nameInput, purposeInput });

  const name = nameInput?.value.trim() || '';
  const purpose = purposeInput?.value.trim() || '';

  console.log('🔍 输入值:', { name, purpose });

  if (!name) {
    alert('请输入房间名称');
    nameInput?.focus();
    return;
  }

  if (!purpose) {
    alert('请输入房间作用');
    purposeInput?.focus();
    return;
  }

  const command = `将 ${currentRenovatingRoom} 装修为功能性房间【${name}】，作用：${purpose}`;
  console.log('✅ 生成命令:', command);
  fillCommand(command);
  closeFunctionalInputModal(targetDoc);
  currentRenovatingRoom = '';
}

function initializeModalEvents(targetDoc: Document): void {
  // 确认按钮
  const confirmBtn = targetDoc.getElementById('ngq-modal-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmRecruitment(targetDoc);
    });
  }

  // 取消按钮
  const cancelBtn = targetDoc.getElementById('ngq-modal-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeRecruitmentModal(targetDoc);
    });
  }

  // 点击背景关闭
  const modal = targetDoc.getElementById('ngq-recruitment-modal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeRecruitmentModal(targetDoc);
      }
    });
  }

  // 回车确认
  const input = targetDoc.getElementById('ngq-recruitment-keywords') as HTMLInputElement;
  if (input) {
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        confirmRecruitment(targetDoc);
      }
    });
  }

  // 房间详情模态框关闭按钮
  const roomCloseBtn = targetDoc.getElementById('ngq-room-modal-close');
  if (roomCloseBtn) {
    roomCloseBtn.addEventListener('click', () => {
      closeRoomModal(targetDoc);
    });
  }

  // 房间详情模态框拆除按钮
  const roomDemolishBtn = targetDoc.getElementById('ngq-room-demolish');
  if (roomDemolishBtn) {
    roomDemolishBtn.addEventListener('click', () => {
      demolishRoom(targetDoc);
    });
  }

  // 点击背景关闭房间模态框
  const roomModal = targetDoc.getElementById('ngq-room-modal');
  if (roomModal) {
    roomModal.addEventListener('click', e => {
      if (e.target === roomModal) {
        closeRoomModal(targetDoc);
      }
    });
  }

  // 装修模态框 - 装修为标准套间
  const renovateSuiteBtn = targetDoc.getElementById('ngq-renovate-suite');
  if (renovateSuiteBtn) {
    renovateSuiteBtn.addEventListener('click', () => {
      renovateToSuite(targetDoc);
    });
  }

  // 装修模态框 - 装修为功能性房间
  const renovateFunctionalBtn = targetDoc.getElementById('ngq-renovate-functional');
  if (renovateFunctionalBtn) {
    renovateFunctionalBtn.addEventListener('click', () => {
      renovateToFunctional(targetDoc);
    });
  }

  // 装修模态框 - 取消按钮
  const renovateCancelBtn = targetDoc.getElementById('ngq-renovate-cancel');
  if (renovateCancelBtn) {
    renovateCancelBtn.addEventListener('click', () => {
      closeRenovateModal(targetDoc);
    });
  }

  // 点击背景关闭装修模态框
  const renovateModal = targetDoc.getElementById('ngq-renovate-modal');
  if (renovateModal) {
    renovateModal.addEventListener('click', e => {
      if (e.target === renovateModal) {
        closeRenovateModal(targetDoc);
      }
    });
  }

  // 功能性房间输入模态框 - 确认按钮
  const functionalConfirmBtn = targetDoc.getElementById('ngq-functional-confirm');
  console.log('🔍 功能性房间确认按钮:', functionalConfirmBtn);
  if (functionalConfirmBtn) {
    functionalConfirmBtn.addEventListener('click', () => {
      console.log('🖱️ 功能性房间确认按钮被点击');
      confirmFunctionalRenovate(targetDoc);
    });
  } else {
    console.error('❌ 未找到功能性房间确认按钮 (ngq-functional-confirm)');
  }

  // 功能性房间输入模态框 - 取消按钮
  const functionalCancelBtn = targetDoc.getElementById('ngq-functional-cancel');
  if (functionalCancelBtn) {
    functionalCancelBtn.addEventListener('click', () => {
      closeFunctionalInputModal(targetDoc);
      currentRenovatingRoom = '';
    });
  }

  // 点击背景关闭功能性房间输入模态框
  const functionalModal = targetDoc.getElementById('ngq-functional-input-modal');
  if (functionalModal) {
    functionalModal.addEventListener('click', e => {
      if (e.target === functionalModal) {
        closeFunctionalInputModal(targetDoc);
        currentRenovatingRoom = '';
      }
    });
  }

  // 功能性房间输入模态框 - 回车确认
  const functionalNameInput = targetDoc.getElementById('ngq-functional-name') as HTMLInputElement;
  const functionalPurposeInput = targetDoc.getElementById('ngq-functional-purpose') as HTMLInputElement;
  if (functionalNameInput && functionalPurposeInput) {
    [functionalNameInput, functionalPurposeInput].forEach(input => {
      input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          confirmFunctionalRenovate(targetDoc);
        }
      });
    });
  }

  console.log('✅ 模态框事件已初始化');
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
function waitForJQuery(callback: () => void): void {
  if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
    console.log('✅ jQuery 已就绪');
    callback();
  } else {
    console.log('⏳ 等待 jQuery...');
    setTimeout(() => waitForJQuery(callback), 100);
  }
}

// 使用 jQuery 的方式初始化
waitForJQuery(() => {
  $(() => {
    console.log('✅ 开始初始化网红小区插件');
    initializeNgqPlugin();
  });
});

console.log('✅ 网红小区插件脚本加载完成');

// 导出一个值以使其成为合法的ES Module
export const __initialized__ = true;
