<template>
  <div class="ngq-vue-app">
    <!-- 拖动按钮 -->
    <ToggleButton />

    <!-- 主面板 -->
    <MainPanel />

    <!-- 模态框 -->
    <RecruitmentModal />
    <RenovateModal />
    <FunctionalInputModal />
    <RoomModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import ToggleButton from './components/ToggleButton.vue';
import MainPanel from './components/MainPanel.vue';
import RecruitmentModal from './components/modals/RecruitmentModal.vue';
import RenovateModal from './components/modals/RenovateModal.vue';
import FunctionalInputModal from './components/modals/FunctionalInputModal.vue';
import RoomModal from './components/modals/RoomModal.vue';
import { useApartmentStore, useUIStore, useSettingsStore } from './stores';

// Stores
const apartmentStore = useApartmentStore();
const uiStore = useUIStore();
const settingsStore = useSettingsStore();

/**
 * 初始化
 */
onMounted(() => {
  console.log('✅ App 组件已挂载');
  
  // 初始化设置
  settingsStore.initialize();
  
  // 如果面板默认可见，则自动加载数据
  if (uiStore.isPanelVisible) {
    apartmentStore.loadData();
  }

  // 监听面板打开事件，如果还没有数据，则自动加载
  watch(() => uiStore.isPanelVisible, (isVisible) => {
    if (isVisible && !apartmentStore.hasData) {
      apartmentStore.loadData();
    }
  });

  console.log('🏢 网红小区 Vue 版已启动');
});
</script>



