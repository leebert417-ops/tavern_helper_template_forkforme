<template>
  <div class="ngq-card" style="margin-top:16px">
    <div class="ngq-card-title">
      <span>🏢</span>
      <span>小区管理</span>
    </div>
    <div class="ngq-card-body">
      <div class="ngq-management-actions">
        <button class="ngq-btn" @click="openRecruitmentModal">👤 招募新租客</button>
        <button class="ngq-btn" @click="buyNewFloor">🏗️ 购置新楼层</button>
      </div>
      <div class="ngq-management-actions" style="margin-top:12px">
        <button class="ngq-btn" @click="refreshData" :disabled="apartmentStore.loading">
          <span v-if="apartmentStore.loading">🔄 加载中...</span>
          <span v-else>🔄 刷新数据</span>
        </button>
        <button class="ngq-btn" @click="toggleAutoRefresh">{{ autoRefreshText }}</button>
      </div>
      <div class="ngq-hint">
        💡 提示：购置新楼层将同时建造4个公寓单元（如四楼：401/402/403/404）
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore, useApartmentStore, useSettingsStore } from '../stores';
import { fillCommand } from '../utils/commandHelper';

const uiStore = useUIStore();
const apartmentStore = useApartmentStore();
const settingsStore = useSettingsStore();

const autoRefreshText = computed(() => {
  return settingsStore.autoRefreshEnabled ? '⏱️ 自动刷新: 开' : '⏱️ 自动刷新: 关';
});

const openRecruitmentModal = () => {
  uiStore.openModal('recruitment');
};

const buyNewFloor = () => {
  fillCommand('购置新楼层（需同时建造4个公寓单元：01/02/03/04）');
};

const refreshData = () => {
  apartmentStore.loadData();
};

const toggleAutoRefresh = () => {
  settingsStore.toggleAutoRefresh();
};
</script>
