// ==================== 掌上公寓 - SillyTavern 插件版 ====================
// 完整功能的公寓管理系统，带可拖动按钮
// 版本：动态扩展版

console.log('🏢 加载掌上公寓插件...');

// ==================== 样式定义 ====================
const styles = `
<style id="apartment-plugin-styles">
/* ==================== 全局样式 ==================== */
* { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box;
}

/* 支持刘海屏等安全区域 - 仅在小屏幕应用 */
@media (max-width: 768px) {
    @supports (padding: max(0px)) {
        .apartment-main-panel {
            padding-top: max(0px, env(safe-area-inset-top)) !important;
            padding-bottom: max(0px, env(safe-area-inset-bottom)) !important;
            padding-left: max(0px, env(safe-area-inset-left)) !important;
            padding-right: max(0px, env(safe-area-inset-right)) !important;
        }
    }
}

.no-select { 
    user-select: none; 
    -webkit-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
}

/* 移除所有按钮和可交互元素的焦点框 */
button:focus,
button:active,
.actionable:focus,
.actionable:active,
.room-card:focus,
.room-card:active,
.dock-button:focus,
.dock-button:active,
.zoom-btn:focus,
.zoom-btn:active,
.confirm-btn:focus,
.confirm-btn:active,
.add-floor-btn:focus,
.add-floor-btn:active,
.add-room-btn:focus,
.add-room-btn:active {
    outline: none !important;
    -webkit-tap-highlight-color: transparent !important;
}

/* 移除移动端触摸高亮 */
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}

/* 性能优化 - 仅对拖动元素使用 */
#apartment-canvas {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* 拖动时禁用文本选择 */
.canvas-viewport {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

:root { 
    --theme-phone-bg: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%); 
    --theme-phone-bg-solid: #f8f9fa;
    --theme-text-color: #2c3e50; 
    --theme-border-color: #dee2e6; 
    --theme-container-bg: #ffffff; 
    --theme-subtitle-color: #6c757d; 
    --theme-header-bg: linear-gradient(135deg, #6c8cdc 0%, #8b7bb8 100%);
    --theme-dock-bg: rgba(255, 255, 255, 0.95); 
    --theme-modal-btn-bg: #f8f9fa; 
    --theme-input-bg: #ffffff;
    --theme-input-text: #2c3e50;
    --color-fixed: #fff9e6; 
    --color-bedroom-empty: #f8e8e8;
    --color-bedroom-occupied: #ffd4d4;
    --color-functional: #e6f2ff; 
    --color-empty: #f0f0f0; 
    --color-outdoor: #e8f5e9; 
    --color-pending: #fff8e1;
    --color-danger: #ffe0e0; 
    --your-room-bg: #e1f5fe; 
    --progress-bar-bg: #e9ecef; 
    --progress-bar-favor-fill: #ff8a80; 
    --progress-bar-lust-fill: #ff80ab; 
    --color-add-room: #e8f5e9; 
}

.dark-theme { 
    --theme-phone-bg: linear-gradient(180deg, #1e2530 0%, #2a3441 100%); 
    --theme-phone-bg-solid: #1e2530;
    --theme-text-color: #e8eaed; 
    --theme-border-color: #4a5568; 
    --theme-container-bg: #2a3441; 
    --theme-subtitle-color: #9ca3af;
    --theme-header-bg: linear-gradient(135deg, #4a5568 0%, #2d3748 100%); 
    --theme-dock-bg: rgba(42, 52, 65, 0.95); 
    --theme-modal-btn-bg: #374151; 
    --theme-input-bg: #1e2530;
    --theme-input-text: #e8eaed;
    --color-fixed: #4a4332; 
    --color-bedroom-empty: #3d3338;
    --color-bedroom-occupied: #4a3333;
    --color-functional: #2d3d52; 
    --color-empty: #363d47; 
    --color-outdoor: #354237;
    --color-pending: #4a4636; 
    --color-danger: #5a3333; 
    --your-room-bg: #2d4550; 
    --progress-bar-bg: #374151; 
    --progress-bar-favor-fill: #ef4444; 
    --progress-bar-lust-fill: #ec4899; 
    --color-add-room: #354237; 
}

/* ==================== 拖动按钮 ==================== */
.apartment-toggle-btn {
    position: fixed !important;
    top: 100px;
    left: 20px;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 10000 !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    font-size: 28px;
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.apartment-toggle-btn.dragging {
    cursor: grabbing !important;
    opacity: 0.9;
    z-index: 10001 !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
    .apartment-toggle-btn {
        width: 56px;
        height: 56px;
        font-size: 24px;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
}

@media (max-width: 480px) {
    .apartment-toggle-btn {
        /* 🔧 确保按钮在小屏幕下也能正常工作 */
        z-index: 10002 !important;
        pointer-events: auto !important;
    }
}

/* ==================== 主界面容器 ==================== */
.apartment-main-panel {
    position: fixed !important;
    top: 50vh !important;
    left: 50vw !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 900px !important;
    height: 85vh !important;
    max-height: 650px !important;
    min-height: 400px !important;
    min-width: 320px !important;
    background: var(--theme-phone-bg-solid);
    border: 12px solid transparent;
    background-clip: padding-box;
    border-radius: 32px;
    box-shadow: 
        0 0 0 1px rgba(0, 0, 0, 0.1),
        0 24px 64px rgba(0, 0, 0, 0.4),
        0 0 80px rgba(102, 126, 234, 0.2);
    z-index: 999 !important;
    display: none;
    flex-direction: column;
    overflow: hidden;
    color: var(--theme-text-color);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    backdrop-filter: blur(20px);
}

.apartment-main-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--theme-phone-bg);
    border-radius: 20px;
    z-index: -1;
}

.apartment-main-panel.active {
    display: flex;
}

/* ==================== 移动端响应式 ==================== */
/* 481px - 768px：平板大小 */
@media (min-width: 481px) and (max-width: 768px) {
    .apartment-main-panel {
        top: 8vh !important;
        left: 5vw !important;
        transform: none !important;
        width: 90vw !important;
        height: 84vh !important;
        max-width: none !important;
        max-height: none !important;
        min-width: 0 !important;
        min-height: 0 !important;
        border-radius: 20px !important;
    }
}

/* 480px以下：手机大小 */
@media (max-width: 480px) {
    .apartment-main-panel {
        position: fixed !important;
        top: 3vh !important;
        left: 2.5vw !important;
        transform: none !important;
        width: 95vw !important;
        /* 🔧 简化高度计算，确保稳定显示 */
        height: 88vh !important;
        max-width: none !important;
        max-height: 92vh !important;
        min-width: 0 !important;
        min-height: 0 !important;
        border-radius: 16px !important;
        z-index: 999 !important;
    }
    
    /* 🔧 只在active时设置flex，避免覆盖显示/隐藏逻辑 */
    .apartment-main-panel.active {
        display: flex !important;
        flex-direction: column !important;
    }
    
    .apartment-main-panel::before {
        border-radius: 12px !important;
    }
}

/* ==================== 头部 ==================== */
.mobile-header { 
    flex-shrink: 0; 
    padding: 16px 20px;
    background: var(--theme-header-bg);
    border-bottom: none;
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    font-size: 0.9em; 
    position: relative; 
    z-index: 20;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    color: white;
    min-height: 56px;
}

.mobile-header > div:first-child {
    font-weight: 600;
    letter-spacing: 0.3px;
}

#mode-display { 
    font-weight: 700; 
    padding: 6px 14px; 
    border-radius: 20px;
    font-size: 0.9em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

#mode-display.observation-mode { 
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #2c3e50; 
}

#mode-display.build-mode { 
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

@media (max-width: 768px) {
    .mobile-header {
        padding: 12px 16px;
        font-size: 0.85em;
        min-height: 52px;
    }
    
    #mode-display {
        padding: 5px 12px;
        font-size: 0.85em;
    }
}

@media (max-width: 480px) {
    .mobile-header {
        padding: 10px 12px;
        font-size: 0.75em;
        min-height: 48px;
        flex-shrink: 0 !important;
    }
    
    .mobile-header > div:first-child {
        font-size: 0.95em;
    }
    
    #mode-display {
        padding: 4px 10px;
        font-size: 0.8em;
    }
    
    /* 🔧 确保画布视口能正确flex */
    .canvas-viewport {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: auto !important;
    }
}

/* ==================== 画布视口 ==================== */
.canvas-viewport { 
    flex-grow: 1; 
    position: relative; 
    overflow: auto; 
    min-height: 0; 
    border-radius: 20px; 
    cursor: grab;
}

.canvas-viewport:active { 
    cursor: grabbing; 
}

/* 确保滚动条样式美观 */
.canvas-viewport::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.canvas-viewport::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.canvas-viewport::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 4px;
}

.canvas-viewport::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.7);
}

#apartment-canvas { 
    position: absolute; 
    left: 50%; 
    top: 50%; 
    transform: translate(-50%, -50%) scale(1); 
    transform-origin: center center;
    display: flex; 
    flex-direction: column; 
    align-items: stretch; 
    gap: 10px;
    min-width: 1515px;
}

/* 缩放时添加平滑过渡 */
#apartment-canvas.zooming {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ==================== 底部工具栏 ==================== */
.mobile-footer { 
    flex-shrink: 0; 
    padding: 12px 8px; 
    background: var(--theme-dock-bg);
    backdrop-filter: blur(20px) saturate(180%); 
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    display: flex; 
    justify-content: space-around; 
    align-items: center; 
    z-index: 20; 
    overflow-x: auto; 
    overflow-y: hidden; 
    gap: 4px;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
    min-height: 60px;
    /* 🔧 移动端底部安全区域适配（防止被浏览器工具栏遮挡） */
    padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
}

.dock-button { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    gap: 4px; 
    cursor: pointer; 
    background: transparent; 
    border: none;
    color: var(--theme-subtitle-color); 
    font-size: 11px; 
    font-family: inherit; 
    min-width: 60px; 
    flex: 1; 
    max-width: 85px; 
    padding: 8px 4px;
    border-radius: 12px;
    position: relative;
}

@media (max-width: 768px) {
    .dock-button { 
        font-size: 10px; 
        min-width: 52px; 
        padding: 6px 2px; 
    }
}

@media (max-width: 480px) {
    .mobile-footer {
        padding: 8px 4px;
        min-height: 56px;
        flex-shrink: 0 !important;
        /* 🔧 手机端增加更多底部安全间距（防止被工具栏遮挡） */
        padding-bottom: max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px));
    }
    
    .dock-button { 
        font-size: 9px; 
        min-width: 44px; 
        padding: 5px 1px;
        gap: 2px;
    }
    .dock-button-icon { 
        font-size: 18px !important; 
    }
    .dock-button span:not(.dock-button-icon) { 
        font-size: 8px;
        line-height: 1.2;
    }
}

.dock-button:disabled { 
    color: #999 !important;
    cursor: not-allowed;
    opacity: 0.5; 
} 

.dock-button-icon { 
    font-size: 26px;
}

.dock-button.active {
    color: #667eea;
    background: rgba(102, 126, 234, 0.12);
}

.dock-button.active .dock-button-icon { 
    color: #667eea;
}

/* ==================== 楼层和房间 ==================== */
.above-ground-wrapper { 
    display: grid; 
    grid-template-columns: 200px 1fr 200px; 
    align-items: end; 
    gap: 20px;
    padding: 20px 20px 0 20px; 
}

.basement-wrapper { 
    display: grid; 
    grid-template-columns: 200px 1fr 200px; 
    gap: 20px;
    padding: 0 20px 20px 20px; 
}

.indoor-levels { 
    display: flex; 
    flex-direction: column; 
    gap: 20px;
}

.level { 
    background-color: var(--theme-container-bg); 
    border-radius: 12px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
    padding: 15px;
    border: 1px solid var(--theme-border-color); 
    display: flex; 
    flex-direction: column; 
    width: 1275px; 
    box-sizing: border-box;
}

.level-title { 
    font-size: 1.2em; 
    font-weight: 600; 
    margin: 0 0 15px 5px;
    color: var(--theme-text-color); 
    flex-shrink: 0; 
}

.room-grid { 
    display: flex; 
    gap: 10px; 
    flex: 1; 
    align-items: stretch; 
}

.room-card { 
    flex-shrink: 0;
    flex-basis: 0; 
    border-radius: 12px; 
    padding: 16px 12px; 
    min-height: 80px;
    min-width: 80px; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    text-align: center;
    font-weight: 600; 
    font-size: 0.9em; 
    border: 2px solid rgba(255, 255, 255, 0.3); 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
}

/* 移除不必要的::before伪元素以提升性能 */

.size-2 { flex-grow: 2; }
.size-3 { flex-grow: 3; }
.size-6 { flex-grow: 6; }

.room-card.actionable { 
    cursor: pointer;
}

@media (max-width: 768px) {
    .room-card {
        padding: 12px 8px;
        min-height: 70px;
        min-width: 70px;
        font-size: 0.85em;
    }
}

.placeholder { 
    visibility: hidden; 
}

.fixed-room { 
    background: var(--color-fixed);
}

.fixed-room .room-name::before {
    content: '🏛️ ';
}

.outdoor-room { 
    background: var(--color-outdoor); 
}

.outdoor-room .room-name::before {
    content: '🌳 ';
}

.empty-room { 
    background: var(--color-empty);
    position: relative;
}

.empty-room::after {
    content: '🏚️';
    display: block;
    font-size: 1.8em;
    opacity: 0.35;
    margin-top: 4px;
}

.empty-room .room-name::after {
    content: ' (空置)';
    font-size: 0.85em;
    opacity: 0.7;
    font-weight: 400;
}

.bedroom-room { 
    background: var(--color-bedroom-empty);
}

.bedroom-room .room-name::before {
    content: '🛏️ ';
}

/* 已住人的卧室使用更深的颜色 */
.bedroom-room[data-occupant]:not([data-occupant=""]):not([data-occupant="未知"]) {
    background: var(--color-bedroom-occupied);
}

.your-room { 
    background: var(--your-room-bg); 
}

.your-room .room-name::before {
    content: '';
}

.functional-room { 
    background: var(--color-functional); 
}

.functional-room .room-name::before {
    content: '🎨 ';
}

.pending-decoration { 
    background-color: var(--color-pending); 
    border-style: dashed;
}

.pending-eviction { 
    background-color: var(--color-danger); 
    border-style: dotted; 
    color: #721c24; 
}

.pending-demolition { 
    background-color: var(--color-danger); 
    border-style: dashed;
    color: #721c24; 
}

.room-name { 
    font-weight: bold; 
}

.room-occupant { 
    font-size: 0.8em; 
    color: var(--theme-subtitle-color); 
    margin-top: 5px; 
}

.add-room-card { 
    background: var(--color-add-room); 
    border: 2px dashed #96c47c; 
    font-size: 2em; 
    color: #2d5016;
}

.add-floor-btn { 
    width: 100%; 
    min-width: 1515px; 
    padding: 14px 16px; 
    background: var(--color-add-room); 
    border: 2px dashed #96c47c; 
    border-radius: 12px; 
    cursor: pointer; 
    font-weight: 700; 
    color: #2d5016;
    font-size: 1em; 
    display: block; 
    box-sizing: border-box;
}

.add-room-btn { 
    width: 100%; 
    padding: 12px 16px; 
    background: var(--color-add-room); 
    border: 2px dashed #96c47c; 
    border-radius: 12px; 
    cursor: pointer; 
    font-weight: 700; 
    margin: 12px 0; 
    color: #2d5016;
    font-size: 0.95em; 
    display: block; 
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .add-floor-btn,
    .add-room-btn {
        padding: 10px 12px;
        font-size: 0.9em;
    }
}

.slot-indicator { 
    font-size: 0.7em; 
    color: var(--theme-subtitle-color); 
    margin-top: 3px; 
}

.outdoor-room { 
    background-color: var(--color-outdoor); 
    min-height: 100%; 
}

.floor-wrapper { 
    display: flex; 
    align-items: stretch; 
    width: 100%; 
    min-width: 1515px; 
}

.floor-outdoor-left { 
    width: 120px; 
    flex-shrink: 0; 
    display: flex; 
    flex-direction: column; 
}

.floor-outdoor-right { 
    width: 120px; 
    flex-shrink: 0; 
    display: flex; 
    flex-direction: column; 
}

.floor-main { 
    flex: 1; 
    display: flex; 
    justify-content: center; 
    align-items: stretch; 
}

.outdoor-card { 
    width: 100%; 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    text-align: center; 
    padding: 10px; 
    font-size: 0.85em; 
}

/* ==================== 浮动UI ==================== */
.floating-ui { 
    position: absolute; 
    bottom: 80px; 
    right: 20px; 
    z-index: 10; 
    display: flex; 
    flex-direction: column; 
    align-items: flex-end;
    gap: 10px; 
}

@media (max-width: 480px) {
    .floating-ui {
        /* 🔧 在底部工具栏上方留出安全距离 */
        bottom: max(70px, calc(env(safe-area-inset-bottom, 0px) + 70px));
        right: 10px;
    }
}

.zoom-controls { 
    display: flex; 
    flex-direction: column; 
    gap: 5px;
}

.zoom-btn, .confirm-btn { 
    width: 48px; 
    height: 48px; 
    border-radius: 50%; 
    border: none; 
    background: rgba(102, 126, 234, 0.9);
    color: white; 
    font-size: 24px; 
    font-weight: 700; 
    cursor: pointer; 
    line-height: 1;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    backdrop-filter: blur(10px);
}

.confirm-btn { 
    width: auto;
    padding: 0 24px; 
    border-radius: 24px; 
    font-size: 16px;
    background: rgba(86, 171, 47, 0.9);
}

@media (max-width: 768px) {
    .zoom-btn, .confirm-btn {
        width: 44px;
        height: 44px;
        font-size: 20px;
    }
    
    .confirm-btn {
        padding: 0 20px;
        font-size: 15px;
    }
}

/* ==================== 模态框 ==================== */
.modal-overlay { 
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
    z-index: 1000 !important;
    overflow-y: auto;
    padding: 20px 0;
}

.modal-content { 
    background: var(--theme-container-bg); 
    color: var(--theme-text-color); 
    padding: 28px; 
    border-radius: 20px; 
    width: 90%; 
    max-width: 420px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    margin: auto;
}

.modal-title { 
    margin: 0 0 12px 0;
    font-size: 1.4em;
    font-weight: 700;
}

.modal-subtitle { 
    color: var(--theme-subtitle-color); 
    margin: 0 0 24px 0; 
    font-size: 0.95em;
    line-height: 1.5;
}

.modal-choices button, .modal-confirm-btn { 
    display: block;
    width: 100%; 
    padding: 14px 16px; 
    margin-bottom: 12px; 
    font-size: 1em; 
    font-weight: 600;
    border-radius: 12px; 
    border: 2px solid transparent; 
    cursor: pointer; 
    background: #667eea;
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

.modal-choices button:disabled { 
    background: #ccc; 
    color: #666; 
    cursor: not-allowed;
    box-shadow: none;
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: 10px;
    }
    
    .modal-content {
        padding: 20px;
        border-radius: 16px;
        width: 92%;
        max-height: 85vh;
    }
    
    .modal-title {
        font-size: 1.2em;
    }
    
    .modal-subtitle {
        font-size: 0.9em;
        margin-bottom: 16px;
    }
    
    .modal-choices button, .modal-confirm-btn {
        padding: 12px 14px;
        font-size: 0.95em;
    }
}

@media (max-width: 480px) {
    .modal-overlay {
        padding: 5px;
    }
    
    .modal-content {
        padding: 16px;
        width: 95%;
        max-height: 90vh;
        border-radius: 12px;
    }
    
    .modal-title {
        font-size: 1.1em;
    }
    
    .modal-subtitle {
        font-size: 0.85em;
    }
    
    .modal-choices button, .modal-confirm-btn {
        padding: 10px 12px;
        font-size: 0.9em;
        margin-bottom: 10px;
    }
}

.modal-functional-input { 
    margin-top: 16px; 
}

.modal-functional-input label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--theme-text-color);
}

.modal-functional-input input, 
.modal-functional-input select { 
    width: 100%; 
    padding: 12px 16px;
    box-sizing: border-box; 
    border: 2px solid var(--theme-border-color); 
    border-radius: 12px; 
    margin-bottom: 12px; 
    background-color: var(--theme-input-bg) !important; 
    color: var(--theme-input-text) !important;
    font-size: 1em;
}

/* 特别强制招募输入框的样式 */
#recruitment-keywords {
    background-color: var(--theme-input-bg) !important;
    color: var(--theme-input-text) !important;
}

/* 白天模式强制白色背景 */
:root #recruitment-keywords,
:root .modal-functional-input input,
:root .modal-functional-input select {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
}

:root .modal-functional-input input::placeholder {
    color: #6c757d !important;
    opacity: 0.7;
}

/* 夜晚模式强制深色背景 */
.dark-theme #recruitment-keywords,
.dark-theme .modal-functional-input input,
.dark-theme .modal-functional-input select {
    background-color: #2a3441 !important;
    color: #e8eaed !important;
}

.dark-theme .modal-functional-input input::placeholder {
    color: #9ca3af !important;
    opacity: 0.7;
}

/* WebKit浏览器兼容 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--theme-input-text) !important;
    -webkit-box-shadow: 0 0 0 1000px var(--theme-input-bg) inset !important;
}

.modal-functional-input input:focus,
.modal-functional-input select:focus {
    outline: none;
    border-color: #667eea;
}

.hidden { 
    display: none !important; 
}

.danger-btn { 
    background: #eb3b5a !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(235, 59, 90, 0.25);
}

/* ==================== 事件模态框 ==================== */
.event-modal { 
    position: absolute; 
    bottom: 0; 
    left: 0; 
    right: 0; 
    height: 75%; 
    background: var(--theme-container-bg);
    border-top: none;
    border-radius: 24px 24px 0 0; 
    z-index: 100; 
    transform: translateY(100%); 
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease-out;
}

.event-modal.visible { 
    transform: translateY(0); 
}

.event-header { 
    padding: 20px; 
    text-align: center;
    font-weight: 700; 
    font-size: 1.2em;
    border-bottom: 2px solid var(--theme-border-color); 
    flex-shrink: 0;
    background: rgba(102, 126, 234, 0.05);
    cursor: pointer;
}

.event-body { 
    padding: 20px; 
    overflow-y: auto; 
    flex-grow: 1;
}

.event-section-title { 
    font-size: 1.2em; 
    font-weight: 700; 
    margin-bottom: 14px; 
    border-left: 5px solid #667eea; 
    padding-left: 12px;
    color: var(--theme-text-color);
}

.event-buttons-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); 
    gap: 12px;
}

@media (max-width: 768px) {
    .event-buttons-grid {
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .event-buttons-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.event-button { 
    padding: 16px 12px; 
    font-size: 0.95em; 
    font-weight: 600; 
    border-radius: 12px; 
    border: 2px solid var(--theme-border-color);
    cursor: pointer; 
    background: var(--theme-modal-btn-bg);
    color: var(--theme-text-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.event-button.random { 
    background: #667eea;
    color: white;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

/* ==================== 信息模态框美化 ==================== */
#info-modal .modal-content {
    padding: 0;
    overflow: hidden;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
    position: relative;
}

#info-modal-header {
    padding: 20px 25px;
    padding-right: 60px; /* 为关闭按钮留空间 */
    border-bottom: 1px solid var(--theme-border-color);
    flex-shrink: 0;
    position: relative;
}

/* 🔧 添加关闭按钮样式 */
.modal-close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    color: var(--theme-text-color);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
}

.modal-close-btn:hover {
    background: rgba(235, 59, 90, 0.15);
    color: #eb3b5a;
    transform: scale(1.1);
}

.modal-close-btn:active {
    transform: scale(0.95);
}

#info-modal-details {
    padding: 20px 25px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
    flex: 1;
    max-height: calc(75vh - 120px);
}

/* 移动端优化 */
@media (max-width: 768px) {
    #info-modal .modal-content {
        max-height: 80vh;
    }
    
    #info-modal-header {
        padding: 16px 20px;
        padding-right: 55px;
    }
    
    #info-modal-details {
        padding: 16px 20px;
        max-height: calc(80vh - 100px);
    }
}

@media (max-width: 480px) {
    #info-modal .modal-content {
        max-height: 70vh; /* 🔧 减小高度，更方便操作 */
        width: 92%;
    }
    
    #info-modal-header {
        padding: 14px 16px;
        padding-right: 50px;
    }
    
    #info-modal-details {
        padding: 14px 16px;
        max-height: calc(70vh - 90px);
    }
    
    .modal-close-btn {
        width: 32px;
        height: 32px;
        font-size: 20px;
        top: 12px;
        right: 12px;
    }
}

#info-modal-details ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

#info-modal-details li {
    padding: 8px 0;
    border-bottom: 1px solid var(--theme-border-color);
    font-size: 0.95em;
}

#info-modal-details li:last-child {
    border-bottom: none;
}

#info-modal-details li strong {
    color: var(--theme-subtitle-color);
    margin-right: 10px;
    display: inline-block;
    width: 50px;
}

#info-modal-details p strong {
    font-weight: 600;
    margin-right: 5px;
}

.progress-bar-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0;
}

.progress-bar {
    flex-grow: 1;
    height: 14px;
    background-color: var(--progress-bar-bg);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
    height: 100%;
    width: 0%;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
}

.progress-bar-favor { 
    background: var(--progress-bar-favor-fill); 
}

.progress-bar-lust { 
    background: var(--progress-bar-lust-fill); 
}

.progress-value {
    font-weight: 700;
    font-size: 0.95em;
    min-width: 35px;
    text-align: right;
    color: var(--theme-text-color);
}

/* ==================== 历史、成就、关系模态框优化 ==================== */
#history-modal .modal-content,
#achievement-modal .modal-content,
#relation-modal .modal-content {
    max-height: 70vh !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
}

/* 🔧 标题区域样式 */
#history-modal .modal-title,
#achievement-modal .modal-title,
#relation-modal .modal-title {
    padding-right: 50px; /* 为关闭按钮留空间 */
    flex-shrink: 0;
}

/* 🔧 内容区域可滚动 */
#history-content,
#achievement-content,
#relation-content {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    flex: 1 !important;
    padding: 15px !important;
    max-height: calc(70vh - 80px) !important;
}

@media (max-width: 768px) {
    #history-modal .modal-content,
    #achievement-modal .modal-content,
    #relation-modal .modal-content {
        max-height: 75vh !important;
        width: 95% !important;
    }
    
    #history-content,
    #achievement-content,
    #relation-content {
        padding: 12px !important;
        font-size: 0.95em;
        max-height: calc(75vh - 70px) !important;
    }
}

@media (max-width: 480px) {
    #history-modal .modal-content,
    #achievement-modal .modal-content,
    #relation-modal .modal-content {
        max-height: 70vh !important;
        width: 92% !important;
    }
    
    #history-content,
    #achievement-content,
    #relation-content {
        padding: 10px !important;
        font-size: 0.9em;
        max-height: calc(70vh - 65px) !important;
    }
}

/* ==================== 格子选择器 ==================== */
.grid-cell {
    padding: 16px 8px;
    border: 2px solid var(--theme-border-color);
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    background: var(--theme-modal-btn-bg);
    font-weight: 600;
    font-size: 1.1em;
    color: var(--theme-text-color);
}

.grid-cell.occupied {
    background: #ddd !important;
    cursor: not-allowed !important;
    opacity: 0.5;
    color: #999;
}

.grid-cell.selected {
    background: #d4fc79 !important;
    border-color: #28a745 !important;
    font-weight: 700;
    color: #155724;
}

@media (max-width: 768px) {
    .grid-cell {
        padding: 14px 6px;
        font-size: 1em;
    }
}

@media (max-width: 480px) {
    .grid-cell {
        padding: 12px 4px;
        font-size: 0.95em;
    }
}

/* ==================== 全局移动端优化 ==================== */

/* 防止双击缩放 */
* {
    touch-action: manipulation;
}

/* 优化滚动体验 */
.event-body,
#info-modal-details,
#history-content,
#achievement-content,
#relation-content {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
}

.canvas-viewport {
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

/* 小屏幕下的楼层布局优化 */
@media (max-width: 768px) {
    .level {
        /* 保持固定宽度，允许横向滚动，不压缩 */
        width: 1275px;
        min-width: 1275px;
    }
    
    .floor-wrapper {
        /* 保持固定宽度，允许横向滚动，不压缩 */
        min-width: 1515px;
    }
    
    .add-floor-btn {
        /* 保持固定宽度，允许横向滚动，不压缩 */
        min-width: 1515px;
    }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
    .mobile-header {
        font-size: 0.75em;
    }
    
    .dock-button-icon {
        font-size: 18px !important;
    }
    
    .room-card {
        font-size: 0.8em;
        padding: 10px 6px;
        min-height: 60px;
    }
    
    .event-section-title {
        font-size: 1em;
    }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
    .apartment-main-panel {
        height: 95%;
        max-height: none;
    }
    
    .mobile-header {
        padding: 8px 16px;
    }
    
    .mobile-footer {
        padding: 6px 4px;
        /* 🔧 横屏模式下也要考虑底部安全区域 */
        padding-bottom: max(6px, calc(env(safe-area-inset-bottom, 0px) + 6px));
    }
    
    .dock-button {
        padding: 4px 2px;
        gap: 2px;
    }
    
    .dock-button-icon {
        font-size: 20px;
    }
}
</style>
`;

// ==================== HTML 结构 ====================
const html = `
<!-- 拖动按钮 -->
<div id="apartment-toggle-btn" class="apartment-toggle-btn">
    <span>🏢</span>
</div>

<!-- 主面板 -->
<div id="apartment-main-panel" class="apartment-main-panel">
    <header class="mobile-header">
        <div>
            <span id="date-display">加载中...</span> |
            <span id="time-display"></span>
        </div>
        <div id="mode-display"></div>
    </header>
    
    <div class="canvas-viewport" id="screen">
        <div id="apartment-canvas">
            <!-- 动态生成的公寓楼层将插入这里 -->
        </div>
        <div class="floating-ui">
            <button id="execute-actions-btn" class="confirm-btn hidden"></button>
            <div class="zoom-controls">
                <button id="zoom-in-btn" class="zoom-btn">+</button>
                <button id="zoom-out-btn" class="zoom-btn">-</button>
            </div>
        </div>
    </div>
    
    <footer class="mobile-footer">
        <button id="recruitment-btn" class="dock-button">
            <span class="dock-button-icon">👤</span>
            <span>招募</span>
        </button>
        <button id="build-mode-btn" class="dock-button">
            <span class="dock-button-icon">🔨</span>
            <span>建造</span>
        </button>
        <button id="event-generator-btn" class="dock-button">
            <span class="dock-button-icon">🎲</span>
            <span>事件</span>
        </button>
        <button id="history-btn" class="dock-button">
            <span class="dock-button-icon">📜</span>
            <span>历史</span>
        </button>
        <button id="achievement-btn" class="dock-button">
            <span class="dock-button-icon">🏆</span>
            <span>成就</span>
        </button>
        <button id="relation-btn" class="dock-button">
            <span class="dock-button-icon">🕸️</span>
            <span>关系</span>
        </button>
        <button id="settings-btn" class="dock-button">
            <span class="dock-button-icon">⚙️</span>
            <span>设置</span>
        </button>
    </footer>
    
    <!-- 事件模态框 -->
    <div id="event-modal" class="event-modal">
        <div class="event-header" id="close-event-modal-btn">事件生成器 (点击此处关闭)</div>
        <div class="event-body">
            <div style="margin-bottom: 25px;">
                <h3 class="event-section-title">个人事件</h3>
                <div class="event-buttons-grid" id="single-events">
                    <button class="event-button" data-event-type="个人情感类">情感求助</button>
                    <button class="event-button" data-event-type="生活经济类">经济困难</button>
                    <button class="event-button" data-event-type="日常委托类">日常委托</button>
                    <button class="event-button" data-event-type="家居修理类">家居修理</button>
                    <button class="event-button random" data-event-type="random-single">🎲 随机一件</button>
                </div>
            </div>
            <div>
                <h3 class="event-section-title">集体事件</h3>
                <div class="event-buttons-grid" id="group-events">
                    <button class="event-button" data-event-type="节日派对类">节日派对</button>
                    <button class="event-button" data-event-type="室内娱乐类">室内娱乐</button>
                    <button class="event-button" data-event-type="突发状况类">突发状况</button>
                    <button class="event-button" data-event-type="共同创作类">共同创作</button>
                    <button class="event-button random" data-event-type="random-group">🎲 随机一件</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 所有模态框 -->
<div id="add-room-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <h2 class="modal-title" id="add-room-modal-title">新建空房间</h2>
        <p class="modal-subtitle" id="add-room-modal-subtitle" style="white-space: pre-line;"></p>
        <div class="modal-functional-input">
            <div id="grid-selector-container" style="margin: 15px 0;">
                <label style="font-weight: bold; margin-bottom: 10px; display: block;">
                    选择房间位置（点击并拖动选择连续格子）：
                </label>
                <div id="grid-selector" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; margin: 10px 0; user-select: none;"></div>
                <p id="selected-range-display" style="margin-top: 10px; font-size: 0.9em; color: var(--theme-subtitle-color);"></p>
            </div>
            <button id="confirm-add-room-btn" class="modal-confirm-btn">确认新建空房间</button>
        </div>
    </div>
</div>

<div id="add-floor-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <h2 class="modal-title">新建楼层</h2>
        <div class="modal-functional-input">
            <label>楼层名称：</label>
            <input type="text" id="add-floor-name" placeholder="例如：五楼、地下二楼">
            <label>楼层位置：</label>
            <select id="add-floor-position">
                <option value="top">最顶层（向上扩展）</option>
                <option value="bottom">最底层（向下扩展）</option>
            </select>
            <button id="confirm-add-floor-btn" class="modal-confirm-btn">确认新建</button>
        </div>
    </div>
</div>

<div id="management-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <h2 id="management-modal-title" class="modal-title"></h2>
        <p id="management-modal-subtitle" class="modal-subtitle"></p>
        <div id="management-modal-choices" class="modal-choices"></div>
    </div>
</div>

<div id="info-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <div id="info-modal-header">
            <button id="info-modal-close-btn" class="modal-close-btn">×</button>
            <h2 id="info-modal-title" class="modal-title"></h2>
            <p id="info-modal-subtitle" class="modal-subtitle"></p>
        </div>
        <div id="info-modal-details"></div>
    </div>
</div>

<div id="recruitment-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <h2 class="modal-title">招募新租客</h2>
        <p class="modal-subtitle">请输入您期望的租客特征</p>
        <div class="modal-functional-input">
            <input type="text" id="recruitment-keywords" placeholder="例如：人妻、金发、JK">
            <button id="confirm-recruitment-btn" class="modal-confirm-btn">确认招募</button>
        </div>
    </div>
</div>

<div id="history-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <button id="history-modal-close-btn" class="modal-close-btn">×</button>
        <h2 class="modal-title">📜 事件历史</h2>
        <div id="history-content">
            <p style="color: var(--theme-subtitle-color);">加载中...</p>
        </div>
    </div>
</div>

<div id="achievement-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <button id="achievement-modal-close-btn" class="modal-close-btn">×</button>
        <h2 class="modal-title">🏆 成就列表</h2>
        <div id="achievement-content">
            <p style="color: var(--theme-subtitle-color);">加载中...</p>
        </div>
    </div>
</div>

<div id="settings-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <h2 class="modal-title">系统设置</h2>
        <div class="modal-choices">
            <button data-theme="light">☀️ 光辉白日</button>
            <button data-theme="dark">🌙 静谧夜晚</button>
        </div>
    </div>
</div>

<div id="relation-modal" class="modal-overlay hidden">
    <div class="modal-content">
        <button id="relation-modal-close-btn" class="modal-close-btn">×</button>
        <h2 class="modal-title">🕸️ 关系网络</h2>
        <p class="modal-subtitle" style="margin-bottom: 15px;">点击查看该角色对其他人的关系</p>
        <div id="relation-content">
            <p style="color: var(--theme-subtitle-color);">加载中...</p>
        </div>
    </div>
</div>
`;

// ==================== JavaScript 功能实现 ====================

// 全局变量
let isBuildMode = false;
let actionQueue = {};
let currentEditingRoomId = null;
let currentEditingRoomName = null;
let currentFloorForNewRoom = null;
let cachedMVUData = null;
let btnDragData = null; // 按钮拖动数据
let tempRoomCounters = {}; // 临时跟踪每个楼层新建的房间数（防止重复编号）

let scale = 1,
  posX = 0,
  posY = 0;
let isDragging = false,
  hasDragged = false;
let startX, startY, lastX, lastY;

const MAX_RETRIES = 5;
const RETRY_DELAY = 400;
let currentRetry = 0;

// ==================== 工具函数 ====================
function SafeGetValue(data, path, defaultValue = '未知') {
  if (!data) return defaultValue;
  const keys = path.split('.');
  let current = data;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object' || !current.hasOwnProperty(key)) {
      return defaultValue;
    }
    current = current[key];
  }
  if (current === undefined || current === null) return defaultValue;
  if (Array.isArray(current) && current.length > 0) {
    const value = current[0];
    return String(value) === '' ? defaultValue : String(value);
  }
  return String(current) === '' ? defaultValue : String(current);
}

function countCurrentTenants(data) {
  const tenantList = data?.租客列表?.[0];
  if (!tenantList) return 0;
  let count = 0;
  for (const key in tenantList) {
    if (key !== '$meta' && typeof tenantList[key] === 'object') {
      count++;
    }
  }
  return count;
}

function countAvailableBedrooms(data) {
  const roomsData = data?.公寓?.房间列表?.[0];
  if (!roomsData) return 0;
  let bedroomCount = 0;
  for (const roomKey in roomsData) {
    if (roomKey === '$meta') continue;
    const roomData = roomsData[roomKey];
    const roomType = SafeGetValue(roomData, '类型');
    // 只统计卧室类型的房间
    if (roomType === '卧室') {
      bedroomCount++;
    }
  }
  return bedroomCount;
}

function parsePosition(posStr) {
  const parts = posStr.split('-');
  return { start: parseInt(parts[0]), end: parseInt(parts[1]) };
}

function calculateSize(posStr) {
  const pos = parsePosition(posStr);
  return pos.end - pos.start + 1;
}

function findAvailableSlots(floorName, roomsData, totalCapacity = 10) {
  const occupied = [];
  for (const roomKey in roomsData) {
    if (roomKey === '$meta') continue;
    const layout = roomsData[roomKey]?.布局;
    if (layout && SafeGetValue(layout, '楼层') === floorName) {
      const pos = parsePosition(SafeGetValue(layout, '位置', '1-2'));
      for (let i = pos.start; i <= pos.end; i++) {
        occupied.push(i);
      }
    }
  }
  const available = [];
  let start = null;
  for (let i = 1; i <= totalCapacity; i++) {
    if (!occupied.includes(i)) {
      if (start === null) start = i;
      if (i === totalCapacity || occupied.includes(i + 1)) {
        available.push({ start, end: i, size: i - start + 1 });
        start = null;
      }
    } else {
      start = null;
    }
  }
  return available;
}

// ==================== 初始化函数 ====================
function initializeApartmentPlugin() {
  console.log('🚀 初始化掌上公寓插件...');

  // 获取目标文档
  const targetDoc = window.top ? window.top.document : document;

  // 检查是否已存在
  if (targetDoc.getElementById('apartment-toggle-btn')) {
    console.log('⚠️ 掌上公寓已存在，先移除旧的');
    targetDoc.getElementById('apartment-toggle-btn')?.remove();
    targetDoc.getElementById('apartment-main-panel')?.remove();
    // 移除所有模态框
    targetDoc.querySelectorAll('[id$="-modal"]').forEach(el => {
      if (
        el.id.includes('apartment') ||
        el.id.includes('add-') ||
        el.id.includes('management') ||
        el.id.includes('info') ||
        el.id.includes('recruitment') ||
        el.id.includes('history') ||
        el.id.includes('achievement') ||
        el.id.includes('settings')
      ) {
        el.remove();
      }
    });

    // 清理事件
    $(targetDoc).off('.apartment-plugin');
  }

  // 注入样式
  if (!targetDoc.getElementById('apartment-plugin-styles')) {
    targetDoc.head.insertAdjacentHTML('beforeend', styles);
    console.log('✅ 样式已注入');
  }

  // 注入 HTML
  targetDoc.body.insertAdjacentHTML('beforeend', html);
  console.log('✅ HTML 已注入');

  // 从 localStorage 恢复按钮位置
  const btn = targetDoc.getElementById('apartment-toggle-btn');
  try {
    const saved = localStorage.getItem('apartment-btn-position');
    if (saved) {
      const pos = JSON.parse(saved);
      btn.style.left = pos.left + 'px';
      btn.style.top = pos.top + 'px';
      console.log('📍 恢复按钮位置:', pos);
    }
  } catch (e) {
    console.warn('⚠️ 恢复按钮位置失败');
  }

  // 初始化按钮拖动功能
  initializeButtonDrag(targetDoc);

  // 初始化公寓系统
  initializeApartmentSystem(targetDoc);

  console.log('✅ 掌上公寓插件初始化完成！');
}

// ==================== 按钮拖动功能 ====================
function initializeButtonDrag(targetDoc) {
  const btn = targetDoc.getElementById('apartment-toggle-btn');
  const panel = targetDoc.getElementById('apartment-main-panel');
  const $targetDoc = $(targetDoc);

  // 拖动开始
  function handleBtnDragStart(clientX, clientY) {
    if (btnDragData) return false;

    const computedStyle = window.getComputedStyle(btn);
    const currentLeft = parseInt(computedStyle.left) || 0;
    const currentTop = parseInt(computedStyle.top) || 0;

    btnDragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: currentLeft,
      initialTop: currentTop,
    };

    btn.classList.add('dragging');
    console.log('🖱️ 开始拖动按钮');
    return true;
  }

  // 拖动移动
  function handleBtnDragMove(clientX, clientY) {
    if (!btnDragData) return;

    const deltaX = clientX - btnDragData.startX;
    const deltaY = clientY - btnDragData.startY;

    let newLeft = btnDragData.initialLeft + deltaX;
    let newTop = btnDragData.initialTop + deltaY;

    // 限制范围
    const targetWindow = window.top || window;
    const maxX = $(targetWindow).width() - 80;
    const maxY = $(targetWindow).height() - 80;

    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));

    btn.style.left = newLeft + 'px';
    btn.style.top = newTop + 'px';
  }

  // 拖动结束
  function handleBtnDragEnd(clientX, clientY) {
    if (!btnDragData) return;

    btn.classList.remove('dragging');

    // 计算拖动距离
    const deltaX = clientX - btnDragData.startX;
    const deltaY = clientY - btnDragData.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 保存位置
    const computedStyle = window.getComputedStyle(btn);
    const currentLeft = parseInt(computedStyle.left) || 0;
    const currentTop = parseInt(computedStyle.top) || 0;

    const position = {
      left: currentLeft,
      top: currentTop,
    };

    localStorage.setItem('apartment-btn-position', JSON.stringify(position));
    console.log('✅ 按钮拖动结束，保存位置:', position);

    btnDragData = null;

    // 如果是点击（移动距离小于5像素），打开/关闭面板
    if (distance < 5) {
      console.log('🎨 检测到点击，切换面板');
      panel.classList.toggle('active');
      // 打开面板时加载数据
      if (panel.classList.contains('active')) {
        currentRetry = 0; // 重置重试计数器
        populateDataWithMVU(targetDoc);
      }
    }
  }

  // 绑定事件
  $(btn).on('mousedown.apartment-plugin', function (e) {
    if (handleBtnDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $(btn).on('touchstart.apartment-plugin', function (e) {
    const touch = e.originalEvent.touches[0];
    if (handleBtnDragStart(touch.clientX, touch.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $targetDoc.on('mousemove.apartment-plugin', function (e) {
    handleBtnDragMove(e.clientX, e.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('touchmove.apartment-plugin', function (e) {
    const touch = e.originalEvent.touches[0];
    handleBtnDragMove(touch.clientX, touch.clientY);
    if (btnDragData) e.preventDefault();
  });

  $targetDoc.on('mouseup.apartment-plugin', function (e) {
    handleBtnDragEnd(e.clientX, e.clientY);
  });

  $targetDoc.on('touchend.apartment-plugin touchcancel.apartment-plugin', function (e) {
    const touch = e.originalEvent.changedTouches[0];
    if (touch) {
      handleBtnDragEnd(touch.clientX, touch.clientY);
    } else {
      handleBtnDragEnd(0, 0);
    }
  });

  console.log('✅ 按钮拖动功能已初始化');
}

// ==================== 公寓系统初始化 ====================
function initializeApartmentSystem(targetDoc) {
  const screen = targetDoc.getElementById('screen');
  const canvas = targetDoc.getElementById('apartment-canvas');
  const modeDisplay = targetDoc.getElementById('mode-display');
  const buildModeBtn = targetDoc.getElementById('build-mode-btn');
  const allModals = targetDoc.querySelectorAll('.modal-overlay');

  // 设置初始模式
  modeDisplay.textContent = '观察模式';
  modeDisplay.className = 'observation-mode';

  // 视图控制函数 - 直接更新，最高性能
  function updateTransform() {
    canvas.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
  }

  function zoom(factor) {
    // 添加缩放动画类
    canvas.classList.add('zooming');

    scale = Math.min(Math.max(0.2, scale * factor), 2);
    updateTransform();

    // 动画结束后移除类
    setTimeout(() => {
      canvas.classList.remove('zooming');
    }, 300);
  }

  // 拖动画布
  function handleDragStart(e) {
    // 检查是否点击在按钮等UI控件上（不包括房间卡片，房间卡片需要接收点击）
    const target = e.target;
    if (
      target.closest('.dock-button') ||
      target.closest('.zoom-btn') ||
      target.closest('.confirm-btn') ||
      target.closest('.add-room-btn') ||
      target.closest('.add-floor-btn') ||
      target.closest('.level-title') ||
      (target.tagName === 'BUTTON' && !target.closest('.room-card'))
    ) {
      return; // 点击UI控件时不触发拖动
    }

    e.preventDefault(); // 阻止浏览器默认行为
    canvas.classList.remove('zooming'); // 确保拖动时没有过渡动画
    isDragging = true;
    hasDragged = false;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    lastX = posX;
    lastY = posY;
  }

  function handleDragMove(e) {
    if (!isDragging) return;

    const touch = e.touches ? e.touches[0] : e;
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // 降低阈值到3像素，让拖动更灵敏
    if (!hasDragged && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      hasDragged = true;
      e.preventDefault();
    }

    if (hasDragged) {
      e.preventDefault();
      posX = lastX + deltaX;
      posY = lastY + deltaY;
      canvas.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
    }
  }

  function handleDragEnd(e) {
    if (isDragging) {
      isDragging = false;
    }

    // 延迟重置 hasDragged，让 onclick 能够正确判断
    if (hasDragged) {
      setTimeout(() => {
        hasDragged = false;
      }, 50);
    }
  }

  // 绑定画布拖动事件 - 使用非被动模式确保立即响应
  screen.addEventListener('mousedown', handleDragStart, { passive: false });
  targetDoc.addEventListener('mousemove', handleDragMove, { passive: false });
  targetDoc.addEventListener('mouseup', handleDragEnd, { passive: false });
  screen.addEventListener('touchstart', handleDragStart, { passive: false });
  targetDoc.addEventListener('touchmove', handleDragMove, { passive: false });
  targetDoc.addEventListener('touchend', handleDragEnd, { passive: false });

  // 辅助函数：点击后移除焦点
  const clickAndBlur = (element, handler) => {
    element.addEventListener('click', e => {
      handler();
      setTimeout(() => element.blur(), 0);
    });
  };

  // 绑定按钮事件（点击后自动移除焦点，防止出现焦点框）
  clickAndBlur(targetDoc.getElementById('zoom-in-btn'), () => zoom(1.2));
  clickAndBlur(targetDoc.getElementById('zoom-out-btn'), () => zoom(0.8));
  clickAndBlur(targetDoc.getElementById('build-mode-btn'), toggleBuildMode);
  clickAndBlur(targetDoc.getElementById('recruitment-btn'), openRecruitmentModal);
  clickAndBlur(targetDoc.getElementById('settings-btn'), openSettingsModal);
  clickAndBlur(targetDoc.getElementById('event-generator-btn'), openEventGenerator);
  clickAndBlur(targetDoc.getElementById('history-btn'), openHistoryModal);
  clickAndBlur(targetDoc.getElementById('achievement-btn'), openAchievementModal);
  clickAndBlur(targetDoc.getElementById('relation-btn'), openRelationModal);

  // 绑定模态框关闭
  allModals.forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeAllModals();
    });
  });

  // 新建房间相关（点击后移除焦点）
  clickAndBlur(targetDoc.getElementById('confirm-add-room-btn'), confirmAddRoom);
  clickAndBlur(targetDoc.getElementById('confirm-add-floor-btn'), confirmAddFloor);
  clickAndBlur(targetDoc.getElementById('confirm-recruitment-btn'), confirmRecruitment);

  // 🔧 所有模态框的关闭按钮
  const infoModalCloseBtn = targetDoc.getElementById('info-modal-close-btn');
  if (infoModalCloseBtn) {
    clickAndBlur(infoModalCloseBtn, closeAllModals);
  }

  const historyModalCloseBtn = targetDoc.getElementById('history-modal-close-btn');
  if (historyModalCloseBtn) {
    clickAndBlur(historyModalCloseBtn, closeAllModals);
  }

  const achievementModalCloseBtn = targetDoc.getElementById('achievement-modal-close-btn');
  if (achievementModalCloseBtn) {
    clickAndBlur(achievementModalCloseBtn, closeAllModals);
  }

  const relationModalCloseBtn = targetDoc.getElementById('relation-modal-close-btn');
  if (relationModalCloseBtn) {
    clickAndBlur(relationModalCloseBtn, closeAllModals);
  }

  // 设置主题切换
  targetDoc.querySelector('#settings-modal .modal-choices').addEventListener('click', e => {
    if (e.target.dataset.theme) switchTheme(e.target.dataset.theme);
  });

  // 事件生成器
  clickAndBlur(targetDoc.getElementById('close-event-modal-btn'), closeEventGenerator);
  targetDoc.getElementById('single-events').addEventListener('click', e => {
    if (e.target.matches('.event-button')) {
      triggerEvent(e.target.dataset.eventType, '个人');
    }
  });
  targetDoc.getElementById('group-events').addEventListener('click', e => {
    if (e.target.matches('.event-button')) {
      triggerEvent(e.target.dataset.eventType, '集体');
    }
  });

  // 模式切换函数
  function toggleBuildMode() {
    isBuildMode = !isBuildMode;
    buildModeBtn.classList.toggle('active');
    if (isBuildMode) {
      modeDisplay.textContent = '建造模式';
      modeDisplay.className = 'build-mode';
    } else {
      modeDisplay.textContent = '观察模式';
      modeDisplay.className = 'observation-mode';
    }
    if (cachedMVUData) {
      renderApartment(cachedMVUData, targetDoc);
    }
  }

  // 居中视图
  function centerView() {
    setTimeout(() => {
      const viewportWidth = screen.offsetWidth;
      const viewportHeight = screen.offsetHeight;
      const canvasWidth = 1515;

      const scaleX = (viewportWidth - 40) / canvasWidth;
      const scaleY = (viewportHeight - 40) / 800;
      scale = Math.min(1, Math.max(0.25, Math.min(scaleX, scaleY)));

      posX = 0;
      posY = 0;

      updateTransform();
    }, 200);
  }

  centerView();
  console.log('✅ 公寓系统已初始化');
}

// ==================== 数据加载函数 ====================
async function populateDataWithMVU(targetDoc) {
  try {
    // 检查MVU是否可用
    if (typeof Mvu === 'undefined') {
      // 尝试从父窗口获取
      if (window.parent && typeof window.parent.Mvu !== 'undefined') {
        window.Mvu = window.parent.Mvu;
        console.log('✅ 已从父窗口引用MVU');
      } else {
        console.warn('⚠️ MVU框架未加载');
        if (currentRetry < MAX_RETRIES) {
          currentRetry++;
          setTimeout(() => populateDataWithMVU(targetDoc), RETRY_DELAY);
        } else {
          targetDoc.getElementById('date-display').innerText = 'MVU未加载';
        }
        return;
      }
    }

    // 智能获取应该显示的数据
    let targetMessageId = 'latest';
    if (typeof getLastMessageId === 'function' && typeof getChatMessages === 'function') {
      let currentId = getLastMessageId();

      while (currentId >= 0) {
        const message = getChatMessages(currentId).at(-1);
        if (message && message.role !== 'user') {
          targetMessageId = currentId;
          if (currentId !== getLastMessageId()) {
            console.log(`📝 向上查找到第 ${currentId} 层的AI消息`);
          }
          break;
        }
        currentId--;
      }

      if (currentId < 0) {
        targetMessageId = 'latest';
        console.warn('⚠️ 没有找到AI消息，使用最后一层');
      }
    }

    // 使用Mvu.getMvuData获取数据
    const mvuResult = Mvu.getMvuData({ type: 'message', message_id: targetMessageId });
    const data = mvuResult?.stat_data;

    if (!data) {
      console.warn('⚠️ MVU数据为空');
      if (currentRetry < MAX_RETRIES) {
        currentRetry++;
        setTimeout(() => populateDataWithMVU(targetDoc), RETRY_DELAY);
      } else {
        targetDoc.getElementById('date-display').innerText = '未能加载数据QAQ';
      }
      return;
    }

    cachedMVUData = data;
    console.log('✅ 数据加载成功', data);

    // 🔧 重置临时房间计数器（数据刷新说明之前的命令已执行）
    tempRoomCounters = {};

    // 更新时间显示
    const world = data.世界;
    targetDoc.getElementById('date-display').textContent =
      `${SafeGetValue(world, '年份')} ${SafeGetValue(world, '日期')} ${SafeGetValue(world, '星期')}`;
    targetDoc.getElementById('time-display').textContent = SafeGetValue(world, '时间');

    // 更新招募按钮状态：只有租客数量 < 卧室数量且 < 6 时才能招募
    const tenantCount = countCurrentTenants(data);
    const bedroomCount = countAvailableBedrooms(data);
    // 租客数量必须小于卧室数量，且不超过6个（防止AI注意不过来）
    targetDoc.getElementById('recruitment-btn').disabled = tenantCount >= bedroomCount || tenantCount >= 6;

    // 渲染公寓
    renderApartment(data, targetDoc);
  } catch (error) {
    console.error('状态栏加载出错:', error);
    console.error('错误详情:', error.stack);
    targetDoc.getElementById('date-display').innerText = '加载出错: ' + error.message;
  }
}

// ==================== 渲染公寓 ====================
function renderApartment(data, targetDoc) {
  const floorConfig = data.公寓?.楼层配置;
  const roomsData = data.公寓?.房间列表?.[0];

  if (!floorConfig || !roomsData) return;

  const floors = [];
  for (const floorKey in floorConfig) {
    if (floorKey === '$meta') continue;
    const floorInfo = floorConfig[floorKey];
    floors.push({
      key: floorKey,
      name: SafeGetValue(floorInfo, '显示名称', floorKey),
      order: parseFloat(SafeGetValue(floorInfo, '顺序', '999')),
      capacity: parseInt(SafeGetValue(floorInfo, '总容量', '10')),
    });
  }
  floors.sort((a, b) => b.order - a.order);

  const canvas = targetDoc.getElementById('apartment-canvas');
  canvas.innerHTML = '';

  // 添加新建楼层按钮（顶部）
  if (isBuildMode) {
    const addTopFloorBtn = document.createElement('button');
    addTopFloorBtn.className = 'add-floor-btn';
    addTopFloorBtn.textContent = '➕ 新建楼层（向上扩展）';
    addTopFloorBtn.onclick = () => openAddFloorModal('top');
    canvas.appendChild(addTopFloorBtn);
  }

  // 渲染每个楼层
  floors.forEach(floor => {
    const floorElement = createFloorElement(floor, roomsData, targetDoc);
    canvas.appendChild(floorElement);
  });

  // 添加新建楼层按钮（底部）
  if (isBuildMode) {
    const addBottomFloorBtn = document.createElement('button');
    addBottomFloorBtn.className = 'add-floor-btn';
    addBottomFloorBtn.textContent = '➕ 新建楼层（向下扩展）';
    addBottomFloorBtn.onclick = () => openAddFloorModal('bottom');
    canvas.appendChild(addBottomFloorBtn);
  }
}

// ==================== 创建楼层元素 ====================
function createFloorElement(floor, roomsData, targetDoc) {
  const floorRooms = [];
  const outdoorRooms = { left: null, right: null };

  for (const roomKey in roomsData) {
    if (roomKey === '$meta') continue;
    const roomData = roomsData[roomKey];
    const layout = roomData?.布局;
    if (layout && SafeGetValue(layout, '楼层') === floor.name) {
      const position = SafeGetValue(layout, '位置', '1-2');

      if (position === 'outdoor-left') {
        outdoorRooms.left = { key: roomKey, data: roomData };
      } else if (position === 'outdoor-right') {
        outdoorRooms.right = { key: roomKey, data: roomData };
      } else {
        const pos = parsePosition(position);
        floorRooms.push({
          key: roomKey,
          data: roomData,
          position: position,
          start: pos.start,
          end: pos.end,
          size: pos.end - pos.start + 1,
        });
      }
    }
  }
  floorRooms.sort((a, b) => a.start - b.start);

  const floorWrapper = document.createElement('div');
  floorWrapper.className = 'floor-wrapper';

  // 左侧区域
  const leftDiv = document.createElement('div');
  leftDiv.className = 'floor-outdoor-left';
  if (outdoorRooms.left) {
    leftDiv.appendChild(createOutdoorCard(outdoorRooms.left, targetDoc));
  }
  floorWrapper.appendChild(leftDiv);

  // 主楼层
  const mainDiv = document.createElement('div');
  mainDiv.className = 'floor-main';

  const floorDiv = document.createElement('div');
  floorDiv.className = 'level';
  floorDiv.dataset.floorKey = floor.key;

  const titleDiv = document.createElement('div');
  titleDiv.className = 'level-title';
  titleDiv.textContent = floor.name;
  floorDiv.appendChild(titleDiv);

  const gridDiv = document.createElement('div');
  gridDiv.className = 'room-grid';

  let currentPos = 1;
  floorRooms.forEach(room => {
    if (room.start > currentPos) {
      const emptySize = room.start - currentPos;
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'placeholder';
      emptyDiv.style.flexGrow = emptySize;
      gridDiv.appendChild(emptyDiv);
    }

    const roomCard = createRoomCard(room, targetDoc);
    gridDiv.appendChild(roomCard);
    currentPos = room.end + 1;
  });

  if (currentPos <= floor.capacity) {
    const emptySize = floor.capacity - currentPos + 1;
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'placeholder';
    emptyDiv.style.flexGrow = emptySize;
    gridDiv.appendChild(emptyDiv);
  }

  floorDiv.appendChild(gridDiv);

  if (isBuildMode) {
    const availableSlots = findAvailableSlots(floor.name, roomsData, floor.capacity);
    if (availableSlots.length > 0) {
      const addRoomBtn = document.createElement('button');
      addRoomBtn.className = 'add-room-btn';
      addRoomBtn.textContent = `➕ 在${floor.name}新建房间`;
      addRoomBtn.onclick = () => openAddRoomModal(floor.name, availableSlots);
      floorDiv.appendChild(addRoomBtn);
    }
  }

  mainDiv.appendChild(floorDiv);
  floorWrapper.appendChild(mainDiv);

  // 右侧区域
  const rightDiv = document.createElement('div');
  rightDiv.className = 'floor-outdoor-right';
  if (outdoorRooms.right) {
    rightDiv.appendChild(createOutdoorCard(outdoorRooms.right, targetDoc));
  }
  floorWrapper.appendChild(rightDiv);

  return floorWrapper;
}

//====================创建室外卡片====================
function createOutdoorCard(outdoorRoom, targetDoc) {
  const card = document.createElement('div');
  card.className = 'room-card outdoor-room outdoor-card actionable';
  card.dataset.roomName = outdoorRoom.key;

  const roomName = SafeGetValue(outdoorRoom.data, '名称');
  const nameSpan = document.createElement('span');
  nameSpan.className = 'room-name';
  nameSpan.textContent = roomName;
  card.appendChild(nameSpan);

  // 阻止房间卡片触发画布拖动
  card.addEventListener('mousedown', e => {
    e.stopPropagation();
  });

  // PC端点击事件
  card.onclick = e => {
    e.stopPropagation();
    handleRoomClick(card, targetDoc);
  };

  // 移动端触摸事件
  card.addEventListener(
    'touchstart',
    e => {
      e.stopPropagation();
    },
    { passive: true },
  );

  card.addEventListener('touchend', e => {
    e.stopPropagation();
    e.preventDefault();
    handleRoomClick(card, targetDoc);
    // 触摸后立即移除焦点，防止出现焦点框
    setTimeout(() => card.blur(), 0);
  });

  return card;
}

// ==================== 创建房间卡片 ====================
function createRoomCard(room, targetDoc) {
  const roomCard = document.createElement('div');
  roomCard.className = 'room-card actionable';
  roomCard.dataset.roomName = room.key;
  roomCard.style.flexGrow = room.size;

  const roomType = SafeGetValue(room.data, '类型');
  const roomName = SafeGetValue(room.data, '名称', room.key);
  const occupant = SafeGetValue(room.data, '住户');

  if (roomType === '您的房间') {
    roomCard.classList.add('your-room');
  } else if (roomType === '固定设施') {
    roomCard.classList.add('fixed-room');
  } else if (roomType === '卧室') {
    roomCard.classList.add('bedroom-room');
  } else if (roomType === '功能性房间') {
    roomCard.classList.add('functional-room');
  } else {
    roomCard.classList.add('empty-room');
  }

  const nameSpan = document.createElement('span');
  nameSpan.className = 'room-name';
  nameSpan.textContent = roomType === '您的房间' ? '👑 ' + roomName : roomName;
  roomCard.appendChild(nameSpan);

  if (roomType === '卧室') {
    const occupantSpan = document.createElement('span');
    occupantSpan.className = 'room-occupant';
    if (occupant !== '未知' && occupant !== '<user>') {
      occupantSpan.textContent = `入住: ${occupant}`;
      roomCard.dataset.occupant = occupant;
    } else {
      occupantSpan.textContent = '(空)';
    }
    roomCard.appendChild(occupantSpan);
  }

  // 阻止房间卡片触发画布拖动
  roomCard.addEventListener('mousedown', e => {
    e.stopPropagation();
  });

  // PC端点击事件
  roomCard.onclick = e => {
    e.stopPropagation();
    handleRoomClick(roomCard, targetDoc);
  };

  // 移动端触摸事件
  roomCard.addEventListener(
    'touchstart',
    e => {
      e.stopPropagation();
    },
    { passive: true },
  );

  roomCard.addEventListener('touchend', e => {
    e.stopPropagation();
    e.preventDefault();
    handleRoomClick(roomCard, targetDoc);
    // 触摸后立即移除焦点，防止出现焦点框
    setTimeout(() => roomCard.blur(), 0);
  });

  return roomCard;
}

// ==================== 房间点击处理 ====================
function handleRoomClick(roomCard, targetDoc) {
  if (isBuildMode) {
    openManagementMenu(roomCard, targetDoc);
  } else {
    showTenantInfoModal(roomCard, targetDoc);
  }
}

// ==================== 租客信息显示 ====================
async function showTenantInfoModal(roomCard, targetDoc) {
  try {
    // 优先使用缓存数据，如果没有则重新获取
    let data = cachedMVUData;
    if (!data && typeof Mvu !== 'undefined') {
      let targetMessageId = 'latest';
      if (typeof getLastMessageId === 'function') {
        targetMessageId = getLastMessageId();
      }
      const mvuResult = Mvu.getMvuData({ type: 'message', message_id: targetMessageId });
      data = mvuResult?.stat_data;
    }
    if (!data) return;
    const roomNameKey = roomCard.dataset.roomName;
    const occupantName = roomCard.dataset.occupant;

    if (!occupantName) {
      openInfoModal(roomCard, targetDoc, data);
      return;
    }

    // 查找租客数据
    let tenantData = null;
    const tenantList = data.租客列表?.[0];
    if (tenantList) {
      for (const key in tenantList) {
        if (key === '$meta') continue;
        if (key === occupantName) {
          tenantData = tenantList[key];
          break;
        }
      }
    }

    if (tenantData) {
      targetDoc.getElementById('info-modal-title').textContent = occupantName;
      targetDoc.getElementById('info-modal-subtitle').textContent =
        `${SafeGetValue(tenantData, '职业')} | ${SafeGetValue(tenantData, '年龄')}岁`;

      const favorability = parseInt(SafeGetValue(tenantData, '好感度', '0'), 10);
      const lust = parseInt(SafeGetValue(tenantData, '性欲', '0'), 10);
      const daysHere = parseInt(SafeGetValue(tenantData, '入住天数', '0'), 10);
      const rent = SafeGetValue(tenantData, '月租金', '1500');
      const rentPaid = SafeGetValue(tenantData, '本月已缴租', 'false') === 'true';

      let detailsHTML = '<ul>';
      detailsHTML += `<li><strong>外貌:</strong> ${SafeGetValue(tenantData, '外貌')}</li>`;
      detailsHTML += `<li><strong>性格:</strong> ${SafeGetValue(tenantData, '性格')}</li>`;
      detailsHTML += `<li><strong>恋情:</strong> ${SafeGetValue(tenantData, '恋情')}</li>`;
      detailsHTML += `<li><strong>当前位置:</strong> ${SafeGetValue(tenantData, '当前位置')}</li>`;
      detailsHTML += `<li><strong>内心:</strong> ${SafeGetValue(tenantData, '内心')}</li>`;
      detailsHTML += `<li><strong>状态:</strong> ${SafeGetValue(tenantData, '状态')}</li>`;
      detailsHTML += `<li><strong>穿搭:</strong> ${SafeGetValue(tenantData, '穿搭')}</li>`;

      detailsHTML += `<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--theme-border-color);">`;
      detailsHTML += `<li><strong>入住日期:</strong> ${SafeGetValue(tenantData, '入住日期')}</li>`;
      detailsHTML += `<li><strong>入住天数:</strong> ${daysHere}天</li>`;
      detailsHTML += `<li><strong>月租金:</strong> ¥${rent} ${rentPaid ? '✅已缴' : '⚠️未缴'}</li>`;

      // ⚠️ 人际关系字段已移除，请点击底部"关系"按钮查看关系网络

      detailsHTML += `<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--theme-border-color);">`;
      detailsHTML += `<li>
                                <strong>好感度:</strong>
                                <div class="progress-bar-container">
                                    <div class="progress-bar"><div class="progress-bar-fill progress-bar-favor" style="width: ${favorability}%"></div></div>
                                    <span class="progress-value">${favorability}</span>
                                </div>
                             </li>`;
      detailsHTML += `<li>
                                <strong>性欲:</strong>
                                <div class="progress-bar-container">
                                    <div class="progress-bar"><div class="progress-bar-fill progress-bar-lust" style="width: ${lust}%"></div></div>
                                    <span class="progress-value">${lust}</span>
                                </div>
                             </li>`;
      detailsHTML += '</ul>';
      targetDoc.getElementById('info-modal-details').innerHTML = detailsHTML;
    } else {
      targetDoc.getElementById('info-modal-title').textContent = occupantName;
      targetDoc.getElementById('info-modal-subtitle').textContent = '租客信息未找到';
      targetDoc.getElementById('info-modal-details').innerHTML =
        "<p style='padding: 10px 0;'>无法找到该租客的详细信息</p>";
    }
    targetDoc.getElementById('info-modal').classList.remove('hidden');
  } catch (e) {
    console.error('显示租客信息时出错: ', e);
  }
}

async function openInfoModal(roomCard, targetDoc, data) {
  if (!data) {
    data = cachedMVUData;
    if (!data && typeof Mvu !== 'undefined') {
      let targetMessageId = 'latest';
      if (typeof getLastMessageId === 'function') {
        targetMessageId = getLastMessageId();
      }
      const mvuResult = Mvu.getMvuData({ type: 'message', message_id: targetMessageId });
      data = mvuResult?.stat_data;
    }
  }
  const roomNameKey = roomCard.dataset.roomName;
  const roomData = data.公寓?.房间列表?.[0]?.[roomNameKey];

  const roomType = SafeGetValue(roomData, '类型');
  const roomName = SafeGetValue(roomData, '名称', roomNameKey);
  const description = SafeGetValue(roomData, '描述', '无');

  targetDoc.getElementById('info-modal-title').textContent = roomName;
  targetDoc.getElementById('info-modal-subtitle').textContent = `类型：${roomType}`;
  targetDoc.getElementById('info-modal-details').innerHTML =
    `<p style="padding: 10px 0;"><strong>房间描述:</strong> ${description}</p>`;
  targetDoc.getElementById('info-modal').classList.remove('hidden');
}

// ==================== 格子选择器 ====================
let gridSelectionState = { start: null, end: null, isSelecting: false };

function openAddRoomModal(floorName, availableSlots) {
  const targetDoc = window.top ? window.top.document : document;
  currentFloorForNewRoom = floorName;
  targetDoc.getElementById('add-room-modal-title').textContent = `在【${floorName}】新建空房间`;
  targetDoc.getElementById('add-room-modal-subtitle').textContent =
    `新建的房间将作为"空房间"（占位但未装修），之后可在建造模式下装修\n可用空位：${availableSlots.map(s => `${s.start}-${s.end}`).join(', ')}`;

  gridSelectionState = { start: null, end: null, isSelecting: false };

  const gridContainer = targetDoc.getElementById('grid-selector');
  gridContainer.innerHTML = '';

  // 确定已占用的位置
  const occupiedSlots = new Set();
  if (cachedMVUData) {
    const roomsData = cachedMVUData.公寓?.房间列表?.[0];
    if (roomsData) {
      for (const roomKey in roomsData) {
        if (roomKey === '$meta') continue;
        const roomData = roomsData[roomKey];
        const layout = roomData?.布局;
        if (layout && SafeGetValue(layout, '楼层') === floorName) {
          const position = SafeGetValue(layout, '位置', '1-2');
          if (position !== 'outdoor-left' && position !== 'outdoor-right') {
            const pos = parsePosition(position);
            for (let i = pos.start; i <= pos.end; i++) {
              occupiedSlots.add(i);
            }
          }
        }
      }
    }
  }

  // 创建10个格子
  for (let i = 1; i <= 10; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.position = i;
    cell.textContent = i;

    if (occupiedSlots.has(i)) {
      cell.classList.add('occupied');
      cell.title = '已占用';
    } else {
      cell.addEventListener('mousedown', () => handleGridSelect(i, occupiedSlots, targetDoc));
      cell.addEventListener('mouseenter', () => {
        if (gridSelectionState.isSelecting) {
          updateGridSelection(i, occupiedSlots, targetDoc);
        }
      });
      cell.addEventListener('touchstart', e => {
        e.preventDefault();
        handleGridSelect(i, occupiedSlots, targetDoc);
      });
    }

    gridContainer.appendChild(cell);
  }

  const handleEnd = () => {
    gridSelectionState.isSelecting = false;
  };
  document.addEventListener('mouseup', handleEnd, { once: true });
  document.addEventListener('touchend', handleEnd, { once: true });

  updateSelectionDisplay(targetDoc);
  targetDoc.getElementById('add-room-modal').classList.remove('hidden');
}

function handleGridSelect(position, occupiedSlots, targetDoc) {
  if (occupiedSlots.has(position)) return;

  gridSelectionState.start = position;
  gridSelectionState.end = position;
  gridSelectionState.isSelecting = true;
  updateGridSelection(position, occupiedSlots, targetDoc);
}

function updateGridSelection(position, occupiedSlots, targetDoc) {
  if (!gridSelectionState.start) return;

  const start = Math.min(gridSelectionState.start, position);
  const end = Math.max(gridSelectionState.start, position);

  let valid = true;
  for (let i = start; i <= end; i++) {
    if (occupiedSlots.has(i)) {
      valid = false;
      break;
    }
  }

  if (valid) {
    gridSelectionState.end = position;
  }

  const cells = targetDoc.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    const pos = parseInt(cell.dataset.position);
    if (!occupiedSlots.has(pos)) {
      const finalStart = Math.min(gridSelectionState.start, gridSelectionState.end);
      const finalEnd = Math.max(gridSelectionState.start, gridSelectionState.end);

      if (pos >= finalStart && pos <= finalEnd) {
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    }
  });

  updateSelectionDisplay(targetDoc);
}

function updateSelectionDisplay(targetDoc) {
  const display = targetDoc.getElementById('selected-range-display');
  if (gridSelectionState.start && gridSelectionState.end) {
    const start = Math.min(gridSelectionState.start, gridSelectionState.end);
    const end = Math.max(gridSelectionState.start, gridSelectionState.end);
    const size = end - start + 1;
    display.textContent = `已选择: ${start}-${end} (大小: ${size} 格)`;
    display.style.color = '#28a745';
    display.style.fontWeight = 'bold';
  } else {
    display.textContent = '请选择房间位置';
    display.style.color = 'var(--theme-subtitle-color)';
    display.style.fontWeight = 'normal';
  }
}

// ==================== 其他模态框函数 ====================
function openAddFloorModal(position) {
  const targetDoc = window.top ? window.top.document : document;
  targetDoc.getElementById('add-floor-position').value = position;
  targetDoc.getElementById('add-floor-modal').classList.remove('hidden');
}

function openManagementMenu(roomCard, targetDoc) {
  currentEditingRoomName = roomCard.dataset.roomName;
  const roomType = SafeGetValue(cachedMVUData, `公寓.房间列表.0.${currentEditingRoomName}.类型`);
  const occupant = roomCard.dataset.occupant;

  targetDoc.getElementById('management-modal-title').textContent = currentEditingRoomName;
  targetDoc.getElementById('management-modal-subtitle').textContent = `类型：${roomType}`;

  const choicesDiv = targetDoc.getElementById('management-modal-choices');
  choicesDiv.innerHTML = '';

  // ========== 空房间（未装修）：可以装修或删除 ==========
  if (roomType === '空房间') {
    const decorateBtn = document.createElement('button');
    decorateBtn.textContent = '🏠 装修为卧室';
    decorateBtn.onclick = () => {
      const command = `将【${currentEditingRoomName}】装修为卧室，请执行：
_.set('公寓.房间列表[0].${currentEditingRoomName}.类型[0]', '空房间', '卧室')

请同时更新描述字段，添加适合卧室的描述（例如："温馨舒适的卧室"）`;
      fillCommand(command);
      closeAllModals();
    };
    choicesDiv.appendChild(decorateBtn);

    const functionalBtn = document.createElement('button');
    functionalBtn.textContent = '🎨 装修为功能性房间';
    functionalBtn.onclick = () => {
      const roomPurpose = prompt('请输入房间用途名称（例如：书房、健身房）');
      if (roomPurpose) {
        const command = `将【${currentEditingRoomName}】装修为功能性房间【${roomPurpose}】，请执行：
_.set('公寓.房间列表[0].${currentEditingRoomName}.类型[0]', '空房间', '功能性房间')
_.set('公寓.房间列表[0].${currentEditingRoomName}.名称[0]', '${currentEditingRoomName}', '${roomPurpose}')

请同时更新描述字段，添加关于【${roomPurpose}】的详细描述（例如设施、功能等）`;
        fillCommand(command);
        closeAllModals();
      }
    };
    choicesDiv.appendChild(functionalBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ 删除房间';
    deleteBtn.className = 'danger-btn';
    deleteBtn.onclick = () => {
      const command = `删除房间【${currentEditingRoomName}】，释放该位置，请执行：
_.remove('公寓.房间列表[0]', '${currentEditingRoomName}')`;
      fillCommand(command);
      closeAllModals();
    };
    choicesDiv.appendChild(deleteBtn);
  }
  // ========== 卧室（有住户）：只能让租客退租 ==========
  else if (roomType === '卧室' && occupant && occupant !== '未知') {
    const evictBtn = document.createElement('button');
    evictBtn.textContent = '🚪 让租客退租';
    evictBtn.className = 'danger-btn';
    evictBtn.onclick = () => {
      const command = `让租客【${occupant}】从【${currentEditingRoomName}】退租，请执行：
_.set('公寓.房间列表[0].${currentEditingRoomName}.住户[0]', '${occupant}', '未知')
_.remove('租客列表[0]', '${occupant}')

同时禁用Chat Lore中的租客信息（防止AI继续提及该租客）：
/getchatbook | /findentry file={{pipe}} field=key ${occupant} | /setentryfield file={{pipe:1}} uid={{pipe:0}} field=disable 1`;
      fillCommand(command);
      closeAllModals();
    };
    choicesDiv.appendChild(evictBtn);
  }
  // ========== 卧室（无住户）：只能拆除装修 ==========
  else if (roomType === '卧室' && (!occupant || occupant === '未知')) {
    const removeDecorationBtn = document.createElement('button');
    removeDecorationBtn.textContent = '🔨 拆除装修';
    removeDecorationBtn.className = 'danger-btn';
    removeDecorationBtn.onclick = () => {
      const command = `拆除【${currentEditingRoomName}】的装修，变回空房间，请执行：
_.set('公寓.房间列表[0].${currentEditingRoomName}.类型[0]', '卧室', '空房间')

请同时更新描述字段，改为："新建的空房间，等待装修"`;
      fillCommand(command);
      closeAllModals();
    };
    choicesDiv.appendChild(removeDecorationBtn);
  }
  // ========== 功能性房间：只能拆除装修 ==========
  else if (roomType === '功能性房间') {
    const removeDecorationBtn = document.createElement('button');
    removeDecorationBtn.textContent = '🔨 拆除装修';
    removeDecorationBtn.className = 'danger-btn';
    removeDecorationBtn.onclick = () => {
      const currentName = SafeGetValue(cachedMVUData, `公寓.房间列表.0.${currentEditingRoomName}.名称`);
      const command = `拆除【${currentEditingRoomName}】（当前名称：${currentName}）的装修，变回空房间，请执行：
_.set('公寓.房间列表[0].${currentEditingRoomName}.类型[0]', '功能性房间', '空房间')
_.set('公寓.房间列表[0].${currentEditingRoomName}.名称[0]', '${currentName}', '${currentEditingRoomName}')

请同时更新描述字段，改为："新建的空房间，等待装修"`;
      fillCommand(command);
      closeAllModals();
    };
    choicesDiv.appendChild(removeDecorationBtn);
  }
  // ========== 固定设施/您的房间/室外区域：不可操作 ==========
  else if (roomType === '固定设施' || roomType === '您的房间' || roomType === '室外区域') {
    const infoText = document.createElement('p');
    infoText.textContent = '该区域不可修改或拆除';
    infoText.style.cssText = 'padding: 20px; text-align: center; color: var(--theme-subtitle-color);';
    choicesDiv.appendChild(infoText);
  }

  targetDoc.getElementById('management-modal').classList.remove('hidden');
}

// ==================== 命令生成 ====================
function confirmAddRoom() {
  const targetDoc = window.top ? window.top.document : document;
  const floorName = currentFloorForNewRoom;

  if (!gridSelectionState.start || !gridSelectionState.end) {
    alert('请先选择房间位置！');
    return;
  }

  const start = Math.min(gridSelectionState.start, gridSelectionState.end);
  const end = Math.max(gridSelectionState.start, gridSelectionState.end);
  const position = `${start}-${end}`;

  // 生成友好的房间名称（智能分配编号，避免重复）
  const chineseNumbers = [
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
    '十一',
    '十二',
    '十三',
    '十四',
    '十五',
  ];

  // 🔧 收集该楼层已使用的房间编号
  const usedNumbers = new Set();
  if (cachedMVUData && cachedMVUData.公寓 && cachedMVUData.公寓.房间列表) {
    const roomsData = cachedMVUData.公寓.房间列表[0];
    if (roomsData) {
      for (const roomKey in roomsData) {
        if (roomKey === '$meta') continue;
        const roomData = roomsData[roomKey];
        const layout = roomData?.布局;
        if (layout && SafeGetValue(layout, '楼层') === floorName) {
          // 提取房间编号（例如从"四楼房间三"中提取"三"）
          const match = roomKey.match(/房间(.+)$/);
          if (match) {
            usedNumbers.add(match[1]);
          }
        }
      }
    }
  }

  // 🔧 加上临时计数器中已分配的编号
  if (!tempRoomCounters[floorName]) {
    tempRoomCounters[floorName] = [];
  }
  tempRoomCounters[floorName].forEach(num => usedNumbers.add(num));

  // 🔧 找到第一个未被使用的编号
  let roomNumber = null;
  for (let i = 0; i < chineseNumbers.length; i++) {
    if (!usedNumbers.has(chineseNumbers[i])) {
      roomNumber = chineseNumbers[i];
      break;
    }
  }

  // 如果中文数字用完了，用阿拉伯数字
  if (!roomNumber) {
    let numIndex = chineseNumbers.length + 1;
    while (usedNumbers.has(numIndex.toString())) {
      numIndex++;
    }
    roomNumber = numIndex.toString();
  }

  // 记录到临时计数器
  tempRoomCounters[floorName].push(roomNumber);

  // 生成房间名：四楼房间一、四楼房间二...
  const roomName = `${floorName}房间${roomNumber}`;

  const command = `在【${floorName}】新建空房间【${roomName}】（占据位置但未装修，之后可装修为卧室或功能性房间），请执行：
_.insert('公寓.房间列表[0]', '${roomName}', {
  "类型": ["空房间", "房间类型"],
  "名称": ["${roomName}", "房间名称"],
  "住户": ["未知", "当前住户"],
  "描述": ["新建的空房间，等待装修", "详细描述"],
  "布局": { "楼层": "${floorName}", "位置": "${position}" }
})`;

  fillCommand(command);
  closeAllModals();
}

function confirmAddFloor() {
  const targetDoc = window.top ? window.top.document : document;
  const floorName = targetDoc.getElementById('add-floor-name').value.trim();
  const position = targetDoc.getElementById('add-floor-position').value;

  if (!floorName) {
    alert('请输入楼层名称！');
    return;
  }

  const command = `新建楼层【${floorName}】（${position === 'top' ? '向上扩展' : '向下扩展'}），请执行：
_.insert('公寓.楼层配置', '${floorName}', {
  "显示名称": ["${floorName}", "显示名称"],
  "总容量": [10, "总容量"],
  "顺序": [${position === 'top' ? '5' : '-2'}, "顺序值"]
})

然后刷新状态栏即可看到新楼层。`;

  fillCommand(command);
  closeAllModals();
}

function confirmRecruitment() {
  const targetDoc = window.top ? window.top.document : document;
  const keywords = targetDoc.getElementById('recruitment-keywords').value.trim();
  const command = `招募一名符合以下特征的租客：${keywords}`;
  fillCommand(command);
  closeAllModals();
}

function fillCommand(command) {
  try {
    const chatInput = parent.document.querySelector('#send_textarea');
    if (chatInput) {
      if (chatInput.value.trim() !== '') {
        chatInput.value += '\n' + command;
      } else {
        chatInput.value = command;
      }
      chatInput.focus();
    } else {
      throw new Error();
    }
  } catch (e) {
    alert('未能自动找到输入框，请手动复制：\n\n' + command);
  }
}

// ==================== 其他功能 ====================
function closeAllModals() {
  const targetDoc = window.top ? window.top.document : document;
  const allModals = targetDoc.querySelectorAll('.modal-overlay');
  allModals.forEach(modal => modal.classList.add('hidden'));
}

function openRecruitmentModal() {
  const targetDoc = window.top ? window.top.document : document;
  targetDoc.getElementById('recruitment-modal').classList.remove('hidden');
}

function openSettingsModal() {
  const targetDoc = window.top ? window.top.document : document;
  targetDoc.getElementById('settings-modal').classList.remove('hidden');
}

function switchTheme(theme) {
  const targetDoc = window.top ? window.top.document : document;
  const panel = targetDoc.getElementById('apartment-main-panel');
  if (theme === 'dark') {
    panel.classList.add('dark-theme');
  } else {
    panel.classList.remove('dark-theme');
  }
}

function openHistoryModal() {
  const targetDoc = window.top ? window.top.document : document;
  const data = cachedMVUData;
  if (!data) return;

  // MVU格式：[数据数组, 描述文本]，需要用[0]获取实际数据数组
  const historyArray = data.事件历史?.[0];
  const contentDiv = targetDoc.getElementById('history-content');

  const events = [];
  if (historyArray && Array.isArray(historyArray)) {
    for (let i = 0; i < historyArray.length; i++) {
      const item = historyArray[i];
      // 跳过元数据标记
      if (item === '$__META_EXTENSIBLE__$') continue;
      if (typeof item === 'string') {
        events.push(item);
      }
    }
  }

  if (events.length === 0) {
    contentDiv.innerHTML = '<p style="color: var(--theme-subtitle-color); text-align: center;">暂无事件记录</p>';
  } else {
    let html = '<div style="line-height: 1.8;">';
    events.forEach(event => {
      html += `<div style="padding: 8px 0; border-bottom: 1px solid var(--theme-border-color);">📌 ${event}</div>`;
    });
    html += '</div>';
    contentDiv.innerHTML = html;
  }

  targetDoc.getElementById('history-modal').classList.remove('hidden');
}

function openAchievementModal() {
  const targetDoc = window.top ? window.top.document : document;
  const data = cachedMVUData;
  if (!data) return;

  // MVU格式：[数据数组, 描述文本]，需要用[0]获取实际数据数组
  const achievementsArray = data.成就列表?.[0];
  const contentDiv = targetDoc.getElementById('achievement-content');

  // 收集所有成就
  const achievementList = [];

  if (achievementsArray && Array.isArray(achievementsArray)) {
    achievementsArray.forEach((item, index) => {
      // 跳过元数据标记
      if (item === '$__META_EXTENSIBLE__$') return;

      if (typeof item === 'string') {
        // 解析格式："成就名 - 成就描述"
        const parts = item.split(' - ');
        if (parts.length >= 2) {
          achievementList.push({
            name: parts[0].trim(),
            desc: parts.slice(1).join(' - ').trim(),
            achieved: true,
            date: '未知',
          });
        } else {
          // 如果没有按照格式，直接使用整个字符串作为描述
          achievementList.push({
            name: `成就 ${achievementList.length + 1}`,
            desc: item,
            achieved: true,
            date: '未知',
          });
        }
      }
    });
  }

  if (achievementList.length === 0) {
    contentDiv.innerHTML =
      '<p style="color: var(--theme-subtitle-color); text-align: center;">暂无成就<br><small style="font-size: 0.85em;">AI会在达成特定条件时自动添加成就</small></p>';
  } else {
    let html = '<div style="display: grid; gap: 15px;">';
    achievementList.forEach(achievement => {
      html += `<div style="padding: 15px; background-color: ${achievement.achieved ? 'var(--color-outdoor)' : 'var(--theme-phone-bg)'}; border-radius: 8px; border: 1px solid var(--theme-border-color);">
                <div style="font-weight: bold; margin-bottom: 5px;">${achievement.achieved ? '🏆' : '🔒'} ${achievement.name}</div>
                <div style="font-size: 0.9em; color: var(--theme-subtitle-color);">${achievement.desc}</div>
                ${achievement.achieved && achievement.date !== '未知' ? `<div style="font-size: 0.8em; color: var(--theme-subtitle-color); margin-top: 5px;">达成于：${achievement.date}</div>` : ''}
            </div>`;
    });
    html += '</div>';
    contentDiv.innerHTML = html;
  }

  targetDoc.getElementById('achievement-modal').classList.remove('hidden');
}

// ==================== 事件生成器 ====================
const singleEventTypes = ['个人情感类', '生活经济类', '日常委托类', '家居修理类'];
const groupEventTypes = ['节日派对类', '室内娱乐类', '突发状况类', '共同创作类'];

function openEventGenerator() {
  const targetDoc = window.top ? window.top.document : document;
  targetDoc.getElementById('event-modal').classList.add('visible');
}

function closeEventGenerator() {
  const targetDoc = window.top ? window.top.document : document;
  targetDoc.getElementById('event-modal').classList.remove('visible');
}

function triggerEvent(type, category) {
  let eventName = type;
  if (type.startsWith('random-')) {
    const isSingle = type.includes('single');
    const eventList = isSingle ? singleEventTypes : groupEventTypes;
    eventName = eventList[Math.floor(Math.random() * eventList.length)];
    category = isSingle ? '个人' : '集体';
  }
  const command = `我选择触发${category}随机事件：${eventName}，请帮我丝滑过渡。`;
  fillCommand(command);
  closeEventGenerator();
}

// ==================== 关系网络功能 ====================
function openRelationModal() {
  const targetDoc = window.top ? window.top.document : document;
  const data = cachedMVUData;
  if (!data) return;

  const tenantList = data.租客列表?.[0];
  const contentDiv = targetDoc.getElementById('relation-content');

  if (!tenantList || Object.keys(tenantList).filter(k => k !== '$meta').length === 0) {
    contentDiv.innerHTML = '<p style="color: var(--theme-subtitle-color); text-align: center;">暂无租客数据</p>';
    targetDoc.getElementById('relation-modal').classList.remove('hidden');
    return;
  }

  // 构建租客列表（不包括<user>，放弃反推）
  const tenants = [];

  for (const key in tenantList) {
    if (key === '$meta') continue;
    const tenant = tenantList[key];
    const relations = tenant.关系 || {};

    tenants.push({
      name: key,
      displayName: key,
      relations: relations,
    });
  }

  // 生成界面
  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">';

  console.log('📊 所有租客数据:', tenants);

  tenants.forEach(tenant => {
    const relationCount = Object.keys(tenant.relations).filter(k => k !== '$meta').length;
    console.log(`🔍 租客 ${tenant.name} 的关系:`, tenant.relations, `数量: ${relationCount}`);
    html += `
            <div class="tenant-relation-card" data-tenant-name="${tenant.name}"
                 style="padding: 15px; background: var(--theme-modal-btn-bg); border-radius: 10px; cursor: pointer; transition: all 0.2s; border: 2px solid var(--theme-border-color); text-align: center;"
                 onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <div style="font-size: 28px; margin-bottom: 8px;">👥</div>
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${tenant.displayName}</div>
                <div style="font-size: 12px; color: var(--theme-subtitle-color);">
                    ${relationCount > 0 ? `${relationCount} 个关系` : '暂无关系'}
                </div>
            </div>
        `;
  });

  html += '</div>';
  contentDiv.innerHTML = html;

  // 使用事件委托处理点击
  contentDiv.removeEventListener('click', handleRelationCardClick); // 先移除旧的监听器
  contentDiv.addEventListener('click', handleRelationCardClick);

  targetDoc.getElementById('relation-modal').classList.remove('hidden');
}

// 事件委托处理函数
function handleRelationCardClick(e) {
  const card = e.target.closest('.tenant-relation-card');
  if (card) {
    const tenantName = card.dataset.tenantName;
    console.log('🎯 点击了租客卡片:', tenantName);
    showCharacterRelations(tenantName);
  }
}

// 显示某个租客的关系详情（简单列表）
function showCharacterRelations(characterName) {
  console.log('🎯 showCharacterRelations 被调用，角色名:', characterName);

  const targetDoc = window.top ? window.top.document : document;
  const data = cachedMVUData;
  if (!data) {
    console.error('❌ cachedMVUData 为空');
    return;
  }

  const tenantList = data.租客列表?.[0];
  const contentDiv = targetDoc.getElementById('relation-content');

  if (!tenantList) {
    console.error('❌ tenantList 为空');
    contentDiv.innerHTML = '<p style="color: var(--theme-subtitle-color); text-align: center;">租客数据为空</p>';
    return;
  }

  // 直接获取租客数据
  const tenant = tenantList[characterName];
  if (!tenant) {
    console.error('❌ 未找到租客:', characterName);
    contentDiv.innerHTML = '<p style="color: var(--theme-subtitle-color); text-align: center;">未找到租客数据</p>';
    return;
  }

  const character = {
    name: characterName,
    displayName: characterName,
    relations: tenant.关系 || {},
  };

  console.log('✅ 找到租客数据:', character);

  // 显示租客关系
  let html = `
        <div style="margin-bottom: 15px; text-align: center;">
            <button id="relation-back-btn"
                    style="padding: 8px 16px; background: var(--theme-modal-btn-bg); border: 1px solid var(--theme-border-color); border-radius: 8px; cursor: pointer; color: var(--theme-text-color);">
                ← 返回列表
            </button>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 18px; font-weight: bold; color: var(--theme-text-color);">
                👥 ${character.displayName} 的关系网络
            </div>
        </div>
    `;

  // 过滤掉$meta字段，获取真实的关系条目
  const relationEntries = Object.entries(character.relations).filter(([k, v]) => {
    return k !== '$meta';
  });

  console.log('🔍 调试信息 - 角色:', character.name);
  console.log('🔍 原始关系对象:', character.relations);
  console.log('🔍 过滤后的关系条目:', relationEntries);

  if (relationEntries.length === 0) {
    html += `
            <div style="text-align: center; padding: 40px; color: var(--theme-subtitle-color);">
                <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;">🤷</div>
                <div style="font-size: 16px;">暂无关系记录</div>
            </div>
        `;
  } else {
    // 简单列表形式显示关系
    html += '<div style="display: flex; flex-direction: column; gap: 12px;">';

    relationEntries.forEach(([targetName, relationDesc]) => {
      // 关系数据格式：[关系描述, 说明文本]，需要取[0]获取实际描述
      const relationText = Array.isArray(relationDesc) ? relationDesc[0] : relationDesc;
      const displayName = targetName === '<user>' ? '您' : targetName;
      const icon = targetName === '<user>' ? '👤' : '👥';

      html += `
                <div style="padding: 15px; background: var(--theme-modal-btn-bg); border-radius: 10px; border: 1px solid var(--theme-border-color); display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 32px; flex-shrink: 0;">${icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: var(--theme-text-color);">
                            ${character.displayName} → ${displayName}
                        </div>
                        <div style="font-size: 14px; color: var(--theme-subtitle-color);">
                            关系：<span style="color: #667eea; font-weight: bold;">${relationText}</span>
                        </div>
                    </div>
                </div>
            `;
    });

    html += '</div>';
  }

  contentDiv.innerHTML = html;

  // 绑定返回按钮事件
  const backBtn = targetDoc.getElementById('relation-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('🔙 返回租客列表');
      openRelationModal();
    });
  }
}

// 绘制关系网络图
function drawRelationGraph(character, relationEntries, targetDoc) {
  const canvas = targetDoc.getElementById('relation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // 设置Canvas实际大小
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // 中心点位置
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = 35;

  // 计算周围节点的位置（圆形分布）
  const nodeRadius = 30;
  const orbitRadius = Math.min(width, height) * 0.32; // 轨道半径
  const angleStep = (Math.PI * 2) / relationEntries.length;

  // 获取主题颜色
  const isDarkTheme = targetDoc.getElementById('apartment-main-panel').classList.contains('dark-theme');
  const textColor = isDarkTheme ? '#e0e0e0' : '#333333';
  const lineColor = isDarkTheme ? '#667eea' : '#667eea';
  const centerColor = isDarkTheme ? '#7c3aed' : '#8b5cf6';
  const nodeColor = isDarkTheme ? '#4ade80' : '#10b981';
  const bgColor = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 绘制背景
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 计算所有节点位置
  const nodes = relationEntries.map(([targetName, relationDesc], index) => {
    const angle = angleStep * index - Math.PI / 2; // 从顶部开始
    // 关系数据格式：[关系描述, 说明文本]，需要取[0]获取实际描述
    const relationText = Array.isArray(relationDesc) ? relationDesc[0] : relationDesc;
    return {
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
      name: targetName,
      displayName: targetName === '<user>' ? '您' : targetName,
      relation: relationText,
    };
  });

  // 1. 绘制连接线
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  nodes.forEach(node => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
  });

  ctx.setLineDash([]);

  // 2. 绘制关系文字（在线的中点）
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  nodes.forEach(node => {
    const midX = (centerX + node.x) / 2;
    const midY = (centerY + node.y) / 2;

    // 计算文字的旋转角度
    const angle = Math.atan2(node.y - centerY, node.x - centerX);
    const distance = Math.sqrt(Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2));

    // 文字背景
    const text = node.relation;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = 16;

    ctx.fillStyle = isDarkTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(midX - textWidth / 2 - 4, midY - textHeight / 2, textWidth + 8, textHeight);

    ctx.fillStyle = lineColor;
    ctx.fillText(text, midX, midY);
  });

  // 3. 绘制周围节点
  nodes.forEach(node => {
    // 节点圆形
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    ctx.strokeStyle = isDarkTheme ? '#333' : '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 节点图标
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(node.name === '<user>' ? '👤' : '👥', node.x, node.y - 2);

    // 节点名称（在圆形下方）
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = textColor;
    ctx.fillText(node.displayName, node.x, node.y + nodeRadius + 15);
  });

  // 4. 绘制中心节点（最后绘制，在最上层）
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.fill();
  ctx.strokeStyle = isDarkTheme ? '#333' : '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 中心节点图标
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(character.name === '<user>' ? '👤' : '👥', centerX, centerY - 3);

  // 中心节点名称（在圆形下方）
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(character.displayName, centerX, centerY + centerRadius + 20);
}

// ==================== 启动脚本 ====================
// 等待 jQuery 加载完成
function waitForJQuery(callback) {
  if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
    console.log('✅ jQuery 已就绪');
    callback();
  } else {
    console.log('⏳ 等待 jQuery...');
    setTimeout(() => waitForJQuery(callback), 100);
  }
}

// DOM 加载完成后初始化
waitForJQuery(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApartmentPlugin);
  } else {
    initializeApartmentPlugin();
  }
});

console.log('✅ 掌上公寓插件脚本加载完成');
