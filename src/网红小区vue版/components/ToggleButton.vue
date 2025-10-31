<template>
  <div
    ref="buttonRef"
    class="ngq-toggle-btn"
    :class="{ dragging: isDragging }"
    :style="buttonStyle"
    :title="tooltipText"
  >
    🏢
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUIStore } from '../stores/ui';
import { useDrag } from '../composables/useDrag';
import { usePosition } from '../composables/usePosition';

// Stores
const uiStore = useUIStore();

// 元素引用
const buttonRef = ref<HTMLElement | null>(null);

// 位置管理
const { position, savePosition, restorePosition } = usePosition({
  key: 'button',
  defaultPosition: { left: 20, top: 100 },
  autoSave: false, // 手动保存，在拖动结束时
});

// 拖动功能
const { isDragging } = useDrag({
  elementRef: buttonRef,
  enabled: true,
  constrainToViewport: true,
  boundaryOffset: 10,
  clickThreshold: 5,
  onDragStart: (pos) => {
    console.log('🖱️ 开始拖动按钮', pos);
  },
  onDragMove: (pos) => {
    // 实时更新位置（但不保存）
    position.value = pos;
  },
  onDragEnd: (pos, isClick) => {
    console.log('✅ 拖动结束', { position: pos, isClick });
    
    // 保存位置
    savePosition(pos);
    
    // 如果是点击，切换面板
    if (isClick) {
      handleClick();
    }
  },
});

/**
 * 按钮样式
 */
const buttonStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

/**
 * 提示文本
 */
const tooltipText = computed(() => {
  return uiStore.isPanelVisible ? '点击关闭面板' : '点击打开面板';
});

/**
 * 处理点击
 */
const handleClick = () => {
  console.log('🎨 检测到点击，切换面板');
  uiStore.togglePanel();
  
  // 如果打开面板，可以触发数据加载
  // 这里暂时不加载，等主面板组件创建后再处理
};

/**
 * 初始化
 */
onMounted(() => {
  // 恢复保存的位置
  const savedPos = restorePosition();
  console.log('✅ ToggleButton 已挂载，位置:', savedPos);
});
</script>

<style scoped>
.ngq-toggle-btn {
  position: fixed !important;
  width: 64px;
  height: 64px;
  background: var(--apt-gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: var(--apt-z-button) !important;
  box-shadow: var(--apt-shadow-md);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-size: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: transform var(--apt-transition-normal), 
              box-shadow var(--apt-transition-normal), 
              opacity var(--apt-transition-normal);
}

.ngq-toggle-btn:hover {
  transform: scale(1.05);
}

.ngq-toggle-btn.dragging {
  cursor: grabbing !important;
  opacity: 0.9;
  z-index: var(--apt-z-button-dragging) !important;
  transition: none !important;
}
</style>

