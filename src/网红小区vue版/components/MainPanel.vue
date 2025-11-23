<template>
  <div v-if="uiStore.isPanelVisible" ref="panelRef" class="ngq-main-panel" :class="{ dragging: isDragging }" :style="panelStyle">
    <!-- 头部 -->
    <div ref="headerRef" class="ngq-header">
      <div class="ngq-header-left">
        <div class="ngq-header-title">🏠 网红小区</div>
        <div class="ngq-header-subtitle">{{ headerSubtitle }}</div>
      </div>
      <button class="ngq-close-btn" title="关闭" @click="closePanel">×</button>
    </div>

    <!-- 标签页 -->
    <div class="ngq-tabs">
      <button class="ngq-tab active">总览</button>
      <button class="ngq-tab">租客</button>
      <button class="ngq-tab">财务</button>
      <button class="ngq-tab">设置</button>
    </div>

    <!-- 内容区域 -->
    <div class="ngq-content custom-scrollbar">
      <div v-if="apartmentStore.loading" class="ngq-loading">
        <div class="ngq-loading-icon">⏳</div>
        <div class="ngq-loading-text">正在加载数据...</div>
      </div>
      <div v-else-if="!apartmentStore.hasData" class="ngq-empty">
        <div class="ngq-empty-icon">📭</div>
        <div class="ngq-empty-text">未能加载数据，请在游戏中生成一些内容后重试</div>
      </div>
      <div v-else>
        <div style="display:flex;flex-direction:column;gap:12px">
          <FloorView v-for="floor in apartmentStore.floors" :key="floor.key" :floor="floor" />
        </div>
        <ManagementActions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUIStore, useApartmentStore } from '../stores';
import { useDrag } from '../composables/useDrag';
import { usePosition } from '../composables/usePosition';

import ManagementActions from './ManagementActions.vue';
import FloorView from './FloorView.vue';

// Stores
const uiStore = useUIStore();
const apartmentStore = useApartmentStore();

// 元素引用
const panelRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);

// 位置管理
const { position, savePosition, restorePosition } = usePosition({
  key: 'panel',
  defaultPosition: { left: window.innerWidth / 2 - 450, top: window.innerHeight / 2 - 325 },
});

// 拖动功能
const { isDragging } = useDrag({
  elementRef: panelRef, // 移动整个面板
  handleRef: headerRef, // 但只在头部触发拖动
  position: position, // 将响应式 position 传递进去
  enabled: true,
  onDragEnd: (pos) => {
    savePosition(pos);
  },
});

/**
 * 面板样式
 */
const panelStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

/**
 * 头部副标题
 */
const headerSubtitle = computed(() => {
  if (!apartmentStore.hasData) return '东海市·荟萃城';
  const { date, time, location } = apartmentStore.worldInfo;
  return `${location} | ${date} ${time}`;
});

/**
 * 关闭面板
 */
const closePanel = () => {
  uiStore.closePanel();
};

/**
 * 初始化
 */
onMounted(() => {
  restorePosition();
});

</script>
