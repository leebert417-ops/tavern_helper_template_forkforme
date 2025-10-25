// ==================== 江畔夜总会插件 - 快速诊断脚本 ====================
// 使用方法：复制所有代码，粘贴到浏览器控制台（F12）执行

console.log('🔍 开始诊断江畔夜总会插件环境...\n');

// 1. 检查 jQuery
console.log('1️⃣ 检查 jQuery:');
if (typeof jQuery !== 'undefined') {
  console.log('  ✅ jQuery 已加载，版本:', jQuery.fn.jquery);
} else {
  console.log('  ❌ jQuery 未加载');
}

// 2. 检查 MVU
console.log('\n2️⃣ 检查 MVU 框架:');
if (typeof Mvu !== 'undefined') {
  console.log('  ✅ Mvu 已加载');
  console.log('  ✅ Mvu.getMvuData 方法:', typeof Mvu.getMvuData === 'function' ? '存在' : '不存在');
} else {
  console.log('  ❌ Mvu 未在当前窗口加载');
  if (window.parent && typeof window.parent.Mvu !== 'undefined') {
    console.log('  ✅ Mvu 在父窗口中可用');
  } else if (window.top && typeof window.top.Mvu !== 'undefined') {
    console.log('  ✅ Mvu 在顶层窗口中可用');
  } else {
    console.log('  ❌ Mvu 在所有窗口中都不可用');
  }
}

// 3. 检查是否已有插件实例
console.log('\n3️⃣ 检查插件实例:');
const existingPlugin = document.getElementById('nightclub-status-plugin');
if (existingPlugin) {
  console.log('  ⚠️ 插件已存在');
  console.log('  元素:', existingPlugin);
} else {
  console.log('  ❌ 插件不存在');
}

const existingButton = document.getElementById('nightclub-toggle-btn');
if (existingButton) {
  console.log('  ✅ 悬浮按钮已存在');
  console.log('  位置:', existingButton.getBoundingClientRect());
  console.log('  可见性:', window.getComputedStyle(existingButton).display);
} else {
  console.log('  ❌ 悬浮按钮不存在');
}

// 4. 检查样式
console.log('\n4️⃣ 检查样式:');
const existingStyles = document.getElementById('nightclub-plugin-styles');
if (existingStyles) {
  console.log('  ✅ 插件样式已加载');
} else {
  console.log('  ❌ 插件样式未加载');
}

// 5. 检查 DOM 状态
console.log('\n5️⃣ 检查 DOM 状态:');
console.log('  document.readyState:', document.readyState);
console.log('  document.body 存在:', !!document.body);

// 6. 检查酒馆助手
console.log('\n6️⃣ 检查酒馆助手扩展:');
// 尝试查找酒馆助手的特征元素
const tavernHelperElements = document.querySelectorAll(
  '[id*="tavern"], [class*="tavern"], [id*="helper"], [class*="helper"]',
);
if (tavernHelperElements.length > 0) {
  console.log('  ✅ 可能找到酒馆助手相关元素:', tavernHelperElements.length, '个');
} else {
  console.log('  ⚠️ 未找到明显的酒馆助手元素');
}

// 7. 尝试获取所有脚本
console.log('\n7️⃣ 检查已加载的脚本:');
const scripts = Array.from(document.scripts);
const pluginScripts = scripts.filter(
  s => s.textContent.includes('江畔夜总会') || s.textContent.includes('nightclub') || s.textContent.includes('夜总会'),
);
if (pluginScripts.length > 0) {
  console.log('  ✅ 找到插件相关脚本:', pluginScripts.length, '个');
  pluginScripts.forEach((s, i) => {
    console.log(`    脚本 ${i + 1}:`, s.src || '内联脚本');
  });
} else {
  console.log('  ❌ 未找到插件相关脚本');
}

// 8. 输出建议
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 诊断建议:\n');

if (typeof jQuery === 'undefined') {
  console.log('⚠️ jQuery 未加载，插件可能无法正常工作');
}

if (
  typeof Mvu === 'undefined' &&
  (!window.parent || typeof window.parent.Mvu === 'undefined') &&
  (!window.top || typeof window.top.Mvu === 'undefined')
) {
  console.log('⚠️ MVU 框架未加载，数据显示功能将不可用');
}

if (!existingButton) {
  console.log('❌ 悬浮按钮未出现，可能的原因:');
  console.log('   1. 脚本未被酒馆助手正确加载');
  console.log('   2. JSON 配置文件格式错误');
  console.log('   3. 酒馆助手插件未启用');
  console.log('   4. 脚本在酒馆助手中被禁用');
  console.log('\n   🔧 解决方法:');
  console.log('   → 尝试手动加载脚本进行测试');
  console.log('   → 检查酒馆助手的脚本列表');
  console.log('   → 查看浏览器控制台是否有错误信息');
}

console.log('\n💡 如果要手动加载脚本进行测试:');
console.log('   1. 打开 状态栏插件.js 文件');
console.log('   2. 复制所有代码');
console.log('   3. 粘贴到此控制台并执行');
console.log('   4. 如果成功，说明代码本身没问题');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ 诊断完成！');
