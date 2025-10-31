<template>
  <div class="ngq-vue-app">
    <!-- 拖动按钮 -->
    <ToggleButton />

    <!-- 测试信息面板（开发时显示） -->
    <div v-if="showDebugPanel" class="ngq-debug-panel">
      <h3>🧪 测试面板</h3>
      <div class="debug-section">
        <h4>Stores 状态</h4>
        <p>公寓数据加载: {{ apartmentStore.loading ? '加载中...' : '完成' }}</p>
        <p>是否有数据: {{ apartmentStore.hasData ? '是' : '否' }}</p>
        <p>楼层数量: {{ apartmentStore.floorCount }}</p>
        <p>房间总数: {{ apartmentStore.roomCount }}</p>
        <p>面板可见: {{ uiStore.isPanelVisible ? '是' : '否' }}</p>
        <p>自动刷新: {{ settingsStore.autoRefreshEnabled ? '启用' : '禁用' }}</p>
      </div>
      <div class="debug-section">
        <h4>操作</h4>
        <button @click="testLoadData" class="ngq-btn ngq-btn-small">加载数据</button>
        <button @click="testTogglePanel" class="ngq-btn ngq-btn-small">切换面板</button>
        <button @click="testToggleAutoRefresh" class="ngq-btn ngq-btn-small">切换自动刷新</button>
        <button @click="showDebugPanel = false" class="ngq-btn ngq-btn-small ngq-btn-secondary">关闭</button>
      </div>
    </div>

    <!-- 显示调试面板按钮 -->
    <button 
      v-if="!showDebugPanel" 
      @click="showDebugPanel = true" 
      class="ngq-debug-toggle"
      title="显示测试面板"
    >
      🧪
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ToggleButton from './components/ToggleButton.vue';
import { useApartmentStore, useUIStore, useSettingsStore } from './stores';

// Stores
const apartmentStore = useApartmentStore();
const uiStore = useUIStore();
const settingsStore = useSettingsStore();

// 调试面板显示状态
const showDebugPanel = ref(false);

/**
 * 测试加载数据
 */
const testLoadData = async () => {
  console.log('🧪 测试：加载数据');
  const success = await apartmentStore.loadData();
  if (success) {
    toastr?.success('数据加载成功');
  } else {
    toastr?.error('数据加载失败');
  }
};

/**
 * 测试切换面板
 */
const testTogglePanel = () => {
  console.log('🧪 测试：切换面板');
  uiStore.togglePanel();
};

/**
 * 测试切换自动刷新
 */
const testToggleAutoRefresh = () => {
  console.log('🧪 测试：切换自动刷新');
  settingsStore.toggleAutoRefresh();
};

/**
 * 初始化
 */
onMounted(() => {
  console.log('✅ App 组件已挂载');
  
  // 初始化设置
  settingsStore.initialize();
  
  // 显示欢迎信息
  console.log('🏢 网红小区 Vue 版已启动');
  console.log('💡 提示：点击右下角的 🧪 图标可以打开测试面板');
});
</script>

<style scoped>
.ngq-vue-app {
  position: relative;
}

/* 调试面板 */
.ngq-debug-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90vw;
  background: var(--apt-bg);
  border: 2px solid var(--apt-primary);
  border-radius: var(--apt-radius-lg);
  padding: 20px;
  z-index: 10003;
  color: var(--apt-text);
  box-shadow: var(--apt-shadow-lg);
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.ngq-debug-panel h3 {
  margin: 0 0 16px 0;
  color: var(--apt-primary);
  font-size: 18px;
}

.ngq-debug-panel h4 {
  margin: 12px 0 8px 0;
  color: var(--apt-text);
  font-size: 14px;
  font-weight: 600;
}

.debug-section {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--apt-radius-sm);
}

.debug-section p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--apt-dim);
}

.debug-section button {
  margin: 4px 4px 4px 0;
}

/* 调试面板切换按钮 */
.ngq-debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: var(--apt-gradient-primary);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10000;
  box-shadow: var(--apt-shadow-md);
  transition: all var(--apt-transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ngq-debug-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--apt-shadow-lg);
}
</style>

