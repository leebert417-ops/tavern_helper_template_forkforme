<template>
  <div class="status-bar apt-card">
    <div class="apt-card-title">
      <span>📊</span>
      <span>游戏状态</span>
    </div>
    <div class="apt-card-body">
      <!-- 时间信息 -->
      <div class="status-section">
        <div class="section-title">⏰ 当前时间</div>
        <div class="time-display">
          <div class="time-large">{{ store.world.时间 }}</div>
          <div class="date-info">
            {{ store.world.年份 }} {{ store.world.日期 }} {{ store.world.星期 }}
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="status-section">
        <div class="section-title">📍 位置信息</div>
        <div class="info-row">
          <span class="label">所在地:</span>
          <span class="value">{{ store.world.地点 }}</span>
        </div>
        <div class="info-row">
          <span class="label">当前房间:</span>
          <span class="value">{{ store.player.currentLocation }}</span>
        </div>
        <div v-if="currentRoomInfo" class="info-row">
          <span class="label">房间类型:</span>
          <span class="value">{{ currentRoomInfo.类型 }}</span>
        </div>
      </div>

      <!-- 租客统计 -->
      <div class="status-section">
        <div class="section-title">👥 租客统计</div>
        <div class="info-row">
          <span class="label">总租客数:</span>
          <span class="value highlight">{{ tenantCount }}</span>
        </div>
        <div v-if="nearbyTenants.length > 0" class="nearby-tenants">
          <div class="subsection-title">附近的租客:</div>
          <div v-for="tenant in nearbyTenants" :key="tenant" class="tenant-tag">
            👤 {{ tenant }}
          </div>
        </div>
        <div v-else class="info-text">
          当前房间没有其他人
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

// 租客总数
const tenantCount = computed(() => {
  return Object.keys(store.tenants).length;
});

// 当前房间信息
const currentRoomInfo = computed(() => {
  const roomId = store.player.currentLocation;
  return store.apartments.房间列表[roomId] || null;
});

// 同一房间的租客
const nearbyTenants = computed(() => {
  const playerLocation = store.player.currentLocation;
  return Object.entries(store.tenants)
    .filter(([_, tenant]) => tenant.当前位置 === playerLocation)
    .map(([name]) => name);
});
</script>

<style lang="scss" scoped>
.status-bar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apt-card-body {
  flex: 1;
  overflow-y: auto;
}

.status-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
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

.subsection-title {
  font-size: 0.85em;
  color: var(--apt-dim);
  margin-bottom: 8px;
  margin-top: 8px;
}

.time-display {
  text-align: center;
  padding: 12px;
  background: rgba(255, 107, 157, 0.1);
  border-radius: 8px;
}

.time-large {
  font-size: 2em;
  font-weight: 700;
  color: var(--apt-primary);
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.date-info {
  font-size: 0.9em;
  color: var(--apt-text);
  opacity: 0.9;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9em;

  .label {
    color: var(--apt-dim);
  }

  .value {
    color: var(--apt-text);
    font-weight: 500;

    &.highlight {
      color: var(--apt-primary);
      font-weight: 700;
      font-size: 1.1em;
    }
  }
}

.info-text {
  font-size: 0.85em;
  color: var(--apt-dim);
  font-style: italic;
  text-align: center;
  padding: 8px;
}

.nearby-tenants {
  margin-top: 8px;
}

.tenant-tag {
  display: inline-block;
  padding: 4px 10px;
  margin: 4px 4px 4px 0;
  background: rgba(255, 107, 157, 0.2);
  border: 1px solid var(--apt-border);
  border-radius: 12px;
  font-size: 0.85em;
  color: var(--apt-text);
}
</style>
