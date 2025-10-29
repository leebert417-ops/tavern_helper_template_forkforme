/* 网红小区 - 公寓管理悬浮界面 */

type AnyObject = Record<string, any>;

interface TenantData {
  年龄?: number | string;
  外貌?: string;
  职业?: string;
  性格?: string;
  恋情?: string;
  内心?: string;
  状态?: string;
  穿搭?: string;
  好感度?: number | string;
  性欲?: number | string;
  入住日期?: string;
  入住天数?: number | string;
  月租金?: number | string;
  本月已缴租?: boolean | string;
  当前位置?: string;
  创作内容?: string;
  关系?: Record<string, any>;
}

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

function countTenants(data: AnyObject | undefined): number {
  const tenantMap = data?.租客列表?.[0];
  if (!tenantMap || typeof tenantMap !== 'object') return 0;
  return Object.keys(tenantMap).filter(k => k !== '$meta').length;
}

function countBedrooms(data: AnyObject | undefined): number {
  const rooms = data?.公寓?.房间列表?.[0];
  if (!rooms || typeof rooms !== 'object') return 0;
  let total = 0;
  for (const k in rooms) {
    if (k === '$meta') continue;
    const room = rooms[k];
    const type = safeGetValue(room, '类型', '');
    if (type === '卧室') total += 1;
  }
  return total;
}

async function waitForMvu(): Promise<void> {
  try {
    // @ts-ignore 全局可用
    if (typeof waitGlobalInitialized === 'function') {
      // @ts-ignore 全局可用
      await waitGlobalInitialized('Mvu');
      return;
    }
  } catch {}
  // 兜底轮询
  await new Promise<void>(resolve => {
    const timer = setInterval(() => {
      // @ts-ignore 全局可用
      if (typeof Mvu !== 'undefined') {
        clearInterval(timer);
        resolve();
      }
    }, 300);
  });
}

async function loadMvuData(): Promise<AnyObject | null> {
  try {
    await waitForMvu();
    // @ts-ignore 全局可用
    const res = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    return res?.stat_data ?? null;
  } catch {
    return null;
  }
}

function getTargetDoc(): Document {
  try {
    return window.top ? window.top.document : document;
  } catch {
    return document;
  }
}

function ensureStyles(targetDoc: Document): void {
  const id = 'ngq-floating-styles';
  if (targetDoc.getElementById(id)) return;
  const style = targetDoc.createElement('style');
  style.id = id;
  style.textContent = `
  :root{--apt-primary:#ff6b9d;--apt-secondary:#c44569;--apt-bg:#1a1a2e;--apt-card:#16213e;--apt-border:rgba(255,107,157,.2);--apt-text:#e8eaf6;--apt-dim:#9ca3af}
  .ngq-float-btn{position:fixed;bottom:96px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#ff6b9d 0%,#c44569 100%);
    color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(255,107,157,.4);cursor:pointer;z-index:10002;border:3px solid rgba(255,255,255,.3);
    font-size:26px;pointer-events:auto;transition:transform .2s,box-shadow .2s}
  .ngq-float-btn:hover{transform:scale(1.05)}
  .ngq-float-btn.dragging{cursor:grabbing;opacity:.9;transition:none}
  .ngq-panel{position:fixed;left:50vw;top:50vh;transform:translate(-50%,-50%);width:90vw;max-width:900px;height:85vh;max-height:650px;background:var(--apt-bg);
    color:var(--apt-text);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.4);z-index:10001;overflow:hidden;border:2px solid var(--apt-primary);display:none;flex-direction:column}
  .ngq-panel.open{display:flex}
  .ngq-panel.dragging{transition:none}
  .ngq-panel-header{padding:14px 18px;background:linear-gradient(135deg,#ff6b9d 0%,#c44569 100%);font-weight:700;font-size:15px;display:flex;justify-content:space-between;
    align-items:center;color:#fff;cursor:move;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.2)}
  .ngq-panel-header.dragging{opacity:.8;cursor:grabbing}
  .ngq-close-btn{background:transparent;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1;padding:0;width:28px;height:28px;display:flex;
    align-items:center;justify-content:center;transition:transform .2s}
  .ngq-close-btn:hover{transform:scale(1.1)}
  .ngq-tabs{display:flex;flex-shrink:0;border-bottom:2px solid rgba(255,255,255,.1)}
  .ngq-tab{flex:1;padding:10px 14px;background:transparent;border:none;color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;transition:all .3s;
    border-bottom:2px solid transparent;text-align:center}
  .ngq-tab:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.9)}
  .ngq-tab.active{color:var(--apt-primary);border-bottom-color:var(--apt-primary)}
  .ngq-tab-badge{display:inline-block;margin-left:6px;padding:2px 6px;background:var(--apt-primary);border-radius:10px;font-size:10px;font-weight:700;color:#fff}
  .ngq-content{flex:1;padding:16px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0}
  .ngq-content::-webkit-scrollbar{width:8px;height:8px}
  .ngq-content::-webkit-scrollbar-track{background:rgba(255,255,255,.05);border-radius:4px}
  .ngq-content::-webkit-scrollbar-thumb{background:var(--apt-primary);border-radius:4px}
  .ngq-content::-webkit-scrollbar-thumb:hover{background:var(--apt-secondary)}
  .ngq-card{background:var(--apt-card);border:1px solid var(--apt-border);border-radius:10px;margin-bottom:14px;overflow:hidden}
  .ngq-card-title{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(255,107,157,.15);font-weight:600;font-size:14px}
  .ngq-card-body{padding:14px}
  .ngq-info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .ngq-info-row:last-child{border-bottom:none}
  .ngq-info-label{color:var(--apt-dim);font-size:13px}
  .ngq-info-value{color:var(--apt-text);font-weight:500;text-align:right}
  .ngq-btn{padding:10px 16px;background:var(--apt-primary);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all .3s}
  .ngq-btn:hover{background:var(--apt-secondary);transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,107,157,.3)}
  .ngq-btn:disabled{background:#555;cursor:not-allowed;opacity:.4}
  .ngq-actions{display:flex;gap:10px;margin-top:12px}
  .ngq-floor-level{background:var(--apt-card);border:1px solid var(--apt-border);border-radius:12px;padding:15px;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,0,0,.06)}
  .ngq-floor-level-title{font-size:1.1em;font-weight:600;margin-bottom:12px;color:var(--apt-text);display:flex;align-items:center;gap:8px}
  .ngq-floor-grid{display:flex;gap:12px;width:100%}
  .ngq-room-card{flex:1;border-radius:10px;padding:18px 12px;min-height:90px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;font-weight:600;font-size:.9em;border:2px solid rgba(255,255,255,.3);box-shadow:0 2px 8px rgba(0,0,0,.08);cursor:pointer;transition:all .2s}
  .ngq-room-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(255,107,157,.3)}
  .ngq-room-card.bedroom{background:#592e39}
  .ngq-room-card.functional{background:#2e4057}
  .ngq-room-card.your{background:#2e5266;border-color:#5dade2}
  .ngq-room-card.empty{background:#3d3f47;opacity:.6}
  .ngq-room-name{font-weight:bold;font-size:.95em}
  .ngq-room-occupant{font-size:.75em;color:var(--apt-dim);margin-top:4px}
  .ngq-tenant-card{background:rgba(255,255,255,.05);border:1px solid var(--apt-border);border-radius:8px;padding:12px;margin-bottom:10px;transition:all .3s;cursor:pointer}
  .ngq-tenant-card:hover{border-color:var(--apt-primary);background:rgba(255,107,157,.1);transform:translateX(3px)}
  .ngq-tenant-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .ngq-tenant-name{font-weight:600;font-size:14px;color:var(--apt-primary)}
  .ngq-tenant-badge{font-size:11px;padding:2px 8px;background:rgba(255,255,255,.2);border-radius:4px}
  .ngq-tenant-actions{margin-bottom:16px;text-align:center}
  .ngq-empty{text-align:center;padding:40px 20px;color:var(--apt-dim)}
  .ngq-empty-icon{font-size:48px;margin-bottom:12px;opacity:.5}
  @media(max-width:768px){.ngq-panel{width:95vw;height:90vh}.ngq-float-btn{width:56px;height:56px;font-size:24px}.ngq-tab{font-size:11px;padding:8px 10px}}
  @media(max-width:480px){.ngq-panel{width:100vw;height:100vh;max-width:none;max-height:none;border-radius:0;border:none}.ngq-float-btn{width:52px;height:52px;font-size:22px}}
  `;
  targetDoc.head.appendChild(style);
}

function mountUI(targetDoc: Document): { refresh: () => void } {
  ensureStyles(targetDoc);
  const existing = targetDoc.getElementById('ngq-floating-root');
  if (existing) existing.remove();

  const root = targetDoc.createElement('div');
  root.id = 'ngq-floating-root';
  targetDoc.body.appendChild(root);

  const btn = targetDoc.createElement('button');
  btn.className = 'ngq-float-btn';
  btn.id = 'ngq-float-btn';
  btn.title = '网红小区 - 公寓管理';
  btn.textContent = '🏠';

  const panel = targetDoc.createElement('div');
  panel.className = 'ngq-panel';
  panel.id = 'ngq-panel';
  panel.innerHTML = `
    <div class="ngq-panel-header" id="ngq-drag-handle">
      <div><div style="font-size:16px;font-weight:700">🏠 网红小区</div><div style="font-size:11px;opacity:.9" id="ngq-header-subtitle">东海市·荟萃城</div></div>
      <button class="ngq-close-btn" id="ngq-close">×</button>
    </div>
    <div class="ngq-tabs">
      <button class="ngq-tab active" data-tab="floors">🏢 楼层<span id="ngq-tab-floors-badge" class="ngq-tab-badge">0</span></button>
      <button class="ngq-tab" data-tab="tenants">👥 租客<span id="ngq-tab-tenants-badge" class="ngq-tab-badge">0</span></button>
      <button class="ngq-tab" data-tab="events">📜 事件<span id="ngq-tab-events-badge" class="ngq-tab-badge">0</span></button>
      <button class="ngq-tab" data-tab="actions">⚙️ 操作</button>
    </div>
    <div class="ngq-content" id="ngq-content">
      <div class="ngq-empty"><div class="ngq-empty-icon">⏳</div><div>正在加载数据...</div></div>
    </div>
  `;

  root.appendChild(btn);
  root.appendChild(panel);

  // 拖动数据
  let dragData: { startX: number; startY: number; initialLeft: number; initialTop: number } | null = null;
  let moved = false;

  // 工具：读取/保存位置（使用 localStorage，键含命名空间）
  const STORAGE_KEY = 'ngq-floating-btn-position';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const pos = JSON.parse(saved);
      btn.style.left = typeof pos.left === 'number' ? pos.left + 'px' : btn.style.left;
      btn.style.top = typeof pos.top === 'number' ? pos.top + 'px' : btn.style.top;
      // 将定位从默认 bottom/right 转换为具体 left/top 后，避免双定位冲突
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    }
  } catch {}

  function handleStart(clientX: number, clientY: number): void {
    const rect = btn.getBoundingClientRect();
    // 如果初始是通过 bottom/right 定位，则转化为 left/top
    const computed = targetDoc.defaultView?.getComputedStyle(btn);
    if (computed) {
      if (computed.right !== 'auto' || computed.bottom !== 'auto') {
        btn.style.left = rect.left + 'px';
        btn.style.top = rect.top + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
      }
    }
    dragData = { startX: clientX, startY: clientY, initialLeft: rect.left, initialTop: rect.top };
    moved = false;
    btn.classList.add('dragging');
  }

  function handleMove(clientX: number, clientY: number): void {
    if (!dragData) return;
    const deltaX = clientX - dragData.startX;
    const deltaY = clientY - dragData.startY;
    if (!moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) moved = true;
    const newLeft = dragData.initialLeft + deltaX;
    const newTop = dragData.initialTop + deltaY;
    btn.style.left = newLeft + 'px';
    btn.style.top = newTop + 'px';
  }

  function handleEnd(): void {
    if (!dragData) return;
    btn.classList.remove('dragging');
    // 保存位置
    try {
      const rect = btn.getBoundingClientRect();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
    } catch {}
    dragData = null;
  }

  // 事件绑定（顶层文档）
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  });
  targetDoc.addEventListener('mousemove', e => {
    if (dragData) {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
  });
  targetDoc.addEventListener('mouseup', () => {
    if (dragData) handleEnd();
  });

  btn.addEventListener(
    'touchstart',
    e => {
      const t = e.touches[0];
      if (!t) return;
      handleStart(t.clientX, t.clientY);
    },
    { passive: true },
  );
  targetDoc.addEventListener(
    'touchmove',
    e => {
      const t = e.touches[0];
      if (!t) return;
      if (dragData) handleMove(t.clientX, t.clientY);
    },
    { passive: false },
  );
  targetDoc.addEventListener('touchend', () => {
    if (dragData) handleEnd();
  });

  // 点击（仅在未发生拖动时触发）
  btn.addEventListener('click', e => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    panel.classList.toggle('open');
  });
  (targetDoc.getElementById('ngq-close') as HTMLButtonElement).onclick = e => {
    e.stopPropagation();
    panel.classList.remove('open');
  };

  // 面板拖动（通过标题作为把手）
  (() => {
    const handle = targetDoc.getElementById('ngq-drag-handle');
    if (!handle) return;
    let pDrag: { startX: number; startY: number; left: number; top: number } | null = null;

    function getPanelRect() {
      return panel.getBoundingClientRect();
    }
    function startPanelDrag(x: number, y: number) {
      // 将 transform 定位转为 left/top 以便拖动
      const rect = getPanelRect();
      panel.style.transform = 'none';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      pDrag = { startX: x, startY: y, left: rect.left, top: rect.top };
    }
    function movePanelDrag(x: number, y: number) {
      if (!pDrag) return;
      const nx = pDrag.left + (x - pDrag.startX);
      const ny = pDrag.top + (y - pDrag.startY);
      panel.style.left = nx + 'px';
      panel.style.top = ny + 'px';
    }
    function endPanelDrag() {
      pDrag = null;
    }

    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      startPanelDrag(e.clientX, e.clientY);
    });
    targetDoc.addEventListener('mousemove', e => {
      if (pDrag) {
        e.preventDefault();
        movePanelDrag(e.clientX, e.clientY);
      }
    });
    targetDoc.addEventListener('mouseup', () => {
      if (pDrag) endPanelDrag();
    });
    handle.addEventListener(
      'touchstart',
      e => {
        const t = e.touches[0];
        if (!t) return;
        startPanelDrag(t.clientX, t.clientY);
      },
      { passive: true },
    );
    targetDoc.addEventListener(
      'touchmove',
      e => {
        const t = e.touches[0];
        if (!t) return;
        if (pDrag) movePanelDrag(t.clientX, t.clientY);
      },
      { passive: false },
    );
    targetDoc.addEventListener('touchend', () => {
      if (pDrag) endPanelDrag();
    });
  })();

  let lastData: AnyObject | null = null;
  let currentTab: string = 'floors';

  async function refresh() {
    const data = await loadMvuData();
    lastData = data;
    updateHeaderInfo(data);
    renderCurrentTab();
  }

  function updateHeaderInfo(data: AnyObject | null) {
    const subtitle = targetDoc.getElementById('ngq-header-subtitle');
    if (subtitle && data) {
      const date =
        `${safeGetValue(data, '世界.年份', '')} ${safeGetValue(data, '世界.日期', '')} ${safeGetValue(data, '世界.星期', '')}`.trim();
      const time = safeGetValue(data, '世界.时间', '');
      const location = safeGetValue(data, '世界.地点', '东海市·荟萃城');
      subtitle.textContent = `${location} | ${date} ${time}`;
    }
    // 更新徽标
    const floors = lastData?.公寓?.楼层配置 ? Object.keys(lastData.公寓.楼层配置).filter(k => k !== '$meta').length : 0;
    const tenants = countTenants(lastData || undefined);
    const events = lastData?.事件历史?.[0]
      ? (lastData.事件历史[0] as any[]).filter(v => v !== '$__META_EXTENSIBLE__$').length
      : 0;
    const setBadge = (id: string, val: number) => {
      const el = targetDoc.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setBadge('ngq-tab-floors-badge', floors);
    setBadge('ngq-tab-tenants-badge', tenants);
    setBadge('ngq-tab-events-badge', events);
  }

  function renderCurrentTab() {
    const content = targetDoc.getElementById('ngq-content');
    if (!content) return;
    let html = '';
    if (currentTab === 'floors') html = renderFloors();
    else if (currentTab === 'tenants') html = renderTenants();
    else if (currentTab === 'events') html = renderEvents();
    else if (currentTab === 'actions') html = renderActions();
    content.innerHTML = html;
    initTabEvents();
  }

  // 标签切换
  (() => {
    const tabs = Array.from(targetDoc.querySelectorAll('.ngq-tab')) as HTMLButtonElement[];
    tabs.forEach(tab =>
      tab.addEventListener('click', e => {
        e.stopPropagation();
        const which = tab.getAttribute('data-tab');
        if (!which) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = which;
        renderCurrentTab();
      }),
    );
  })();

  function renderSingleFloor(floor: any, rooms: any): string {
    let html = `<div class="ngq-floor-level">`;
    html += `<div class="ngq-floor-level-title">🏢 ${floor.name}</div>`;
    html += `<div class="ngq-floor-grid">`;

    // 找到该楼层的所有房间，并按房间名排序
    const floorRooms: Array<{ name: string; type: string; tenant: string }> = [];
    const roomKeys = Object.keys(rooms).filter(k => k !== '$meta');

    roomKeys.forEach(roomKey => {
      const r = rooms[roomKey];
      const layout = r?.布局;
      if (!layout || typeof layout !== 'object') return;

      const floorName = typeof layout.楼层 === 'string' ? layout.楼层 : String(layout.楼层 || '');
      if (floorName !== floor.name) return;

      const type = safeGetValue(r, '类型', '空房间');
      const tenant = safeGetValue(r, '住户', '未知');
      floorRooms.push({ name: roomKey, type, tenant });
    });

    // 按房间名排序（如 101, 102）
    floorRooms.sort((a, b) => a.name.localeCompare(b.name));

    if (floorRooms.length === 0) {
      html += `<div style="padding:20px;text-align:center;color:var(--apt-dim)">该楼层暂无房间</div>`;
      html += `</div></div>`;
      return html;
    }

    // 渲染房间卡片（对称布局，每个房间占据相等宽度）
    floorRooms.forEach(room => {
      const cls =
        room.type === '您的房间'
          ? 'your'
          : room.type === '卧室'
            ? 'bedroom'
            : room.type === '功能性房间'
              ? 'functional'
              : 'empty';
      const tenantDisplay = room.tenant === '<user>' ? '房东' : room.tenant === '未知' ? '' : room.tenant;
      const roomIcon =
        room.type === '您的房间' ? '👑' : room.type === '卧室' ? '🛏️' : room.type === '功能性房间' ? '🎨' : '🏚️';

      html += `<div class="ngq-room-card ${cls}" data-room="${room.name}">`;
      html += `<div class="ngq-room-name">${roomIcon} ${room.name}</div>`;
      if (room.type === '卧室' && tenantDisplay) {
        html += `<div class="ngq-room-occupant">入住: ${tenantDisplay}</div>`;
      } else if (room.type === '卧室') {
        html += `<div class="ngq-room-occupant">(空)</div>`;
      } else if (room.type === '您的房间') {
        html += `<div class="ngq-room-occupant">房东自住</div>`;
      }
      html += `</div>`;
    });

    html += `</div></div>`;
    return html;
  }

  function renderFloors(): string {
    if (!lastData) {
      return '<div class="ngq-empty"><div class="ngq-empty-icon">📭</div><div>暂无数据</div></div>';
    }

    const cfg = lastData?.公寓?.楼层配置 || {};
    const rooms = (lastData?.公寓?.房间列表 && lastData.公寓.房间列表[0]) || {};

    // 获取所有楼层（已排序，从上到下）
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
    return html;
  }

  function renderTenants(): string {
    if (!lastData) return '<div class="ngq-empty"><div class="ngq-empty-icon">📭</div><div>暂无数据</div></div>';
    const map = (lastData?.租客列表 && lastData.租客列表[0]) || {};
    const names = Object.keys(map).filter(k => k !== '$meta');

    let html = '';

    // 顶部操作栏：招募租客按钮
    html += `<div class="ngq-tenant-actions">`;
    html += `<button class="ngq-btn" data-action="recruit">👤 招募租客</button>`;
    html += `</div>`;

    if (names.length === 0) {
      html +=
        '<div class="ngq-empty"><div class="ngq-empty-icon">👥</div><div>暂无租客，点击上方按钮招募新租客</div></div>';
      return html;
    }

    // 租客列表
    names.forEach(name => {
      const t: TenantData = map[name];
      const favor = safeGetValue(t, '好感度', '0');
      const lust = safeGetValue(t, '性欲', '0');
      const age = safeGetValue(t, '年龄', '-');
      const job = safeGetValue(t, '职业', '-');
      const place = safeGetValue(t, '当前位置', '-');
      const status = safeGetValue(t, '状态', '-');
      const mood = safeGetValue(t, '内心', '-');
      const appearance = safeGetValue(t, '外貌', '-');
      const personality = safeGetValue(t, '性格', '-');
      const love = safeGetValue(t, '恋情', '单身');
      const rent = safeGetValue(t, '月租金', '-');
      const days = safeGetValue(t, '入住天数', '0');
      const paid = safeGetValue(t, '本月已缴租', 'false') === 'true';

      html += `<div class="ngq-tenant-card"><div class="ngq-tenant-header"><span class="ngq-tenant-name">${name}</span><span class="ngq-tenant-badge">${age}岁 ${job}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">外貌</span><span class="ngq-info-value">${appearance}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">性格</span><span class="ngq-info-value">${personality}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">恋情</span><span class="ngq-info-value">${love}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">当前位置</span><span class="ngq-info-value">${place}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">状态</span><span class="ngq-info-value">${status}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">内心</span><span class="ngq-info-value">${mood}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">好感度</span><span class="ngq-info-value">${favor}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">性欲</span><span class="ngq-info-value">${lust}</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">入住天数</span><span class="ngq-info-value">${days}天</span></div>`;
      html += `<div class="ngq-info-row"><span class="ngq-info-label">租金</span><span class="ngq-info-value">¥${rent} ${paid ? '✅已缴' : '⚠️未缴'}</span></div>`;
      html += `<div class="ngq-actions"><button class="ngq-btn" data-action="favor-add" data-name="${name}">好感+5</button></div>`;
      html += `</div>`;
    });
    return html;
  }

  function renderEvents(): string {
    if (!lastData) return '<div class="ngq-empty"><div class="ngq-empty-icon">📭</div><div>暂无数据</div></div>';
    const arr: any[] = (lastData?.事件历史 && Array.isArray(lastData.事件历史[0]) ? lastData.事件历史[0] : []) as any[];
    const items = arr.filter(v => v !== '$__META_EXTENSIBLE__$');
    if (items.length === 0)
      return '<div class="ngq-empty"><div class="ngq-empty-icon">📜</div><div>暂无事件记录</div></div>';

    let html = `<div class="ngq-card"><div class="ngq-card-title"><span>📜</span><span>事件历史 (${items.length})</span></div><div class="ngq-card-body">`;
    items
      .slice(-30)
      .reverse()
      .forEach(ev => {
        html += `<div class="ngq-info-row" style="display:block;line-height:1.6">📌 ${ev}</div>`;
      });
    html += `</div></div>`;
    return html;
  }

  function renderActions(): string {
    let html = `<div class="ngq-card"><div class="ngq-card-title"><span>⚙️</span><span>公寓操作</span></div><div class="ngq-card-body">`;
    html += `<div class="ngq-actions"><button class="ngq-btn" data-action="refresh">🔄 刷新数据</button><button class="ngq-btn" data-action="auto-refresh" id="auto-refresh-btn">⏱️ 自动刷新: 关</button></div>`;
    html += `</div></div>`;

    // 成就
    const achievements = lastData?.成就列表?.[0] || [];
    const achItems = achievements.filter((v: any) => v !== '$__META_EXTENSIBLE__$');
    html += `<div class="ngq-card"><div class="ngq-card-title"><span>🏆</span><span>成就 (${achItems.length})</span></div><div class="ngq-card-body">`;
    if (achItems.length === 0) {
      html += `<div class="ngq-empty" style="padding:20px"><div class="ngq-empty-icon" style="font-size:32px">🏆</div><div>暂无成就</div></div>`;
    } else {
      achItems.forEach((ach: any) => {
        html += `<div class="ngq-info-row" style="display:block;line-height:1.6">🏆 ${ach}</div>`;
      });
    }
    html += `</div></div>`;
    return html;
  }

  let autoRefreshTimer: number | null = null;
  let isProcessing = false; // 防止重复点击

  function initTabEvents() {
    // 使用事件委托，只绑定一次
    const content = targetDoc.getElementById('ngq-content');
    if (!content) return;

    // 移除旧的事件监听器（如果存在）
    const oldHandler = (content as any).__ngqClickHandler;
    if (oldHandler) {
      content.removeEventListener('click', oldHandler);
    }

    // 创建新的事件处理器
    const clickHandler = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t.matches('button[data-action]')) return;

      // 防止重复点击
      if (isProcessing) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const action = t.getAttribute('data-action');
      const name = t.getAttribute('data-name');

      if (action === 'favor-add' && name) {
        e.preventDefault();
        e.stopPropagation();
        fillCommand(`_.add('租客列表[0].${name}.好感度[0]', 5); // 交互友好，略微提升好感`);
      } else if (action === 'recruit') {
        e.preventDefault();
        e.stopPropagation();
        isProcessing = true;

        // 使用 setTimeout 延迟执行 prompt，避免阻塞
        setTimeout(() => {
          try {
            const keywords = prompt('请输入希望招募的租客特征（例如：温柔、文静、大学生）', '温柔、文静、大学生');
            if (keywords) fillCommand(`招募一名符合以下特征的租客：${keywords}`);
          } finally {
            isProcessing = false;
          }
        }, 100);
      } else if (action === 'refresh') {
        e.preventDefault();
        e.stopPropagation();
        void refresh();
      } else if (action === 'auto-refresh') {
        e.preventDefault();
        e.stopPropagation();
        if (autoRefreshTimer) {
          clearInterval(autoRefreshTimer);
          autoRefreshTimer = null;
          t.textContent = '⏱️ 自动刷新: 关';
        } else {
          autoRefreshTimer = window.setInterval(() => void refresh(), 4000);
          t.textContent = '⏱️ 自动刷新: 开';
        }
      }
    };

    // 保存处理器引用，用于后续移除
    (content as any).__ngqClickHandler = clickHandler;

    // 绑定事件
    content.addEventListener('click', clickHandler);
  }

  function fillCommand(cmd: string) {
    try {
      const input = (parent?.document || targetDoc).querySelector<HTMLTextAreaElement>('#send_textarea');
      if (input) {
        input.value = input.value ? input.value + '\n' + cmd : cmd;
        input.focus();
      } else {
        alert(cmd);
      }
    } catch {
      alert(cmd);
    }
  }

  void refresh();
  return { refresh };
}

function unmountUI(targetDoc: Document): void {
  const root = targetDoc.getElementById('ngq-floating-root');
  if (root) root.remove();
  const style = targetDoc.getElementById('ngq-floating-styles');
  if (style) style.remove();
}

$(() => {
  const targetDoc = getTargetDoc();
  mountUI(targetDoc);
});

(() => {
  const targetDoc = getTargetDoc();
  $(targetDoc).on('pagehide.ngq-floating', () => {
    unmountUI(targetDoc);
  });
})();
