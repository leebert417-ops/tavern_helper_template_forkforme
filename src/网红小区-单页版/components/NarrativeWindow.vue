<template>
  <div class="narrative-window apt-card">
    <div class="apt-card-title">
      <span>📖</span>
      <span>叙事窗口</span>
    </div>
    <div class="apt-card-body custom-scrollbar" ref="narrativeBody">
      <div v-if="narrativeEntries.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无叙事内容</div>
        <div class="empty-hint">与租客互动或推进时间时，叙事内容将显示在这里</div>
      </div>

      <div v-else class="narrative-list">
        <div
          v-for="(entry, index) in narrativeEntries"
          :key="index"
          :class="['narrative-entry', entry.type]"
        >
          <div class="entry-time">{{ entry.time }}</div>
          <div class="entry-content" v-html="entry.content"></div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="narrative-footer">
      <button class="apt-btn apt-btn-small apt-btn-secondary" @click="clearNarrative">
        <span>🗑️ 清空</span>
      </button>
      <button class="apt-btn apt-btn-small apt-btn-secondary" @click="scrollToBottom">
        <span>⬇️ 滚到底部</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

// 叙事内容条目
interface NarrativeEntry {
  time: string;
  content: string;
  type: 'system' | 'action' | 'dialogue' | 'event';
}

// 叙事内容列表
const narrativeEntries = ref<NarrativeEntry[]>([]);

// DOM 引用
const narrativeBody = ref<HTMLElement | null>(null);

// 添加叙事条目
function addNarrativeEntry(content: string, type: NarrativeEntry['type'] = 'system') {
  const entry: NarrativeEntry = {
    time: store.world.时间,
    content,
    type,
  };
  narrativeEntries.value.push(entry);

  // 自动滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
}

// 清空叙事内容
function clearNarrative() {
  narrativeEntries.value = [];
}

// 滚动到底部
function scrollToBottom() {
  if (narrativeBody.value) {
    narrativeBody.value.scrollTop = narrativeBody.value.scrollHeight;
  }
}

// 监听游戏时间变化，添加时间推进提示
let lastTime = store.world.时间;
watch(
  () => store.world.时间,
  (newTime) => {
    if (newTime !== lastTime) {
      addNarrativeEntry(
        `<span class="time-change">⏰ 时间推进到 ${newTime}</span>`,
        'system'
      );
      lastTime = newTime;
    }
  }
);

// 初始欢迎消息
addNarrativeEntry(
  `<strong>欢迎来到网红小区</strong><br>
  这是一个充满活力的社区，住着许多从事内容创作的年轻租客。<br>
  作为房东，你可以与租客互动，管理公寓，体验精彩的故事。`,
  'event'
);

// 暴露方法供其他组件使用
defineExpose({
  addNarrativeEntry,
  clearNarrative,
});
</script>

<style lang="scss" scoped>
.narrative-window {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apt-card-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--apt-dim);
  text-align: center;
  padding: 40px 20px;

  .empty-icon {
    font-size: 3em;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.1em;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 0.85em;
    opacity: 0.7;
    max-width: 300px;
  }
}

.narrative-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.narrative-entry {
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid;
  animation: fadeIn 0.3s ease-in;

  &.system {
    background: rgba(100, 100, 100, 0.2);
    border-left-color: #888;
  }

  &.action {
    background: rgba(52, 211, 153, 0.15);
    border-left-color: #34d399;
  }

  &.dialogue {
    background: rgba(59, 130, 246, 0.15);
    border-left-color: #3b82f6;
  }

  &.event {
    background: rgba(255, 107, 157, 0.15);
    border-left-color: var(--apt-primary);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-time {
  font-size: 0.75em;
  color: var(--apt-dim);
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.entry-content {
  font-size: 0.9em;
  line-height: 1.6;
  color: var(--apt-text);

  :deep(strong) {
    color: var(--apt-primary);
    font-weight: 700;
  }

  :deep(.time-change) {
    color: var(--apt-primary);
    font-weight: 600;
  }
}

.narrative-footer {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--apt-border);
  background: rgba(0, 0, 0, 0.2);

  button {
    flex: 1;
  }
}

.apt-btn-small {
  padding: 8px 12px;
  font-size: 0.85em;
}
</style>
