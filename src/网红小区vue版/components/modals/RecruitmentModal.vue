<template>
  <BaseModal
    :visible="uiStore.activeModal === 'recruitment'"
    title="👤 招募新租客"
    @close="close"
  >
    <p class="ngq-modal-subtitle">网红小区专注于内容创作者，请输入您期望的租客特征</p>
    <input
      ref="inputRef"
      v-model="keywords"
      type="text"
      class="ngq-input"
      placeholder="例如：美妆博主、游戏主播、舞蹈UP主"
      @keypress.enter="confirm"
    />
    <div class="ngq-modal-actions">
      <button class="ngq-modal-btn ngq-modal-btn-cancel" @click="close">取消</button>
      <button class="ngq-modal-btn ngq-modal-btn-confirm" @click="confirm">确认招募</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUIStore } from '../../stores';
import { fillCommand } from '../../utils/commandHelper';
import BaseModal from './BaseModal.vue';

const uiStore = useUIStore();
const keywords = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const close = () => {
  uiStore.closeModal();
};

const confirm = () => {
  if (!keywords.value.trim()) {
    toastr?.warning('请输入租客特征后再确认。');
    inputRef.value?.focus();
    return;
  }
  fillCommand(`招募一名符合以下特征的租客：${keywords.value.trim()}`);
  close();
};

// 当模态框显示时，自动聚焦到输入框
watch(() => uiStore.activeModal, (modal) => {
  if (modal === 'recruitment') {
    // 重置输入
    keywords.value = '';
    // nextTick 确保 DOM 更新后再聚焦
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});
</script>
