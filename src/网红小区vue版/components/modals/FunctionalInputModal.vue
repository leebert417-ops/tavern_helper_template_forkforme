<template>
  <BaseModal
    :visible="uiStore.activeModal === 'functionalInput'"
    title="🔧 功能性房间详情"
    max-width="450px"
    @close="close"
  >
    <p class="ngq-modal-subtitle">请输入 {{ roomId }} 的详细信息：</p>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
      <div>
        <label class="ngq-modal-label">房间名称</label>
        <input
          ref="nameInputRef"
          v-model="name"
          type="text"
          class="ngq-input"
          placeholder="例如：健身房、影音室、茶室"
        />
      </div>
      <div>
        <label class="ngq-modal-label">房间作用</label>
        <input
          v-model="purpose"
          type="text"
          class="ngq-input"
          placeholder="例如：配备跑步机和瑜伽垫，供租客免费使用"
          @keypress.enter="confirm"
        />
      </div>
    </div>
    <div class="ngq-modal-actions">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" @click="close">取消</button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" @click="confirm">确认装修</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useUIStore } from '../../stores';
import { fillCommand } from '../../utils/commandHelper';
import BaseModal from './BaseModal.vue';

const uiStore = useUIStore();
const name = ref('');
const purpose = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null);

const roomId = computed(() => uiStore.modalData?.roomId || '');

const close = () => {
  uiStore.closeModal();
};

const confirm = () => {
  const roomName = name.value.trim();
  const roomPurpose = purpose.value.trim();

  if (!roomName) {
    toastr?.warning('请输入房间名称');
    nameInputRef.value?.focus();
    return;
  }
  if (!roomPurpose) {
    toastr?.warning('请输入房间作用');
    return;
  }

  fillCommand(`将 ${roomId.value} 装修为功能性房间【${roomName}】，作用：${roomPurpose}`);
  close();
};

// 当模态框显示时，自动聚焦到输入框
watch(() => uiStore.activeModal, (modal) => {
  if (modal === 'functionalInput') {
    name.value = '';
    purpose.value = '';
    nextTick(() => {
      nameInputRef.value?.focus();
    });
  }
});
</script>


