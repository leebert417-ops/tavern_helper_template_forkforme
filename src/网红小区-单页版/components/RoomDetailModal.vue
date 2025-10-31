<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" :class="getRoomClass()">
      <!-- 弹窗标题 -->
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="room-icon">🏠</span>
          {{ roomInfo?.displayName || '房间详情' }}
        </h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <!-- 弹窗主体 -->
      <div class="modal-body custom-scrollbar">
        <div v-if="roomInfo" class="room-details">
          <!-- 基础信息 -->
          <div class="detail-section">
            <h3 class="section-title">📋 基础信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">房间号：</span>
                <span class="info-value">{{ getRoomIdDisplay() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">类型：</span>
                <span class="info-value">{{ roomInfo.类型 }}</span>
              </div>
              <div v-if="roomInfo.住户" class="info-item">
                <span class="info-label">住户：</span>
                <span class="info-value highlight">{{ roomInfo.住户 }}</span>
              </div>
              <div v-if="roomInfo.功能区" class="info-item full-width">
                <span class="info-label">功能区：</span>
                <span class="info-value">{{ roomInfo.功能区 }}</span>
              </div>
            </div>
          </div>

          <!-- 当前在此房间的人 -->
          <div class="detail-section">
            <h3 class="section-title">👥 当前在此</h3>
            <div v-if="occupants.length > 0" class="occupants-grid">
              <div
                v-for="person in occupants"
                :key="person.name"
                :class="['occupant-card', { clickable: person.isTenant && isCurrentLocation }]"
                @click="person.isTenant && isCurrentLocation ? openInteractionPanel(person.name) : null"
              >
                <span class="occupant-icon">{{ person.icon }}</span>
                <span class="occupant-name">{{ person.name }}</span>
              </div>
            </div>
            <div v-else class="empty-message">当前房间无人</div>
          </div>

          <!-- 房间描述（如果有） -->
          <div v-if="getRoomDescription()" class="detail-section">
            <h3 class="section-title">📝 房间描述</h3>
            <p class="room-description">{{ getRoomDescription() }}</p>
          </div>
        </div>
      </div>

      <!-- 弹窗底部操作按钮 -->
      <div class="modal-footer">
        <button class="apt-btn apt-btn-secondary" @click="closeModal">取消</button>
        <button class="apt-btn" @click="moveToRoom" :disabled="isCurrentLocation || store.isLoading">
          <span v-if="isCurrentLocation">✓ 当前位置</span>
          <span v-else>🚶 移动到此</span>
        </button>
      </div>
    </div>

    <!-- 租客互动面板 -->
    <div v-if="showInteractionPanel" class="interaction-overlay" @click.self="closeInteractionPanel">
      <div class="interaction-panel">
        <div class="interaction-header">
          <h3 class="interaction-title">
            <span class="interaction-icon">💬</span>
            与 {{ selectedTenant }} 互动
          </h3>
          <button class="close-btn" @click="closeInteractionPanel">✕</button>
        </div>
        <div class="interaction-body">
          <p class="interaction-hint">互动选项开发中...</p>
          <div class="interaction-actions">
            <button class="apt-btn" @click="handleInteraction('chat')">
              <span>💬</span>
              <span>聊天</span>
            </button>
            <button class="apt-btn apt-btn-secondary" @click="handleInteraction('gift')">
              <span>🎁</span>
              <span>送礼</span>
            </button>
            <button class="apt-btn apt-btn-secondary" @click="handleInteraction('invite')">
              <span>🎮</span>
              <span>邀请活动</span>
            </button>
          </div>
        </div>
        <div class="interaction-footer">
          <button class="apt-btn apt-btn-secondary" @click="closeInteractionPanel">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

interface RoomGroup {
  id: string;
  displayName: string;
  类型: string;
  住户?: string;
  功能区?: string;
  roomIds: string[];
  isMerged: boolean;
}

const isVisible = ref(false);
const currentRoomGroup = ref<RoomGroup | null>(null);
const showInteractionPanel = ref(false);
const selectedTenant = ref('');

// 房间信息
const roomInfo = computed(() => currentRoomGroup.value);

// 当前在房间的人
const occupants = computed(() => {
  if (!currentRoomGroup.value) return [];

  const people: Array<{ name: string; icon: string; isTenant: boolean }> = [];

  for (const roomId of currentRoomGroup.value.roomIds) {
    // 检查玩家
    if (store.player.currentLocation === roomId) {
      people.push({ name: '你', icon: '👤', isTenant: false });
    }

    // 检查租客
    for (const [tenantName, tenant] of Object.entries(store.tenants)) {
      if (tenant.当前位置 === roomId) {
        people.push({ name: tenantName, icon: '👥', isTenant: true });
      }
    }
  }

  return people;
});

// 是否是当前位置
const isCurrentLocation = computed(() => {
  if (!currentRoomGroup.value) return false;
  return currentRoomGroup.value.roomIds.includes(store.player.currentLocation);
});

// 打开弹窗
function openModal(roomGroup: RoomGroup) {
  currentRoomGroup.value = roomGroup;
  isVisible.value = true;
}

// 关闭弹窗
function closeModal() {
  isVisible.value = false;
  setTimeout(() => {
    currentRoomGroup.value = null;
  }, 300);
}

// 检查房间访问权限
function checkRoomAccess(): { canAccess: boolean; message: string } {
  if (!currentRoomGroup.value) return { canAccess: false, message: '' };

  const roomType = currentRoomGroup.value.类型;

  // 只有套间需要检查访问权限
  if (roomType === '套间') {
    const roomId = currentRoomGroup.value.roomIds[0];
    const room = store.apartments.房间列表[roomId as keyof typeof store.apartments.房间列表];

    // 检查是否有住户
    if (room && room.住户 && room.住户 !== '未知') {
      // 检查房间内是否有人
      const hasOccupants = occupants.value.some(p => p.isTenant);

      if (hasOccupants) {
        return { canAccess: false, message: '似乎有人在……' };
      } else {
        return { canAccess: false, message: '好像上锁了……' };
      }
    }
  }

  return { canAccess: true, message: '' };
}

// 移动到房间
function moveToRoom() {
  if (!currentRoomGroup.value || isCurrentLocation.value) return;

  // 检查访问权限
  const accessCheck = checkRoomAccess();
  if (!accessCheck.canAccess) {
    alert(accessCheck.message);
    return;
  }

  // 使用第一个房间ID作为目标
  const targetRoomId = currentRoomGroup.value.roomIds[0];
  store.moveToRoom(targetRoomId);
  closeModal();
}

// 获取房间ID显示
function getRoomIdDisplay() {
  if (!currentRoomGroup.value) return '';
  if (currentRoomGroup.value.isMerged) {
    return currentRoomGroup.value.roomIds.join('-');
  }
  return currentRoomGroup.value.id;
}

// 获取房间描述
function getRoomDescription() {
  if (!currentRoomGroup.value) return '';

  // 从第一个房间ID获取描述
  const firstRoomId = currentRoomGroup.value.roomIds[0];
  const room = store.apartments.房间列表[firstRoomId as keyof typeof store.apartments.房间列表];
  return room?.描述 || '';
}

// 获取房间样式类
function getRoomClass() {
  if (!currentRoomGroup.value) return '';

  const type = currentRoomGroup.value.类型;
  if (type === '套间') {
    return currentRoomGroup.value.住户 === '未知' ? 'bedroom vacant' : 'bedroom';
  } else if (type === '您的房间') {
    return 'your';
  } else if (type === '公共客厅') {
    return 'public-lounge';
  } else if (type === '健身房') {
    return 'public-gym';
  } else if (type === '洗衣间') {
    return 'public-laundry';
  }
  return 'custom-functional';
}

// 打开互动面板
function openInteractionPanel(tenantName: string) {
  selectedTenant.value = tenantName;
  showInteractionPanel.value = true;
}

// 关闭互动面板
function closeInteractionPanel() {
  showInteractionPanel.value = false;
  selectedTenant.value = '';
}

// 处理互动
function handleInteraction(action: string) {
  console.log(`与 ${selectedTenant.value} 进行互动: ${action}`);
  // TODO: 实现具体的互动逻辑
  if (action === 'chat') {
    store.interactWithTenant(selectedTenant.value);
    closeInteractionPanel();
    closeModal();
  } else {
    // 其他互动选项暂未实现
    alert(`${action} 功能开发中...`);
  }
}

// 暴露方法给父组件
defineExpose({
  openModal,
  closeModal,
});
</script>

<style lang="scss" scoped>
.modal-overlay {
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

.modal-content {
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--apt-border);
  background: rgba(255, 107, 157, 0.1);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 1.5em;
  font-weight: 700;
  color: var(--apt-text);
}

.room-icon {
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.room-details {
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
  display: flex;
  align-items: center;
  gap: 8px;
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

  &.full-width {
    grid-column: 1 / -1;
  }
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

.occupants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.occupant-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;

  &.clickable {
    cursor: pointer;

    &:hover {
      background: rgba(255, 107, 157, 0.2);
      border-color: var(--apt-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
    }
  }
}

.occupant-icon {
  font-size: 1.3em;
}

.occupant-name {
  font-size: 0.95em;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--apt-text-secondary);
  opacity: 0.6;
  font-style: italic;
}

.room-description {
  margin: 0;
  line-height: 1.6;
  color: var(--apt-text);
  opacity: 0.9;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--apt-border);
  background: rgba(0, 0, 0, 0.2);
}

// 互动面板样式
.interaction-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.interaction-panel {
  background: var(--apt-card);
  border: 2px solid var(--apt-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(255, 107, 157, 0.5);
  animation: slideUp 0.3s ease;
}

.interaction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--apt-border);
  background: rgba(255, 107, 157, 0.15);
}

.interaction-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 1.3em;
  font-weight: 700;
  color: var(--apt-text);
}

.interaction-icon {
  font-size: 1.2em;
}

.interaction-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.interaction-hint {
  text-align: center;
  color: var(--apt-text-secondary);
  opacity: 0.7;
  font-style: italic;
  margin: 0;
}

.interaction-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;

  .apt-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    font-size: 0.95em;

    span:first-child {
      font-size: 1.8em;
    }
  }
}

.interaction-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--apt-border);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
}
</style>
