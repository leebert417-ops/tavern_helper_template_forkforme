<template>
  <div class="inventory-page apt-card">
    <div class="apt-card-title">
      <span>🎒</span>
      <span>背包</span>
      <span class="subtitle">{{ totalItems }} 件道具</span>
    </div>
    <div class="apt-card-body custom-scrollbar">
      <div v-if="totalItems === 0" class="empty-inventory">
        <div class="empty-icon">📦</div>
        <div class="empty-text">背包空空如也</div>
        <div class="empty-hint">探索公寓，收集道具吧！</div>
      </div>

      <div v-else class="items-grid">
        <div
          v-for="(item, index) in store.player.inventory"
          :key="index"
          class="item-card"
          @click="selectItem(item, index)"
        >
          <!-- 道具图标 -->
          <div class="item-icon">
            <span>{{ getItemIcon(item.type) }}</span>
          </div>

          <!-- 道具信息 -->
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-type">{{ item.type }}</div>
          </div>

          <!-- 道具数量 -->
          <div v-if="item.quantity && item.quantity > 1" class="item-quantity">
            ×{{ item.quantity }}
          </div>
        </div>
      </div>
    </div>

    <!-- 道具详情弹窗 -->
    <div v-if="selectedItem" class="detail-overlay" @click.self="closeDetail">
      <div class="detail-panel">
        <div class="detail-header">
          <h2 class="detail-title">
            <span class="detail-icon">{{ getItemIcon(selectedItem.type) }}</span>
            {{ selectedItem.name }}
          </h2>
          <button class="close-btn" @click="closeDetail">✕</button>
        </div>

        <div class="detail-body custom-scrollbar">
          <div class="item-details">
            <!-- 基础信息 -->
            <div class="detail-section">
              <h3 class="section-title">📋 基础信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">类型：</span>
                  <span class="info-value">{{ selectedItem.type }}</span>
                </div>
                <div v-if="selectedItem.quantity && selectedItem.quantity > 1" class="info-item">
                  <span class="info-label">数量：</span>
                  <span class="info-value highlight">×{{ selectedItem.quantity }}</span>
                </div>
              </div>
            </div>

            <!-- 道具描述 -->
            <div v-if="selectedItem.description" class="detail-section">
              <h3 class="section-title">📝 描述</h3>
              <p class="item-description">{{ selectedItem.description }}</p>
            </div>

            <!-- 道具效果 -->
            <div v-if="selectedItem.effect" class="detail-section">
              <h3 class="section-title">✨ 效果</h3>
              <p class="item-effect">{{ selectedItem.effect }}</p>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <button class="apt-btn apt-btn-secondary" @click="closeDetail">关闭</button>
          <button
            class="apt-btn"
            @click="useItem"
            :disabled="!canUseItem(selectedItem)"
          >
            {{ canUseItem(selectedItem) ? '使用' : '无法使用' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../gameStore';

const store = useGameStore();

interface InventoryItem {
  name: string;
  type: string;
  description?: string;
  effect?: string;
  quantity?: number;
  usable?: boolean;
}

const selectedItem = ref<InventoryItem | null>(null);
const selectedItemIndex = ref<number>(-1);

// 道具总数
const totalItems = computed(() => {
  return store.player.inventory?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
});

// 选择道具
function selectItem(item: InventoryItem, index: number) {
  selectedItem.value = item;
  selectedItemIndex.value = index;
}

// 关闭详情
function closeDetail() {
  selectedItem.value = null;
  selectedItemIndex.value = -1;
}

// 获取道具图标
function getItemIcon(type: string): string {
  const iconMap: Record<string, string> = {
    食物: '🍱',
    饮料: '🥤',
    礼物: '🎁',
    工具: '🔧',
    钥匙: '🔑',
    书籍: '📚',
    装饰: '🎨',
    电子产品: '📱',
    化妆品: '💄',
    衣物: '👔',
    药品: '💊',
    其他: '📦',
  };
  return iconMap[type] || '📦';
}

// 检查道具是否可用
function canUseItem(item: InventoryItem): boolean {
  return item.usable !== false;
}

// 使用道具
function useItem() {
  if (!selectedItem.value || !canUseItem(selectedItem.value)) return;
  
  // TODO: 实现道具使用逻辑
  alert(`使用了 ${selectedItem.value.name}！\n功能开发中...`);
  
  // 如果道具有数量，减少数量
  if (selectedItem.value.quantity && selectedItem.value.quantity > 1) {
    selectedItem.value.quantity--;
  } else {
    // 移除道具
    if (selectedItemIndex.value >= 0) {
      store.player.inventory.splice(selectedItemIndex.value, 1);
    }
  }
  
  closeDetail();
}
</script>

<style lang="scss" scoped>
.inventory-page {
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

.empty-inventory {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 40px;
}

.empty-icon {
  font-size: 4em;
  opacity: 0.3;
}

.empty-text {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--apt-text-secondary);
  opacity: 0.6;
}

.empty-hint {
  font-size: 0.9em;
  color: var(--apt-text-secondary);
  opacity: 0.5;
  font-style: italic;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 4px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--apt-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 107, 157, 0.1);
    border-color: var(--apt-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);
  }
}

.item-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 2em;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1em;
  font-weight: 700;
  color: var(--apt-text);
  margin-bottom: 4px;
}

.item-type {
  font-size: 0.85em;
  color: var(--apt-text-secondary);
  opacity: 0.8;
}

.item-quantity {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--apt-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 700;
}

// 详情弹窗样式（复用其他组件的样式）
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
  max-width: 500px;
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

.item-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 1em;
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

.item-description,
.item-effect {
  margin: 0;
  line-height: 1.6;
  color: var(--apt-text);
  opacity: 0.9;
}

.detail-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--apt-border);
  background: rgba(0, 0, 0, 0.2);
}
</style>

