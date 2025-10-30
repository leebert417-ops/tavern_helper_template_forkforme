<template>
  <div id="game-container">
    <!-- 游戏主界面 -->
    <div class="game-layout">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <StatusBar />
        <ActionPanel />
      </div>

      <!-- 中间地图区域 -->
      <div class="center-panel">
        <MapView />
      </div>

      <!-- 右侧叙事窗口 -->
      <div class="right-panel">
        <NarrativeWindow />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';
import { useGameStore } from './gameStore';
import { klona } from 'klona';

// 导入组件
import StatusBar from './components/StatusBar.vue';
import ActionPanel from './components/ActionPanel.vue';
import MapView from './components/MapView.vue';
import NarrativeWindow from './components/NarrativeWindow.vue';

const store = useGameStore();

// Phase 2: 实现游戏状态的持久化

// 1. 加载时: 在组件挂载后, 从酒馆变量恢复状态
onMounted(() => {
  // getMessageId() 会获取当前UI所在的消息楼层ID
  const messageId = getMessageId();
  if (!messageId) {
    console.warn('无法获取消息ID, 状态持久化将不会生效.');
    return;
  }

  const savedState = getVariables({ type: 'message', message_id: messageId });
  if (savedState && Object.keys(savedState).length > 0) {
    console.log('发现已保存的状态, 正在恢复...');
    // 使用 $patch 恢复状态, 这样更高效且不会替换掉 actions
    store.$patch(savedState);
  } else {
    console.log('未发现已保存的状态, 使用初始状态.');
  }
});

// 2. 保存时: 监听状态变化并自动写入酒馆变量
watchEffect(() => {
  const messageId = getMessageId();
  if (!messageId) {
    return; // 如果没有 messageId, 则不执行保存
  }

  // klona() 用于去除 Vue 的响应式代理, 得到一个纯净的JS对象, 这对于保存至关重要
  const stateToSave = klona(store.$state);

  // replaceVariables 会将新状态覆盖旧状态
  replaceVariables(stateToSave, { type: 'message', message_id: messageId });
});

</script>

<style lang="scss">
// 导入主题样式 - 使用 @use 代替 @import
@use './styles/theme.scss';

#game-container {
  width: 100%;
  min-height: 600px;
  background: var(--apt-bg);
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
  color: var(--apt-text);
}

.game-layout {
  display: flex;
  width: 100%;
  height: 600px;
  gap: 16px;
  padding: 16px;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  > * {
    flex: 1;
  }
}

.center-panel {
  flex: 1;
  min-width: 0;
}

.right-panel {
  width: 320px;
  flex-shrink: 0;
}

// 响应式布局
@media (max-width: 1200px) {
  .game-layout {
    flex-direction: column;
    height: auto;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
    min-height: 400px;
  }

  .left-panel {
    > * {
      min-height: 300px;
    }
  }
}
</style>
