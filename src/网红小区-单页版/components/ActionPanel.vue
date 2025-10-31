<template>
  <div class="action-panel apt-card">
    <div class="apt-card-title">
      <span>🎮</span>
      <span>行动面板</span>
      <span v-if="store.isLoading" class="loading-indicator"> (处理中...) </span>
    </div>
    <div class="apt-card-body custom-scrollbar">
      <div class="action-section">
        <div class="section-title">⏳ 时间控制</div>
        <div class="button-grid">
          <button class="apt-btn" @click="advanceTime(1)" :disabled="store.isLoading">
            <span class="btn-icon">⏩</span>
            <span>推进 1 小时</span>
          </button>
          <button class="apt-btn" @click="advanceTime(2)" :disabled="store.isLoading">
            <span class="btn-icon">⏩⏩</span>
            <span>推进 2 小时</span>
          </button>
          <button class="apt-btn" @click="advanceTime(6)" :disabled="store.isLoading">
            <span class="btn-icon">⏰</span>
            <span>推进 6 小时</span>
          </button>
          <button class="apt-btn apt-btn-secondary" @click="advanceTime(12)" :disabled="store.isLoading">
            <span class="btn-icon">🌙</span>
            <span>推进 12 小时</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../gameStore';

const store = useGameStore();

// 推进时间
function advanceTime(hours: number) {
  store.advanceTime(hours);
}
</script>

<style lang="scss" scoped>
.action-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apt-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-indicator {
  font-size: 0.8em;
  color: var(--apt-primary);
  font-weight: 600;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.apt-card-body {
  flex: 1;
  overflow-y: auto;
}

.action-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--apt-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.button-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.apt-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  font-size: 0.85em;

  .btn-icon {
    font-size: 1.3em;
  }

  // 統一的禁用樣式
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--apt-hover);
    transform: none;
  }
}
</style>
