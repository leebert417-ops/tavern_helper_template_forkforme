// ==================== SillyTavern 环境诊断脚本 ====================
// 复制此脚本到控制台执行，查看可用的 API

console.log('🔍 ========== SillyTavern 环境诊断 ==========');
console.log('');

// 检查全局对象
console.log('📦 全局对象检查:');
console.log('  - window:', typeof window);
console.log('  - jQuery ($):', typeof jQuery, typeof $);
console.log('  - SillyTavern:', typeof SillyTavern);

console.log('');
console.log('🎮 游戏相关 API:');
const apiList = [
  'getChatMessages',
  'getCurrentMessageId',
  'getContext',
  'eventSource',
  'chat',
  'characters',
  'this_chid',
  'chat_metadata',
  'extension_settings',
  'saveSettingsDebounced',
  'getRequestHeaders',
  'substituteParams',
  'chat',
];

apiList.forEach(api => {
  const exists = typeof window[api] !== 'undefined';
  console.log(`  - ${api}: ${exists ? '✅' : '❌'} (${typeof window[api]})`);
});

console.log('');
console.log('📊 尝试获取聊天数据:');

// 尝试不同的方式获取数据
try {
  if (typeof chat !== 'undefined' && Array.isArray(chat)) {
    console.log('✅ 找到 chat 数组:', chat.length, '条消息');
    if (chat.length > 0) {
      const lastMsg = chat[chat.length - 1];
      console.log('📨 最后一条消息:', lastMsg);
      if (lastMsg.extra) {
        console.log('📊 extra 数据:', lastMsg.extra);
      }
    }
  }
} catch (e) {
  console.error('❌ 访问 chat 失败:', e.message);
}

try {
  if (typeof chat_metadata !== 'undefined') {
    console.log('✅ 找到 chat_metadata:', chat_metadata);
  }
} catch (e) {
  console.error('❌ 访问 chat_metadata 失败:', e.message);
}

try {
  if (typeof extension_settings !== 'undefined') {
    console.log('✅ 找到 extension_settings:', extension_settings);
  }
} catch (e) {
  console.error('❌ 访问 extension_settings 失败:', e.message);
}

console.log('');
console.log('🌐 DOM 环境:');
console.log('  - document.body:', !!document.body);
console.log('  - body children:', document.body ? document.body.children.length : 0);

// 查找可能的数据容器
console.log('');
console.log('🔎 查找数据容器:');
const possibleSelectors = ['#chat', '.mes', '[data-stat]', '[data-game-state]', '.stat-display', '#extensions'];

possibleSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`  - ${selector}: ${elements.length} 个元素`);
});

console.log('');
console.log('💡 建议:');
if (typeof getChatMessages === 'undefined') {
  console.log('  ⚠️ getChatMessages 不存在，建议：');
  console.log('     1. 使用纯 HTML 版本的状态栏（状态栏.html）');
  console.log('     2. 将 HTML 嵌入到角色书或世界书中');
  console.log('     3. 使用 SillyTavern 的内置变量显示功能');
}

console.log('');
console.log('✅ 诊断完成！请将以上信息截图反馈。');
