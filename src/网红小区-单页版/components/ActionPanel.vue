<template>
  <div class="action-panel apt-card">
    <div class="apt-card-title">
      <span>🎮</span>
      <span>行动面板</span>
    </div>
    <div class="apt-card-body">
      <!-- 时间控制区 -->
      <div class="action-section">
        <div class="section-title">⏳ 时间控制</div>
        <div class="button-grid">
          <button class="apt-btn" @click="advanceTime(1)">
            <span class="btn-icon">⏩</span>
            <span>推进 1 小时</span>
          </button>
          <button class="apt-btn" @click="advanceTime(2)">
            <span class="btn-icon">⏩⏩</span>
            <span>推进 2 小时</span>
          </button>
          <button class="apt-btn" @click="advanceTime(6)">
            <span class="btn-icon">⏰</span>
            <span>推进 6 小时</span>
          </button>
          <button class="apt-btn apt-btn-secondary" @click="advanceTime(12)">
            <span class="btn-icon">🌙</span>
            <span>推进 12 小时</span>
          </button>
        </div>
      </div>

      <!-- 移动控制区 -->
      <div class="action-section">
        <div class="section-title">🚶 房间移动</div>
        <div class="room-select-grid">
          <button
            v-for="(room, roomId) in availableRooms"
            :key="roomId"
            :class="['room-btn', { 'active': roomId === store.player.currentLocation }]"
            @click="moveToRoom(roomId)"
            :disabled="roomId === store.player.currentLocation"
          >
            <span class="room-icon">{{ getRoomIcon(room.类型) }}</span>
            <span class="room-label">{{ roomId }}</span>
            <span class="room-type-label">{{ room.类型 }}</span>
          </button>
        </div>
      </div>

      <!-- 互动区 -->
      <div v-if="nearbyTenants.length > 0" class="action-section">
        <div class="section-title">💬 互动</div>
        <div class="tenant-interaction">
          <div v-for="tenant in nearbyTenants" :key="tenant" class="tenant-interact-card">
            <div class="tenant-interact-info">
              <span class="tenant-icon">👤</span>
              <span class="tenant-name">{{ tenant }}</span>
            </div>
            <button class="apt-btn apt-btn-small" @click="interactWithTenant(tenant)">
              互动
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

// 可用房间列表（排除空房间）
const availableRooms = computed(() => {
  const rooms: Record<string, any> = {};
  for (const [roomId, room] of Object.entries(store.apartments.房间列表)) {
    if (room.类型 !== '空房间') {
      rooms[roomId] = room;
    }
  }
  return rooms;
});

// 同一房间的租客
const nearbyTenants = computed(() => {
  const playerLocation = store.player.currentLocation;
  return Object.entries(store.tenants)
    .filter(([_, tenant]) => tenant.当前位置 === playerLocation)
    .map(([name]) => name);
});

// 推进时间
function advanceTime(hours: number) {
  store.advanceTime(hours);
}

// 移动到指定房间
function moveToRoom(roomId: string) {
  store.player.currentLocation = roomId;
  console.log(`移动到房间: ${roomId}`);
}

// 与租客互动
function interactWithTenant(tenantName: string) {
  store.interactWithTenant(tenantName);
}

// 获取房间图标
function getRoomIcon(type: string): string {
  const iconMap: Record<string, string> = {
    '套间': '🛏️',
    '您的房间': '🏠',
    '公共客厅': '🛋️',
    '健身房': '💪',
    '洗衣间': '🧺',
    '空房间': '📦',
  };
  return iconMap[type] || '🚪';
}
</script>

<style lang="scss" scoped>
.action-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
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
}

.apt-btn-small {
  padding: 6px 12px;
  font-size: 0.8em;
}

.room-select-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.room-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--apt-text);
  font-size: 0.8em;

  &:hover:not(:disabled) {
    background: rgba(255, 107, 157, 0.15);
    border-color: var(--apt-primary);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(255, 107, 157, 0.2);
    border-color: var(--apt-primary);
    box-shadow: 0 0 8px rgba(255, 107, 157, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .room-icon {
    font-size: 1.5em;
  }

  .room-label {
    font-weight: 600;
    font-size: 0.95em;
  }

  .room-type-label {
    font-size: 0.75em;
    opacity: 0.8;
  }
}

.tenant-interaction {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tenant-interact-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 107, 157, 0.1);
    border-color: var(--apt-primary);
  }
}

.tenant-interact-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .tenant-icon {
    font-size: 1.3em;
  }

  .tenant-name {
    font-weight: 600;
    color: var(--apt-text);
  }
}
</style>
