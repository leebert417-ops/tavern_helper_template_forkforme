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
      订单编号?: string;
      客户代号?: string;
      需求类型?: string;
      具体要求?: string;
      截止日期?: string;
      状态?: string;
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
        培养天数?: number | string;
      };
      培养进度?: number | string;
      定制信息?: {
        对应订单?: string;
        目标形象?: string;
        特殊要求?: string;
      };
      当前状态?: string;
      备注?: string[];
    }>;
  };
  已归档艺人?: {
    总数?: number | string;
    档案列表?: Array<{
      编号?: string;
      艺名?: string;
      类型?: string;
      年龄?: number | string;
      来源?: string;
      特征?: string;
      当前状态?: string;
      [key: string]: any;
    }>;
  };
}

// ==================== 样式定义 ====================
const styles = `
<style id="nightclub-plugin-styles">
:root {
  --nightclub-primary: #e94560;
  --nightclub-bg-dark: #1a1a2e;
  --nightclub-bg-mid: #16213e;
  --nightclub-text-light: #eee;
  --nightclub-text-dim: #aaa;
}

/* 拖动按钮 */
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
  transition: transform 0.2s;
}

.nightclub-toggle-btn:hover {
  transform: scale(1.05);
}

.nightclub-toggle-btn.dragging {
  cursor: grabbing !important;
  opacity: 0.9;
  z-index: 10001 !important;
}

/* 主面板容器 */
.nightclub-main-panel {
  position: fixed !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw !important;
  max-width: 800px !important;
  height: 85vh !important;
  max-height: 600px !important;
  background: linear-gradient(135deg, var(--nightclub-bg-dark) 0%, var(--nightclub-bg-mid) 100%);
  border: 2px solid var(--nightclub-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(233, 69, 96, 0.4);
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
  opacity: 0.95;
  z-index: 10000 !important;
  transition: none !important;
}

/* 头部 */
.nightclub-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--nightclub-primary) 0%, #c8365a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.nightclub-header.dragging {
  cursor: grabbing !important;
}

.nightclub-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nightclub-header-title {
  font-size: 18px;
  font-weight: 700;
}

.nightclub-header-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.nightclub-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nightclub-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 内容区域 */
.nightclub-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.nightclub-content::-webkit-scrollbar {
  width: 8px;
}

.nightclub-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.nightclub-content::-webkit-scrollbar-thumb {
  background: var(--nightclub-primary);
  border-radius: 4px;
}

/* 卡片样式 */
.nightclub-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.nightclub-card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--nightclub-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.nightclub-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nightclub-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nightclub-info-label {
  color: var(--nightclub-text-dim);
  font-size: 14px;
}

.nightclub-info-value {
  color: var(--nightclub-text-light);
  font-size: 14px;
  font-weight: 600;
}

/* 进度条 */
.nightclub-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}

.nightclub-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--nightclub-primary) 0%, #ff6b81 100%);
  transition: width 0.3s;
}

/* 培养对象列表 */
.nightclub-trainee-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.nightclub-trainee-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--nightclub-primary);
  transform: translateX(4px);
}

.nightclub-trainee-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.nightclub-trainee-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--nightclub-text-light);
}

.nightclub-trainee-status {
  font-size: 12px;
  color: var(--nightclub-text-dim);
}

/* 归档艺人 */
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
}

.nightclub-archived-name {
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--nightclub-text-light);
}

.nightclub-archived-type {
  font-size: 12px;
  color: var(--nightclub-text-dim);
}

/* 空状态 */
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

/* 加载状态 */
.nightclub-loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--nightclub-primary);
}

.nightclub-loading-icon {
  font-size: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nightclub-main-panel {
    width: 95vw !important;
    height: 90vh !important;
    max-height: none !important;
  }
  
  .nightclub-toggle-btn {
    width: 56px;
    height: 56px;
    font-size: 24px;
    /* 确保按钮可交互 */
    pointer-events: auto !important;
  }
  
  .nightclub-header {
    padding: 12px 16px;
  }
  
  .nightclub-header-title {
    font-size: 16px !important;
  }
  
  .nightclub-header-subtitle {
    font-size: 11px !important;
  }
  
  .nightclub-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .nightclub-card-title {
    font-size: 14px;
  }
}

/* 竖屏优化 */
@media (max-width: 480px) and (orientation: portrait) {
  .nightclub-main-panel {
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
    max-width: none !important;
  }
  
  .nightclub-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 22px;
    /* 确保按钮在小屏幕下也能正常工作 */
    z-index: 10002 !important;
    pointer-events: auto !important;
  }
  
  .nightclub-content {
    padding: 12px;
  }
  
  .nightclub-archived-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 横屏优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .nightclub-main-panel {
    height: 95vh !important;
    max-height: none !important;
  }
  
  .nightclub-header {
    padding: 10px 16px;
  }
  
  .nightclub-content {
    padding: 12px 16px;
  }
}

/* ==================== 全局移动端优化 ==================== */

/* 防止双击缩放 */
* {
  touch-action: manipulation;
}

/* 移除触摸高亮 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* 优化滚动体验（iOS 平滑滚动） */
.nightclub-content {
  -webkit-overflow-scrolling: touch;
}

/* 移动端字体优化 */
@media (max-width: 768px) {
  body {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
}

/* 支持刘海屏等安全区域 - 仅在小屏幕应用 */
@media (max-width: 768px) {
  @supports (padding: max(0px)) {
    .nightclub-main-panel {
      padding-top: max(0px, env(safe-area-inset-top)) !important;
      padding-bottom: max(0px, env(safe-area-inset-bottom)) !important;
      padding-left: max(0px, env(safe-area-inset-left)) !important;
      padding-right: max(0px, env(safe-area-inset-right)) !important;
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
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
}
</style>
`;

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
  hasDragged: boolean;
} | null = null;
let panelDragData: {
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
  hasDragged: boolean;
} | null = null;
let cachedMVUData: any = null;
const MAX_RETRIES = 5;
const RETRY_DELAY = 400;
let currentRetry = 0;
const DRAG_THRESHOLD = 5; // 拖动阈值（像素），小于此值视为点击

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
    $(targetDoc).off('.nightclub-panel');
    $(window).off('.nightclub-panel');
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
  if (!btn || !panel) return;

  const $targetDoc = $(targetDoc);

  // 拖动开始
  function handleBtnDragStart(clientX: number, clientY: number): boolean {
    if (btnDragData) return false;

    const computedStyle = window.getComputedStyle(btn);
    const currentLeft = parseInt(computedStyle.left) || 0;
    const currentTop = parseInt(computedStyle.top) || 0;

    btnDragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: currentLeft,
      initialTop: currentTop,
      hasDragged: false, // 初始化为未拖动
    };

    console.log('🖱️ 准备拖动按钮');
    return true;
  }

  // 拖动移动
  function handleBtnDragMove(clientX: number, clientY: number): void {
    if (!btnDragData) return;

    const deltaX = clientX - btnDragData.startX;
    const deltaY = clientY - btnDragData.startY;

    // 检查是否超过拖动阈值
    if (!btnDragData.hasDragged && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
      btnDragData.hasDragged = true;
      btn.classList.add('dragging');
      console.log('🖱️ 开始拖动按钮');
    }

    // 只有真正拖动时才移动
    if (btnDragData.hasDragged) {
      let newLeft = btnDragData.initialLeft + deltaX;
      let newTop = btnDragData.initialTop + deltaY;

      // 限制范围
      let targetWindow: Window;
      try {
        targetWindow = window.top || window;
      } catch (e) {
        targetWindow = window;
      }
      const maxX = $(targetWindow).width()! - 80;
      const maxY = $(targetWindow).height()! - 80;

      newLeft = Math.max(0, Math.min(newLeft, maxX));
      newTop = Math.max(0, Math.min(newTop, maxY));

      btn.style.left = newLeft + 'px';
      btn.style.top = newTop + 'px';
    }
  }

  // 拖动结束
  function handleBtnDragEnd(clientX: number, clientY: number): void {
    if (!btnDragData) return;

    const wasDragged = btnDragData.hasDragged;

    btn.classList.remove('dragging');

    // 保存位置
    if (wasDragged) {
      const computedStyle = window.getComputedStyle(btn);
      const currentLeft = parseInt(computedStyle.left) || 0;
      const currentTop = parseInt(computedStyle.top) || 0;

      const position = {
        left: currentLeft,
        top: currentTop,
      };

      localStorage.setItem('nightclub-btn-position', JSON.stringify(position));
      console.log('✅ 按钮拖动结束，保存位置:', position);
    }

    btnDragData = null;

    // 如果没有真正拖动，视为点击
    if (!wasDragged) {
      console.log('🎨 检测到点击，切换面板');
      togglePanel(targetDoc);
    }
  }

  // 绑定事件
  $(btn).on('mousedown.nightclub-plugin', function (e) {
    if (handleBtnDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // 触摸事件需要特殊处理，防止干扰默认滚动
  btn.addEventListener(
    'touchstart',
    function (e: TouchEvent) {
      const touch = e.touches[0];
      if (handleBtnDragStart(touch.clientX, touch.clientY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { passive: false }, // 必须为 false 才能调用 preventDefault
  );

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

  // 初始化面板拖动功能
  initializePanelDrag(targetDoc);

  console.log('✅ 面板系统已初始化');
}

// ==================== 面板拖动功能 ====================
function initializePanelDrag(targetDoc: Document): void {
  const panel = targetDoc.getElementById('nightclub-main-panel');
  const header = targetDoc.getElementById('nightclub-close-btn')?.parentElement;

  if (!panel || !header) return;

  const $targetDoc = $(targetDoc);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 从 localStorage 恢复面板位置
  function restorePanelPosition() {
    try {
      const saved = localStorage.getItem('nightclub-panel-position');
      if (saved) {
        const pos = JSON.parse(saved);
        // 检查是否在移动端竖屏模式
        const isPortraitMobile = window.innerWidth <= 480 && window.innerWidth < window.innerHeight;

        if (!isPortraitMobile) {
          panel.style.transform = 'none';
          panel.style.left = pos.left + 'px';
          panel.style.top = pos.top + 'px';
          console.log('📍 恢复面板位置:', pos);
        }
      }
    } catch (e) {
      console.warn('⚠️ 恢复面板位置失败');
    }
  }

  // 拖动开始
  function handlePanelDragStart(clientX: number, clientY: number): boolean {
    if (panelDragData) return false;

    // 检查是否在移动端竖屏模式（全屏模式不允许拖动）
    const isPortraitMobile = window.innerWidth <= 480 && window.innerWidth < window.innerHeight;
    if (isPortraitMobile) return false;

    const rect = panel.getBoundingClientRect();

    panelDragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasDragged: false, // 初始化为未拖动
    };

    console.log('🖱️ 准备拖动面板');
    return true;
  }

  // 拖动移动
  function handlePanelDragMove(clientX: number, clientY: number): void {
    if (!panelDragData) return;

    const deltaX = clientX - panelDragData.startX;
    const deltaY = clientY - panelDragData.startY;

    // 检查是否超过拖动阈值
    if (!panelDragData.hasDragged && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
      panelDragData.hasDragged = true;
      panel.classList.add('dragging');
      header.classList.add('dragging');
      console.log('🖱️ 开始拖动面板');
    }

    // 只有真正拖动时才移动
    if (panelDragData.hasDragged) {
      let newLeft = panelDragData.initialLeft + deltaX;
      let newTop = panelDragData.initialTop + deltaY;

      // 获取面板尺寸
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;

      // 限制范围（至少保留 50px 在视口内）
      let targetWindow: Window;
      try {
        targetWindow = window.top || window;
      } catch (e) {
        targetWindow = window;
      }
      const viewportWidth = $(targetWindow).width()!;
      const viewportHeight = $(targetWindow).height()!;

      newLeft = Math.max(-panelWidth + 50, Math.min(newLeft, viewportWidth - 50));
      newTop = Math.max(0, Math.min(newTop, viewportHeight - 50));

      // 移除 transform，使用 left/top 定位
      panel.style.transform = 'none';
      panel.style.left = newLeft + 'px';
      panel.style.top = newTop + 'px';
    }
  }

  // 拖动结束
  function handlePanelDragEnd(): void {
    if (!panelDragData) return;

    const wasDragged = panelDragData.hasDragged;

    panel.classList.remove('dragging');
    header.classList.remove('dragging');

    // 保存位置
    if (wasDragged) {
      const rect = panel.getBoundingClientRect();
      const position = {
        left: rect.left,
        top: rect.top,
      };

      localStorage.setItem('nightclub-panel-position', JSON.stringify(position));
      console.log('✅ 面板拖动结束，保存位置:', position);
    }

    panelDragData = null;
  }

  // 绑定鼠标事件
  $(header).on('mousedown.nightclub-panel', function (e) {
    // 不处理关闭按钮的点击
    if ((e.target as HTMLElement).closest('.nightclub-close-btn')) {
      return;
    }

    if (handlePanelDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // 绑定触摸事件（使用原生事件以支持 passive 选项）
  header.addEventListener(
    'touchstart',
    function (e: TouchEvent) {
      // 不处理关闭按钮的触摸
      if ((e.target as HTMLElement).closest('.nightclub-close-btn')) {
        return;
      }

      const touch = e.touches[0];
      if (handlePanelDragStart(touch.clientX, touch.clientY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { passive: false }, // 必须为 false 才能调用 preventDefault
  );

  $targetDoc.on('mousemove.nightclub-panel', function (e) {
    handlePanelDragMove(e.clientX, e.clientY);
    if (panelDragData) e.preventDefault();
  });

  $targetDoc.on('touchmove.nightclub-panel', function (e) {
    const touch = e.originalEvent!.touches[0];
    handlePanelDragMove(touch.clientX, touch.clientY);
    if (panelDragData) e.preventDefault();
  });

  $targetDoc.on('mouseup.nightclub-panel', function () {
    handlePanelDragEnd();
  });

  $targetDoc.on('touchend.nightclub-panel touchcancel.nightclub-panel', function () {
    handlePanelDragEnd();
  });

  // 窗口大小改变时重置位置（如果切换到移动端竖屏）
  $(window).on('resize.nightclub-panel orientationchange.nightclub-panel', function () {
    const isPortraitMobile = window.innerWidth <= 480 && window.innerWidth < window.innerHeight;
    if (isPortraitMobile) {
      // 移动端竖屏模式，重置为全屏
      panel.style.transform = 'none';
      panel.style.left = '0';
      panel.style.top = '0';
    } else {
      // 非移动端竖屏，恢复保存的位置或居中
      restorePanelPosition();
    }
  });

  // 恢复位置
  restorePanelPosition();

  console.log('✅ 面板拖动功能已初始化');
}

function togglePanel(targetDoc: Document): void {
  const panel = targetDoc.getElementById('nightclub-main-panel');
  if (!panel) return;

  const isActive = panel.classList.contains('active');

  if (isActive) {
    panel.classList.remove('active');
  } else {
    panel.classList.add('active');
    // 打开面板时加载数据
    currentRetry = 0;
    loadNightclubData(targetDoc);
  }
}

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
    timeDisplay.textContent = `${dateText} ${timeText} | ${statusText}`;
  }

  // 构建 HTML
  let html = '';

  // 1. 经营状况卡片
  if (data.夜总会经营) {
    html += `
      <div class="nightclub-card">
        <div class="nightclub-card-title">
          <span>💼</span>
          <span>经营状况</span>
        </div>
        <div class="nightclub-card-content">
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">在职员工</span>
            <span class="nightclub-info-value">${safeGet(data, '夜总会经营.在职员工数', '0')} 人</span>
          </div>
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">VIP客户</span>
            <span class="nightclub-info-value">${safeGet(data, '夜总会经营.VIP客户数', '0')} 人</span>
          </div>
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">待处理订单</span>
            <span class="nightclub-info-value">${data.夜总会经营.待处理订单?.length || 0} 个</span>
          </div>
        </div>
      </div>
    `;
  }

  // 1.5. 待处理订单详情卡片
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
      const orderNum = order.订单编号 || '未知';
      const client = order.客户代号 || '未知';
      const type = order.需求类型 || '';
      const requirements = order.具体要求 || '';
      const deadline = order.截止日期 || '';
      const status = order.状态 || '待处理';

      html += `
        <div class="nightclub-trainee-item">
          <div class="nightclub-trainee-header">
            <span class="nightclub-trainee-name">${orderNum}</span>
            <span class="nightclub-trainee-status">${status}</span>
          </div>
          <div class="nightclub-info-row">
            <span class="nightclub-info-label">客户</span>
            <span class="nightclub-info-value">${client}</span>
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
  }

  // 2. 工坊培养对象卡片
  if (data.工坊培养对象) {
    const trainees = data.工坊培养对象.培养列表 || [];
    html += `
      <div class="nightclub-card">
        <div class="nightclub-card-title">
          <span>👥</span>
          <span>工坊培养对象 (${trainees.length})</span>
        </div>
        <div class="nightclub-card-content">
    `;

    if (trainees.length === 0) {
      html += `
          <div class="nightclub-empty">
            <div class="nightclub-empty-icon">📭</div>
            <div class="nightclub-empty-text">暂无培养对象</div>
          </div>
      `;
    } else {
      trainees.forEach(trainee => {
        const name = trainee.姓名 || '未知';
        const code = trainee.编号 || '';
        const age = trainee.基本信息?.年龄 || '';
        const origin = trainee.基本信息?.来源 || '';
        const appearance = trainee.基本信息?.原始外貌 || '';
        const days = trainee.基本信息?.培养天数 || '0';
        const progress = typeof trainee.培养进度 === 'number' ? trainee.培养进度 : trainee.培养进度 || '0';
        const order = trainee.定制信息?.对应订单 || '无';
        const target = trainee.定制信息?.目标形象 || '未定';
        const requirements = trainee.定制信息?.特殊要求 || '';
        const status = trainee.当前状态 || '培训中';

        html += `
          <div class="nightclub-trainee-item">
            <div class="nightclub-trainee-header">
              <span class="nightclub-trainee-name">${name}${code ? ` (${code})` : ''}</span>
              <span class="nightclub-trainee-status">${status}</span>
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
              <span class="nightclub-info-label">培养天数</span>
              <span class="nightclub-info-value">${days} 天</span>
            </div>
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
    }

    html += `
        </div>
      </div>
    `;
  }

  // 3. 已归档艺人卡片
  if (data.已归档艺人) {
    const archived = data.已归档艺人.档案列表 || [];
    const displayArchived = archived.slice(0, 5);
    const moreCount = archived.length > 5 ? archived.length - 5 : 0;

    html += `
      <div class="nightclub-card">
        <div class="nightclub-card-title">
          <span>📁</span>
          <span>已归档艺人 (${archived.length})</span>
        </div>
        <div class="nightclub-card-content">
    `;

    if (displayArchived.length === 0) {
      html += `
          <div class="nightclub-empty">
            <div class="nightclub-empty-icon">📭</div>
            <div class="nightclub-empty-text">暂无归档艺人</div>
          </div>
      `;
    } else {
      displayArchived.forEach(artist => {
        const code = artist.编号 || '';
        const name = artist.艺名 || '未知';
        const type = artist.类型 || '未知';
        const age = artist.年龄 || '';
        const origin = artist.来源 || '';
        const features = artist.特征 || '';
        const currentStatus = artist.当前状态 || '';

        html += `
          <div class="nightclub-trainee-item">
            <div class="nightclub-trainee-header">
              <span class="nightclub-trainee-name">${name}${code ? ` (${code})` : ''}</span>
              <span class="nightclub-trainee-status">${type}</span>
            </div>
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">年龄 / 来源</span>
              <span class="nightclub-info-value">${age ? age + '岁' : ''} ${age && origin ? '/' : ''} ${origin}</span>
            </div>
            ${
              features
                ? `
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">特征</span>
              <span class="nightclub-info-value">${features}</span>
            </div>`
                : ''
            }
            ${
              currentStatus
                ? `
            <div class="nightclub-info-row">
              <span class="nightclub-info-label">当前状态</span>
              <span class="nightclub-info-value">${currentStatus}</span>
            </div>`
                : ''
            }
          </div>
        `;
      });

      if (moreCount > 0) {
        html += `
          <div style="text-align: center; margin-top: 12px; color: var(--nightclub-text-dim); font-size: 12px;">
            还有 ${moreCount} 个归档艺人未显示
          </div>
        `;
      }
    }

    html += `
        </div>
      </div>
    `;
  }

  contentDiv.innerHTML = html;
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
