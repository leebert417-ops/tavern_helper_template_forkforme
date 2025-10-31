<template>
  <div class="profile-page apt-card">
    <div class="apt-card-title">
      <span>📋</span>
      <span>租客档案</span>
      <span class="subtitle">{{ Object.keys(store.tenants).length }} 位租客</span>
    </div>
    <div class="apt-card-body custom-scrollbar">
      <div class="tenants-grid">
        <div
          v-for="(tenant, tenantName) in store.tenants"
          :key="tenantName"
          class="tenant-profile-card"
          @click="selectTenant(tenantName as string)"
        >
          <!-- 租客头像 -->
          <div class="tenant-avatar">
            <span class="avatar-icon">👤</span>
          </div>

          <!-- 租客基础信息 -->
          <div class="tenant-basic-info">
            <h3 class="tenant-name">{{ tenantName }}</h3>
            <div class="tenant-meta">
              <span class="meta-item">
                <span class="meta-icon">📍</span>
                <span>{{ getRoomName(tenant.当前位置) }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-icon">💖</span>
                <span>好感度 {{ tenant.好感度 }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 租客详情弹窗 -->
    <div v-if="selectedTenantName" class="detail-overlay" @click.self="closeDetail">
      <div class="detail-panel">
        <div class="detail-header">
          <h2 class="detail-title">
            <span class="detail-icon">👤</span>
            {{ selectedTenantName }}
          </h2>
          <button class="close-btn" @click="closeDetail">✕</button>
        </div>

        <div class="detail-body custom-scrollbar">
          <div v-if="selectedTenantData" class="tenant-details">
            <!-- 基础信息 -->
            <div class="detail-section">
              <h3 class="section-title">📋 基础信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">当前位置：</span>
                  <span class="info-value">{{ getRoomName(selectedTenantData.当前位置) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">好感度：</span>
                  <span class="info-value highlight">{{ selectedTenantData.好感度 }}</span>
                </div>
              </div>
            </div>

            <!-- 记忆 -->
            <div class="detail-section">
              <h3 class="section-title">💭 记忆</h3>
              <div v-if="selectedTenantData.记忆 && selectedTenantData.记忆.length > 0" class="memories-list">
                <div v-for="(memory, index) in selectedTenantData.记忆" :key="index" class="memory-item">
                  <span class="memory-icon">📝</span>
                  <span class="memory-text">{{ memory }}</span>
                </div>
              </div>
              <div v-else class="empty-message">暂无记忆</div>
            </div>

            <!-- 日程 -->
            <div class="detail-section">
              <h3 class="section-title">📅 日程安排</h3>
              <div v-if="selectedTenantData.日程" class="schedule-list">
                <div v-for="(schedule, time) in selectedTenantData.日程" :key="time" class="schedule-item">
                  <span class="schedule-time">{{ time }}</span>
                  <span class="schedule-activity">{{ schedule.活动 }}</span>
                  <span class="schedule-location">@ {{ getRoomName(schedule.位置) }}</span>
                </div>
              </div>
              <div v-else class="empty-message">暂无日程</div>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <button class="apt-btn apt-btn-secondary" @click="closeDetail">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

const selectedTenantName = ref<string | null>(null);

// 选中的租客数据
const selectedTenantData = computed(() => {
  if (!selectedTenantName.value) return null;
  return store.tenants[selectedTenantName.value as keyof typeof store.tenants];
});

// 选择租客
function selectTenant(tenantName: string) {
  selectedTenantName.value = tenantName;
}

// 关闭详情
function closeDetail() {
  selectedTenantName.value = null;
}

// 获取房间名称
function getRoomName(roomId: string): string {
  const room = store.apartments.房间列表[roomId as keyof typeof store.apartments.房间列表];
  if (!room) return roomId;

  // 如果有住户，显示"XX的房间"
  if (room.住户 && room.住户 !== '未知') {
    return `${room.住户}的房间`;
  }

  // 否则显示房间类型
  return room.类型 || roomId;
}
</script>

<style lang="scss" scoped>
.profile-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.subtitle {
  margin-left: auto;
  font-size: 0.75em;
  color: var(--apt-text-secondary);
  opacity: 0.7;
  font-weight: 400;
}

.apt-card-body {
  flex: 1;
  overflow-y: auto;
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 4px;
}

.tenant-profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 107, 157, 0.1);
    border-color: var(--apt-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);
  }
}

.tenant-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--apt-primary), var(--apt-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 2em;
}

.tenant-basic-info {
  flex: 1;
  min-width: 0;
}

.tenant-name {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 700;
  color: var(--apt-text);
}

.tenant-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
  color: var(--apt-text-secondary);
}

.meta-icon {
  font-size: 1.1em;
}

// 详情弹窗样式（复用 RoomDetailModal 的样式）
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-panel {
  background: var(--apt-card);
  border: 2px solid var(--apt-border);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--apt-border);
  background: rgba(255, 107, 157, 0.1);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 1.5em;
  font-weight: 700;
  color: var(--apt-text);
}

.detail-icon {
  font-size: 1.2em;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--apt-border);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--apt-text);
  font-size: 1.5em;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 107, 157, 0.2);
    border-color: var(--apt-primary);
  }
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tenant-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--apt-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85em;
  color: var(--apt-text-secondary);
  opacity: 0.8;
}

.info-value {
  font-size: 1em;
  font-weight: 600;
  color: var(--apt-text);

  &.highlight {
    color: var(--apt-primary);
  }
}

.memories-list,
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.memory-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.memory-icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.memory-text {
  flex: 1;
  line-height: 1.5;
  color: var(--apt-text);
}

.schedule-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.schedule-time {
  font-weight: 700;
  color: var(--apt-primary);
  font-size: 0.9em;
}

.schedule-activity {
  color: var(--apt-text);
  font-weight: 600;
}

.schedule-location {
  font-size: 0.85em;
  color: var(--apt-text-secondary);
  opacity: 0.8;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--apt-text-secondary);
  opacity: 0.6;
  font-style: italic;
}

.detail-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--apt-border);
  background: rgba(0, 0, 0, 0.2);
}
</style>
