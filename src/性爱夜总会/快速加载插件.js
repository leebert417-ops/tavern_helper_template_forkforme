// ==================== 江畔夜总会插件 - 快速加载脚本 ====================
// 使用方法：复制本文件所有内容，粘贴到浏览器控制台执行

(function () {
  console.log('🚀 开始加载江畔夜总会插件...');

  // 检查是否已经加载
  if (document.getElementById('nightclub-status-plugin')) {
    console.log('⚠️ 插件已存在，清除旧版本...');
    const oldPlugin = document.getElementById('nightclub-status-plugin');
    const oldStyles = document.getElementById('nightclub-plugin-styles');
    if (oldPlugin) oldPlugin.remove();
    if (oldStyles) oldStyles.remove();
  }

  // 检查依赖
  console.log('📋 检查环境依赖...');
  console.log('  - jQuery:', typeof jQuery !== 'undefined' ? '✅' : '❌');
  console.log('  - Mvu:', typeof Mvu !== 'undefined' ? '✅' : '❌');
  console.log('  - getLastMessageId:', typeof getLastMessageId !== 'undefined' ? '✅' : '❌');

  // 检查 Mvu
  if (typeof Mvu === 'undefined') {
    // 尝试从父窗口获取
    if (window.parent && typeof window.parent.Mvu !== 'undefined') {
      window.Mvu = window.parent.Mvu;
      console.log('✅ 已从父窗口引用 MVU');
    } else if (window.top && typeof window.top.Mvu !== 'undefined') {
      window.Mvu = window.top.Mvu;
      console.log('✅ 已从顶层窗口引用 MVU');
    } else {
      console.error('❌ 缺少 MVU 框架，请确认是否在 SillyTavern 环境中运行，且已加载 MVU 插件');
      return;
    }
  }

  // 注入样式
  const styles = `
<style id="nightclub-plugin-styles">
:root {
  --nightclub-primary: #e94560;
  --nightclub-bg-dark: #1a1a2e;
  --nightclub-bg-mid: #16213e;
  --nightclub-text-light: #eee;
  --nightclub-text-dim: #aaa;
}

.nightclub-toggle-btn {
  position: fixed !important;
  bottom: 80px !important;
  right: 20px !important;
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, var(--nightclub-primary) 0%, #ff6b6b 100%) !important;
  border: 3px solid rgba(233, 69, 96, 0.5) !important;
  color: white !important;
  font-size: 24px !important;
  cursor: move !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.5) !important;
  transition: transform 0.2s !important;
  touch-action: none !important;
}

.nightclub-toggle-btn:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 30px rgba(233, 69, 96, 0.7) !important;
}

.nightclub-main-panel {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.85) !important;
  z-index: 99998 !important;
  display: none !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 20px !important;
}

.nightclub-main-panel.active {
  display: flex !important;
}

.nightclub-panel-content {
  background: linear-gradient(135deg, var(--nightclub-bg-dark) 0%, var(--nightclub-bg-mid) 100%);
  border: 2px solid var(--nightclub-primary);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--nightclub-text-light);
}

.nightclub-panel-header {
  padding: 20px;
  border-bottom: 2px solid var(--nightclub-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.nightclub-close-btn:hover {
  background: var(--nightclub-primary);
  color: white;
  transform: rotate(90deg);
}

.nightclub-test-info {
  padding: 20px;
  text-align: center;
  color: white;
}
</style>
`;

  // 创建简化版 HTML
  const html = `
<div id="nightclub-status-plugin">
  <button class="nightclub-toggle-btn" id="nightclub-toggle-btn" title="点击打开江畔夜总会管理面板">
    🌙
  </button>
  
  <div class="nightclub-main-panel" id="nightclub-main-panel">
    <div class="nightclub-panel-content">
      <div class="nightclub-panel-header">
        <h2 style="color: var(--nightclub-primary);">🌙 江畔夜总会 - 管理面板</h2>
        <button class="nightclub-close-btn" id="nightclub-close-btn">×</button>
      </div>
      <div class="nightclub-test-info" id="nightclub-panel-body">
        <p>✅ 插件加载成功！</p>
        <p>正在获取数据...</p>
      </div>
    </div>
  </div>
</div>
`;

  // 注入样式
  const styleElement = document.createElement('div');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement.firstElementChild);
  console.log('✅ 样式已注入');

  // 注入 HTML
  const pluginContainer = document.createElement('div');
  pluginContainer.innerHTML = html;
  document.body.appendChild(pluginContainer.firstElementChild);
  console.log('✅ HTML 已注入');

  // 绑定事件
  const toggleBtn = document.getElementById('nightclub-toggle-btn');
  const closeBtn = document.getElementById('nightclub-close-btn');
  const mainPanel = document.getElementById('nightclub-main-panel');
  const panelBody = document.getElementById('nightclub-panel-body');

  if (!toggleBtn || !closeBtn || !mainPanel) {
    console.error('❌ 找不到必要的 DOM 元素');
    return;
  }

  // 切换面板显示
  function togglePanel() {
    console.log('🔄 切换面板显示');
    mainPanel.classList.toggle('active');

    if (mainPanel.classList.contains('active')) {
      loadData();
    }
  }

  // 关闭面板
  function closePanel() {
    console.log('❌ 关闭面板');
    mainPanel.classList.remove('active');
  }

  // 加载数据
  async function loadData() {
    try {
      panelBody.innerHTML = '<p>⏳ 正在加载数据...</p>';

      // 获取消息 ID
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

      console.log('📨 MVU 返回结果:', mvuResult);

      const characterData = mvuResult?.stat_data;

      if (!characterData) {
        panelBody.innerHTML = '<p style="color: #ff6b6b;">❌ stat_data 不存在</p><p>请确保 MVU 变量系统已初始化</p>';
        console.log('💡 提示：确保已在世界书中添加 [InitVar] 条目');
        return;
      }

      console.log('📊 成功获取数据:', characterData);

      // 显示数据
      const timeInfo = characterData['时间信息'] || {};
      const locationInfo = characterData['地点信息'] || {};
      const businessInfo = characterData['夜总会经营'] || {};

      panelBody.innerHTML = `
        <div style="text-align: left; padding: 20px; color: white;">
          <h3 style="color: var(--nightclub-primary); margin-bottom: 15px;">📊 数据预览</h3>
          
          <p><strong>📅 日期:</strong> ${timeInfo['当前日期'] || '未设置'} ${timeInfo['星期'] || ''}</p>
          <p><strong>🕐 时间:</strong> ${timeInfo['当前时间'] || '未设置'}</p>
          <p><strong>📍 位置:</strong> ${locationInfo['当前位置'] || '未知'}</p>
          <p><strong>🎭 营业状态:</strong> ${timeInfo['营业状态'] || '未知'}</p>
          
          <hr style="margin: 15px 0; border-color: var(--nightclub-primary);">
          
          <p><strong>💰 本月营收:</strong> ${businessInfo['本月营收'] || 0} 万元</p>
          <p><strong>👥 在职员工:</strong> ${businessInfo['在职员工数'] || 0} 人</p>
          <p><strong>⭐ VIP客户:</strong> ${businessInfo['VIP客户数'] || 0} 位</p>
          
          <hr style="margin: 15px 0; border-color: var(--nightclub-primary);">
          
          <p style="color: #2ecc71; margin-top: 20px;">✅ 数据加载成功！</p>
          <p style="font-size: 12px; color: #aaa; margin-top: 10px;">
            提示：如需完整功能，请加载完整版插件
          </p>
        </div>
      `;
    } catch (error) {
      console.error('❌ 加载数据出错:', error);
      panelBody.innerHTML = `<p style="color: #ff6b6b;">❌ 加载出错: ${error.message}</p>`;
    }
  }

  // 绑定点击事件
  toggleBtn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', closePanel);
  mainPanel.addEventListener('click', e => {
    if (e.target === mainPanel) closePanel();
  });

  console.log('✅ 事件已绑定');
  console.log('');
  console.log('🎉 江畔夜总会插件加载完成！');
  console.log('💡 提示：在页面右下角应该能看到一个 🌙 按钮');
  console.log('🖱️ 点击按钮打开管理面板');
  console.log('');

  // 验证按钮是否可见
  setTimeout(() => {
    const btn = document.getElementById('nightclub-toggle-btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      console.log('📍 按钮位置:', {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      });

      if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ 按钮可能不可见，尝试调整样式...');
        btn.style.cssText = `
          position: fixed !important;
          bottom: 80px !important;
          right: 20px !important;
          width: 60px !important;
          height: 60px !important;
          z-index: 999999 !important;
          display: flex !important;
        `;
      }
    }
  }, 500);
})();
