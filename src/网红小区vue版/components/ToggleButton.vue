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
  position: position, // 将响应式 position 传递进去
  enabled: true,
  constrainToViewport: true,
  boundaryOffset: 10,
  clickThreshold: 5,
  onDragStart: (pos) => {
    console.log('🖱️ 开始拖动按钮', pos);
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



