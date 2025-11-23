<template>
  <BaseModal
    :visible="uiStore.activeModal === 'room'"
    :title="title"
    max-width="500px"
    @close="close"
  >
    <div v-if="!room"> 
      <div class="ngq-empty">
        <div class="ngq-empty-icon">❓</div>
        <div>房间数据不存在</div>
      </div>
    </div>
    <div v-else>
      <!-- 房间基本信息 -->
      <div class="ngq-info-section">
        <div class="ngq-info-row">
          <span class="ngq-info-label">房间类型</span>
          <span class="ngq-info-value">{{ room.type }}</span>
        </div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">所在楼层</span>
          <span class="ngq-info-value">{{ room.floor }}</span>
        </div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">位置</span>
          <span class="ngq-info-value">{{ room.position }}</span>
        </div>
        <div v-if="room.description" class="ngq-info-block">
          <span class="ngq-info-label">房间描述</span>
          <div class="ngq-info-value">{{ room.description }}</div>
        </div>
      </div>

      <!-- 租客信息 -->
      <div v-if="tenant" class="ngq-info-section tenant-section">
        <div class="ngq-section-title">👤 租客信息</div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">姓名</span>
          <span class="ngq-info-value">{{ tenant.name }}</span>
        </div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">年龄</span>
          <span class="ngq-info-value">{{ tenant.age }}岁</span>
        </div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">职业</span>
          <span class="ngq-info-value">📱 {{ tenant.job }}</span>
        </div>
        <div class="ngq-info-row">
          <span class="ngq-info-label">创作内容</span>
          <span class="ngq-info-value">✨ {{ tenant.creatorType }}</span>
        </div>

        <!-- 进度条 -->
        <div class="ngq-info-block">
          <span class="ngq-info-label">❤️ 好感度</span>
          <div class="ngq-progress-bar">
            <div class="ngq-progress-fill favor" :style="{ width: tenant.favor + '%' }">{{ tenant.favor }}</div>
          </div>
        </div>
        <div class="ngq-info-block">
          <span class="ngq-info-label">🔥 性欲</span>
          <div class="ngq-progress-bar">
            <div class="ngq-progress-fill lust" :style="{ width: tenant.lust + '%' }">{{ tenant.lust }}</div>
          </div>
        </div>

        <!-- 长文本信息 -->
        <div class="ngq-info-block"><span class="ngq-info-label">外貌特征</span><div class="ngq-info-value">{{ tenant.appearance }}</div></div>
        <div class="ngq-info-block"><span class="ngq-info-label">性格</span><div class="ngq-info-value">{{ tenant.personality }}</div></div>
        <div class="ngq-info-block"><span class="ngq-info-label">当前状态</span><div class="ngq-info-value">{{ tenant.status }}</div></div>
        <div class="ngq-info-block"><span class="ngq-info-label">内心想法</span><div class="ngq-info-value">{{ tenant.mood }}</div></div>
        <div class="ngq-info-row"><span class="ngq-info-label">入住天数</span><span class="ngq-info-value">📅 {{ tenant.daysStayed }}天</span></div>
      </div>

      <!-- 空房间/自住房提示 -->
      <div v-else-if="room.type === '套间'" class="ngq-empty-subtle">🏠 该套间暂无租客入住</div>
      <div v-else-if="room.type === '您的房间'" class="ngq-empty-subtle">👑 这是您的私人套间</div>

    </div>

    <!-- 操作按钮 -->
    <template #actions>
      <div class="ngq-modal-actions">
        <button class="ngq-modal-btn ngq-modal-btn-confirm" @click="close">关闭</button>
      </div>
      <div v-if="canDemolish" class="ngq-modal-actions" style="margin-top: 8px;">
        <button class="ngq-modal-btn demolish-btn" @click="demolish">🗑️ 拆除房间</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore, useApartmentStore } from '../../stores';
import { fillCommand } from '../../utils/commandHelper';
import BaseModal from './BaseModal.vue';

const uiStore = useUIStore();
const apartmentStore = useApartmentStore();

const roomId = computed(() => uiStore.modalData?.roomId || null);
const room = computed(() => roomId.value ? apartmentStore.getRoomById(roomId.value) : null);
const tenant = computed(() => room.value?.tenant && room.value.tenant !== '未知' ? apartmentStore.getTenantByName(room.value.tenant) : null);

const title = computed(() => {
  if (!room.value) return '房间详情';
  const icon = room.value.type === '您的房间' ? '👑' : '🏠';
  return `${icon} ${room.value.name}`;
});

const canDemolish = computed(() => {
  if (!room.value) return false;
  const defaultPublicRooms = ['101', '102', '103', '104', '204', '304'];
  const isYourRoom = room.value.type === '您的房间';
  const isDefaultPublic = defaultPublicRooms.includes(room.value.name);
  const isOccupiedSuite = room.value.type === '套间' && room.value.tenant !== '未知';
  
  return !isYourRoom && !isDefaultPublic && !isOccupiedSuite;
});

const close = () => {
  uiStore.closeModal();
};

const demolish = () => {
  if (!canDemolish.value || !room.value) return;
  const confirmed = confirm(`确定要拆除 ${room.value.name} 吗？\n拆除后将变为空房间，需要重新装修才能使用。`);
  if (confirmed) {
    fillCommand(`拆除 ${room.value.name}，将其还原为空房间状态`);
    close();
  }
};
</script>
