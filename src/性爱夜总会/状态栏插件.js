// ==================== 江畔夜总会管理面板 - SillyTavern 插件版 ====================
// 动态状态栏插件，支持可拖动浮动按钮
// 版本：1.0

console.log('🌙 加载江畔夜总会管理面板插件...');

// ==================== 样式定义 ====================
const styles = `
<style id="nightclub-plugin-styles">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

button:focus,
button:active,
.nightclub-toggle-btn:focus,
.nightclub-toggle-btn:active {
    outline: none !important;
    -webkit-tap-highlight-color: transparent !important;
}

* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}

:root {
    --nightclub-primary: #e94560;
    --nightclub-bg-dark: #1a1a2e;
    --nightclub-bg-mid: #16213e;
    --nightclub-text-light: #eee;
    --nightclub-text-dim: #aaa;
    --nightclub-text-dimmer: #bbb;
}

.nightclub-toggle-btn {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--nightclub-primary) 0%, #ff6b6b 100%);
    border: 3px solid rgba(233, 69, 96, 0.5);
    color: white;
    font-size: 24px;
    cursor: move;
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(233, 69, 96, 0.5);
    transition: transform 0.2s, box-shadow 0.2s;
    touch-action: none;
}

.nightclub-toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(233, 69, 96, 0.7);
}

.nightclub-toggle-btn:active {
    transform: scale(0.95);
}

.nightclub-main-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    display: none;
    justify-content: center;
    align-items: center;
    padding: 20px;
    overflow-y: auto;
}

.nightclub-main-panel.active {
    display: flex;
}

.nightclub-panel-content {
    background: linear-gradient(135deg, var(--nightclub-bg-dark) 0%, var(--nightclub-bg-mid) 100%);
    border: 2px solid var(--nightclub-primary);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(233, 69, 96, 0.4);
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    color: var(--nightclub-text-light);
    font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.nightclub-panel-header {
    position: sticky;
    top: 0;
    background: rgba(233, 69, 96, 0.15);
    border-bottom: 2px solid var(--nightclub-primary);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
}

.nightclub-panel-header h2 {
    font-size: 24px;
    color: var(--nightclub-primary);
    text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.nightclub-close-btn {
    background: transparent;
    border: 2px solid var(--nightclub-primary);
    color: var(--nightclub-primary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nightclub-close-btn:hover {
    background: var(--nightclub-primary);
    color: white;
    transform: rotate(90deg);
}

.nightclub-panel-body {
    padding: 20px;
}

.nightclub-section {
    margin-bottom: 20px;
}

.nightclub-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(233, 69, 96, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
    user-select: none;
}

.nightclub-section-header:hover {
    background: rgba(233, 69, 96, 0.3);
}

.nightclub-section-header.expanded {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.nightclub-section-header span:first-child {
    font-size: 16px;
    font-weight: bold;
    color: var(--nightclub-primary);
}

.nightclub-section-header span:last-child {
    font-size: 14px;
    color: var(--nightclub-primary);
    transition: transform 0.3s;
}

.nightclub-section-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 0 8px 8px;
}

.nightclub-section-content.expanded {
    max-height: 3000px;
    padding: 15px;
}

.nightclub-property {
    margin-bottom: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border-left: 3px solid var(--nightclub-primary);
}

.nightclub-property-name {
    font-size: 13px;
    color: var(--nightclub-text-dim);
    margin-bottom: 5px;
}

.nightclub-property-value {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.nightclub-value-main {
    font-size: 18px;
    font-weight: bold;
    color: white;
}

.nightclub-value-desc {
    font-size: 12px;
    color: var(--nightclub-text-dimmer);
}

.nightclub-highlight {
    color: var(--nightclub-primary);
}

.nightclub-progress-container {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    height: 18px;
    overflow: hidden;
    margin-top: 6px;
}

.nightclub-progress-bar {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease;
}

.nightclub-progress-low {
    background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
}

.nightclub-progress-mid {
    background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%);
}

.nightclub-progress-high {
    background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
}

.nightclub-trainee-card {
    background: rgba(233, 69, 96, 0.1);
    border: 1px solid rgba(233, 69, 96, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
}

.nightclub-trainee-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(233, 69, 96, 0.2);
}

.nightclub-trainee-name {
    font-size: 15px;
    font-weight: bold;
    color: var(--nightclub-primary);
}

.nightclub-trainee-id {
    font-size: 11px;
    color: var(--nightclub-text-dim);
}

.nightclub-trainee-info {
    font-size: 12px;
    color: var(--nightclub-text-dimmer);
    margin: 5px 0;
}

.nightclub-archive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    margin-top: 12px;
}

.nightclub-archive-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 10px;
    border-radius: 6px;
    border: 1px solid rgba(233, 69, 96, 0.2);
}

.nightclub-archive-name {
    font-weight: bold;
    color: var(--nightclub-primary);
    font-size: 13px;
    margin-bottom: 4px;
}

.nightclub-archive-details {
    font-size: 11px;
    color: var(--nightclub-text-dim);
    margin: 2px 0;
}

.nightclub-error {
    color: #ff6b6b;
    padding: 20px;
    text-align: center;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 8px;
    margin: 20px;
}

@media (max-width: 768px) {
    .nightclub-panel-content {
        max-height: 95vh;
        margin: 10px;
    }
    
    .nightclub-toggle-btn {
        bottom: 60px;
        right: 15px;
        width: 50px;
        height: 50px;
        font-size: 20px;
    }
    
    .nightclub-archive-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
}
</style>
`;

// ==================== HTML 结构 ====================
const html = `
<div id="nightclub-status-plugin">
    <button class="nightclub-toggle-btn no-select" id="nightclub-toggle-btn">
        🌙
    </button>
    
    <div class="nightclub-main-panel" id="nightclub-main-panel">
        <div class="nightclub-panel-content">
            <div class="nightclub-panel-header">
                <h2>🌙 江畔夜总会 - 管理面板</h2>
                <button class="nightclub-close-btn" id="nightclub-close-btn">×</button>
            </div>
            
            <div class="nightclub-panel-body" id="nightclub-panel-body">
                <div class="nightclub-section">
                    <div class="nightclub-section-header" data-section="time">
                        <span>⏰ 时空信息</span>
                        <span>▼</span>
                    </div>
                    <div class="nightclub-section-content" data-section="time">
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">📅 当前日期</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-time-date">未设置</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">🕐 当前时间</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-time-clock">--:--</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">📍 当前位置</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-location">未知</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">🎭 营业状态</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-status">未知</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="nightclub-section">
                    <div class="nightclub-section-header" data-section="business">
                        <span>💼 经营概况</span>
                        <span>▼</span>
                    </div>
                    <div class="nightclub-section-content" data-section="business">
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">💰 本月营收 (万元)</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main nightclub-highlight" id="nc-revenue">0</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">👥 在职员工</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-employees">0</span>
                                <span class="nightclub-value-desc">人</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">⭐ VIP客户</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-vip">0</span>
                                <span class="nightclub-value-desc">位</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">📋 待处理订单</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main nightclub-highlight" id="nc-orders">0</span>
                                <span class="nightclub-value-desc">单</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="nightclub-section">
                    <div class="nightclub-section-header" data-section="workshop">
                        <span>🎓 工坊培养状况</span>
                        <span>▼</span>
                    </div>
                    <div class="nightclub-section-content" data-section="workshop">
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">当前培养人数</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main nightclub-highlight" id="nc-workshop-count">0</span>
                                <span class="nightclub-value-desc">人</span>
                            </div>
                        </div>
                        <div id="nc-trainees-container"></div>
                    </div>
                </div>
                
                <div class="nightclub-section">
                    <div class="nightclub-section-header" data-section="archive">
                        <span>📚 已归档艺人</span>
                        <span>▼</span>
                    </div>
                    <div class="nightclub-section-content" data-section="archive">
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">归档总数</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-archive-count">0</span>
                                <span class="nightclub-value-desc">人</span>
                            </div>
                        </div>
                        <div id="nc-archive-container" class="nightclub-archive-grid"></div>
                    </div>
                </div>
                
                <div class="nightclub-section">
                    <div class="nightclub-section-header" data-section="media">
                        <span>🎬 鹿忧传媒联系</span>
                        <span>▼</span>
                    </div>
                    <div class="nightclub-section-content" data-section="media">
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">可调派艺人</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-media-available">0</span>
                                <span class="nightclub-value-desc">人</span>
                            </div>
                        </div>
                        <div class="nightclub-property">
                            <div class="nightclub-property-name">本月已调派</div>
                            <div class="nightclub-property-value">
                                <span class="nightclub-value-main" id="nc-media-dispatched">0</span>
                                <span class="nightclub-value-desc">人</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

// ==================== 工具函数 ====================
function SafeGetValue(obj, path, defaultValue = 'N/A') {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (!current || typeof current !== 'object' || !current.hasOwnProperty(keys[i])) {
      return defaultValue;
    }
    current = current[keys[i]];
  }
  if (current === undefined || current === null) {
    return defaultValue;
  }
  if (Array.isArray(current)) {
    return current.length > 0 ? String(current[0]) : defaultValue;
  }
  return String(current);
}

function getProgressColor(value) {
  if (value < 40) return 'nightclub-progress-low';
  if (value < 70) return 'nightclub-progress-mid';
  return 'nightclub-progress-high';
}

// ==================== 数据加载函数 ====================
async function loadNightclubData() {
  try {
    // 检查 Mvu 是否可用
    if (typeof Mvu === 'undefined') {
      // 尝试从父窗口获取
      if (window.parent && typeof window.parent.Mvu !== 'undefined') {
        window.Mvu = window.parent.Mvu;
        console.log('✅ 已从父窗口引用 MVU');
      } else if (window.top && typeof window.top.Mvu !== 'undefined') {
        window.Mvu = window.top.Mvu;
        console.log('✅ 已从顶层窗口引用 MVU');
      } else {
        console.error('❌ MVU 框架未加载');
        return null;
      }
    }

    // 智能获取应该显示的数据
    let targetMessageId = 'latest';
    if (typeof getLastMessageId === 'function') {
      targetMessageId = getLastMessageId();
      console.log('📍 使用消息 ID:', targetMessageId);
    }

    // 使用 Mvu.getMvuData 获取数据
    const mvuResult = Mvu.getMvuData({
      type: 'message',
      message_id: targetMessageId,
    });
    const characterData = mvuResult?.stat_data;

    if (!characterData) {
      console.error('❌ stat_data 不存在');
      return null;
    }

    console.log('✅ 成功加载夜总会数据', characterData);
    return characterData;
  } catch (error) {
    console.error('❌ 加载数据出错:', error);
    return null;
  }
}

function updateNightclubDisplay(data) {
  if (!data) {
    document.getElementById('nightclub-panel-body').innerHTML = '<div class="nightclub-error">无法加载状态数据</div>';
    return;
  }

  document.getElementById('nc-time-date').textContent = SafeGetValue(data, '时间信息.当前日期', '未设置');
  document.getElementById('nc-time-clock').textContent = SafeGetValue(data, '时间信息.当前时间', '--:--');
  document.getElementById('nc-location').textContent = SafeGetValue(data, '地点信息.当前位置', '未知');
  document.getElementById('nc-status').textContent = SafeGetValue(data, '时间信息.营业状态', '未知');

  document.getElementById('nc-revenue').textContent = SafeGetValue(data, '夜总会经营.本月营收', '0');
  document.getElementById('nc-employees').textContent = SafeGetValue(data, '夜总会经营.在职员工数', '0');
  document.getElementById('nc-vip').textContent = SafeGetValue(data, '夜总会经营.VIP客户数', '0');

  const orders = data['夜总会经营'] && data['夜总会经营']['待处理订单'];
  document.getElementById('nc-orders').textContent = Array.isArray(orders) ? orders.length : '0';

  document.getElementById('nc-workshop-count').textContent = SafeGetValue(data, '工坊培养对象.当前培养人数', '0');
  document.getElementById('nc-archive-count').textContent = SafeGetValue(data, '已归档艺人.总数', '0');
  document.getElementById('nc-media-available').textContent = SafeGetValue(data, '鹿忧传媒联系.可调派艺人数', '0');
  document.getElementById('nc-media-dispatched').textContent = SafeGetValue(data, '鹿忧传媒联系.本月已调派', '0');

  updateTraineesDisplay(data);
  updateArchiveDisplay(data);
}

function updateTraineesDisplay(data) {
  const container = document.getElementById('nc-trainees-container');
  const trainees = data['工坊培养对象'] && data['工坊培养对象']['培养列表'];

  if (!container || !Array.isArray(trainees)) return;

  container.innerHTML = '';

  trainees.forEach(trainee => {
    const name = SafeGetValue(trainee, '姓名', '未知');
    const id = SafeGetValue(trainee, '编号', '');
    const days = SafeGetValue(trainee, '基本信息.培养天数', '0');
    const target = SafeGetValue(trainee, '定制信息.目标形象', '未定');
    const status = SafeGetValue(trainee, '当前状态', '');
    const order = SafeGetValue(trainee, '定制信息.对应订单', '无');

    const etiquette = parseFloat(SafeGetValue(trainee, '培养进度.社交礼仪', '0'));
    const talent = parseFloat(SafeGetValue(trainee, '培养进度.才艺培养', '0'));
    const skill = parseFloat(SafeGetValue(trainee, '培养进度.性爱技巧', '0'));
    const body = parseFloat(SafeGetValue(trainee, '培养进度.形体改造', '0'));
    const overall = parseFloat(SafeGetValue(trainee, '培养进度.综合完成度', '0'));

    const card = document.createElement('div');
    card.className = 'nightclub-trainee-card';
    card.innerHTML = `
            <div class="nightclub-trainee-header">
                <div>
                    <span class="nightclub-trainee-name">${name}</span>
                    <span class="nightclub-trainee-id">（编号: ${id}）</span>
                </div>
                <div class="nightclub-trainee-info">培养 ${days} 天</div>
            </div>
            <div class="nightclub-trainee-info">🎯 目标: ${target}${order !== '无' ? ` | 📝 订单: ${order}` : ''}</div>
            <div class="nightclub-trainee-info">📍 ${status}</div>
            <div style="margin-top: 10px;">
                <div class="nightclub-trainee-info">社交礼仪: ${etiquette}%</div>
                <div class="nightclub-progress-container">
                    <div class="nightclub-progress-bar ${getProgressColor(
                      etiquette,
                    )}" style="width: ${etiquette}%"></div>
                </div>
                <div class="nightclub-trainee-info" style="margin-top: 6px;">才艺培养: ${talent}%</div>
                <div class="nightclub-progress-container">
                    <div class="nightclub-progress-bar ${getProgressColor(talent)}" style="width: ${talent}%"></div>
                </div>
                <div class="nightclub-trainee-info" style="margin-top: 6px;">性爱技巧: ${skill}%</div>
                <div class="nightclub-progress-container">
                    <div class="nightclub-progress-bar ${getProgressColor(skill)}" style="width: ${skill}%"></div>
                </div>
                <div class="nightclub-trainee-info" style="margin-top: 6px;">形体改造: ${body}%</div>
                <div class="nightclub-progress-container">
                    <div class="nightclub-progress-bar ${getProgressColor(body)}" style="width: ${body}%"></div>
                </div>
                <div class="nightclub-trainee-info" style="margin-top: 8px; font-weight: bold;">
                    综合完成度: <span class="nightclub-highlight">${overall}%</span>
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}

function updateArchiveDisplay(data) {
  const container = document.getElementById('nc-archive-container');
  const archives = data['已归档艺人'] && data['已归档艺人']['档案列表'];

  if (!container || !Array.isArray(archives)) return;

  container.innerHTML = '';

  archives.slice(0, 6).forEach(artist => {
    const name = SafeGetValue(artist, '艺名', '未知');
    const type = SafeGetValue(artist, '类型', '');
    const status = SafeGetValue(artist, '当前状态', '');

    const item = document.createElement('div');
    item.className = 'nightclub-archive-item';
    item.innerHTML = `
            <div class="nightclub-archive-name">${name}</div>
            <div class="nightclub-archive-details">${type}</div>
            <div class="nightclub-archive-details">${status}</div>
        `;
    container.appendChild(item);
  });

  if (archives.length > 6) {
    const more = document.createElement('div');
    more.className = 'nightclub-archive-item';
    more.style.color = '#aaa';
    more.innerHTML = `<div>还有 ${archives.length - 6} 人...</div>`;
    container.appendChild(more);
  }
}

// ==================== 拖动功能 ====================
function initDraggable() {
  const btn = document.getElementById('nightclub-toggle-btn');
  if (!btn) return;

  let isDragging = false;
  let startX, startY, startLeft, startTop;
  let hasMoved = false;

  function onStart(e) {
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    isDragging = true;
    hasMoved = false;
    startX = touch.clientX;
    startY = touch.clientY;
    const rect = btn.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDragging) return;
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }

    const newLeft = startLeft + deltaX;
    const newTop = startTop + deltaY;

    const maxX = window.innerWidth - btn.offsetWidth;
    const maxY = window.innerHeight - btn.offsetHeight;

    btn.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
    btn.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';

    e.preventDefault();
  }

  function onEnd(e) {
    if (isDragging && !hasMoved) {
      togglePanel();
    }
    isDragging = false;
    hasMoved = false;
  }

  btn.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);

  btn.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}

// ==================== 面板控制 ====================
function togglePanel() {
  const panel = document.getElementById('nightclub-main-panel');
  if (!panel) return;

  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
  } else {
    panel.classList.add('active');
    loadNightclubData().then(data => {
      if (data) updateNightclubDisplay(data);
    });
  }
}

function closePanel() {
  const panel = document.getElementById('nightclub-main-panel');
  if (panel) {
    panel.classList.remove('active');
  }
}

function toggleSection(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector('span:last-child');
  if (!content || !arrow) return;

  const isExpanded = content.classList.toggle('expanded');
  header.classList.toggle('expanded', isExpanded);
  arrow.textContent = isExpanded ? '▲' : '▼';
}

// ==================== 初始化函数 ====================
function initializeNightclubPlugin() {
  console.log('🏗️ 初始化江畔夜总会插件...');

  if (document.getElementById('nightclub-status-plugin')) {
    console.log('⚠️ 插件已存在，跳过初始化');
    return;
  }

  const styleElement = document.createElement('div');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement.firstElementChild);

  const pluginContainer = document.createElement('div');
  pluginContainer.innerHTML = html;
  document.body.appendChild(pluginContainer.firstElementChild);

  document.getElementById('nightclub-close-btn').addEventListener('click', closePanel);

  document.querySelectorAll('.nightclub-section-header').forEach(header => {
    header.addEventListener('click', () => toggleSection(header));
  });

  const mainPanel = document.getElementById('nightclub-main-panel');
  if (mainPanel) {
    mainPanel.addEventListener('click', e => {
      if (e.target === mainPanel) {
        closePanel();
      }
    });
  }

  initDraggable();

  console.log('✅ 江畔夜总会插件初始化完成');
}

// ==================== jQuery 等待函数 ====================
function waitForJQuery(callback) {
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(() => {
      callback();
    });
  } else {
    setTimeout(() => waitForJQuery(callback), 100);
  }
}

// ==================== 启动插件 ====================
waitForJQuery(() => {
  console.log('🚀 启动江畔夜总会插件');
  initializeNightclubPlugin();
});

console.log('✨ 江畔夜总会插件脚本加载完成');
