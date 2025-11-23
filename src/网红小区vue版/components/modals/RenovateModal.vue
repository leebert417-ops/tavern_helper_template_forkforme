<template>
  <BaseModal
    :visible="uiStore.activeModal === 'renovate'"
    title="🔨 装修选择"
    max-width="450px"
    @close="close"
  >
    <p class="ngq-modal-subtitle">选择要将 {{ roomId }} 装修为何种类型：</p>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
      <button class="ngq-modal-btn ngq-modal-btn-confirm" style="padding: 16px; font-size: 15px;" @click="renovateToSuite">
        🏠 标准套间
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">一室一厅一卫一厨，可出租给租客</div>
      </button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" style="padding: 16px; font-size: 15px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);" @click="renovateToFunctional">
        🔧 功能性房间
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">公共设施（客厅/健身房/洗衣间等）</div>
      </button>
    </div>
    <div class="ngq-modal-actions" style="margin-top: 16px;">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" style="width:100%" @click="close">取消</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '../../stores';
import { fillCommand } from '../../utils/commandHelper';
import BaseModal from './BaseModal.vue';

const uiStore = useUIStore();
const roomId = computed(() => uiStore.modalData?.roomId || '');

const close = () => {
  uiStore.closeModal();
};

const renovateToSuite = () => {
  if (!roomId.value) return;
  fillCommand(`将 ${roomId.value} 装修为标准套间（一室一厅一卫一厨，35-50㎡）`);
  close();
};

const renovateToFunctional = () => {
  if (!roomId.value) return;
  // 切换到功能性房间输入模态框
  uiStore.openModal('functionalInput', { roomId: roomId.value });
};

</script>
