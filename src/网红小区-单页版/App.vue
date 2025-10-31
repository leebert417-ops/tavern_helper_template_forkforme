<template>
  <div id="app-container">
    <!-- 主卡片容器 -->
    <div class="main-card apt-card">
      <!-- 头部信息栏 -->
      <div class="header-bar">
        <div class="header-title">
          <span class="title-icon">🏢</span>
          <span class="title-text">网红小区</span>
        </div>
        <div class="header-info-line">
          <span class="info-item">{{ store.world.地点 }}</span>
          <span class="info-separator">|</span>
          <span class="info-item">{{ store.world.年份 }} {{ store.world.日期 }} {{ store.world.星期 }}</span>
          <span class="info-separator">|</span>
          <span class="info-item">{{ store.world.时间 }}</span>
        </div>
      </div>

      <!-- 标签页内容区域 -->
      <div class="tab-content">
        <!-- 地图页 -->
        <div v-show="activeTab === 'map'" class="tab-pane">
          <MapView />
        </div>

        <!-- 行动页 -->
        <div v-show="activeTab === 'action'" class="tab-pane">
          <ActionPanel />
        </div>

        <!-- 叙事页 -->
        <div v-show="activeTab === 'narrative'" class="tab-pane">
          <NarrativeWindow />
        </div>

        <!-- 档案页 -->
        <div v-show="activeTab === 'profile'" class="tab-pane">
          <ProfilePage />
        </div>

        <!-- 背包页 -->
        <div v-show="activeTab === 'inventory'" class="tab-pane">
          <InventoryPage />
        </div>
      </div>

      <!-- 底部标签页切换按钮 -->
      <div class="tab-buttons">
        <button :class="['tab-btn', { active: activeTab === 'map' }]" @click="activeTab = 'map'">
          <span class="tab-icon">🏢</span>
          <span class="tab-label">地图</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'action' }]" @click="activeTab = 'action'">
          <span class="tab-icon">🎮</span>
          <span class="tab-label">行动</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'narrative' }]" @click="activeTab = 'narrative'">
          <span class="tab-icon">📖</span>
          <span class="tab-label">叙事</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'profile' }]" @click="activeTab = 'profile'">
          <span class="tab-icon">📋</span>
          <span class="tab-label">档案</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'inventory' }]" @click="activeTab = 'inventory'">
          <span class="tab-icon">🎒</span>
          <span class="tab-label">背包</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { klona } from 'klona/lite'; // 根據 .cursor 規則，使用 klona 去除 proxy
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useGameStore } from './gameStore';

// 導入所有組件
import ActionPanel from './components/ActionPanel.vue';
import InventoryPage from './components/InventoryPage.vue';
import MapView from './components/MapView.vue';
import NarrativeWindow from './components/NarrativeWindow.vue';
import ProfilePage from './components/ProfilePage.vue';

const store = useGameStore();
const messageId = getCurrentMessageId(); // 獲取當前消息樓層 ID

// 当前激活的标签页（默认为地图页）
const activeTab = ref<'map' | 'action' | 'narrative' | 'profile' | 'inventory'>('map');

// 计算属性：当前房间显示
const currentRoomDisplay = computed(() => {
  const roomId = store.player.currentLocation;
  const room = store.apartments.房间列表[roomId as keyof typeof store.apartments.房间列表];
  if (!room) return roomId;

  // 如果有住户，显示"XX的房间"
  if (room.住户 && room.住户 !== '未知') {
    return `${room.住户}的房间`;
  }

  // 否则显示房间类型
  return room.类型 || roomId;
});

// 计算属性：租客总数
const tenantCount = computed(() => {
  return Object.keys(store.tenants).length;
});

// 计算属性：附近的租客
const nearbyTenants = computed(() => {
  const currentLocation = store.player.currentLocation;
  const nearby: string[] = [];

  for (const [tenantName, tenant] of Object.entries(store.tenants)) {
    if (tenant.当前位置 === currentLocation) {
      nearby.push(tenantName);
    }
  }

  return nearby;
});

// 计算属性：背包道具总数
const totalItems = computed(() => {
  return store.player.inventory?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
});

onMounted(async () => {
  console.log('App.vue onMounted: 正在加載遊戲狀態...');
  try {
    // 1. 從當前消息樓層加載持久化的狀態
    const loadedState = await getVariables({
      type: 'message',
      message_id: messageId,
    });

    if (loadedState && Object.keys(loadedState).length > 0) {
      // 2. 如果有狀態，則恢復 Pinia store
      store.$patch(klona(loadedState)); // 使用 klona 確保傳入的是純 JS 對象
      console.log('遊戲狀態已從消息樓層成功恢復:', loadedState);
      // 3. 添加加載成功日誌
      store.addNarrativeMessage('system', '遊戲狀態已從酒館消息樓層成功加載。');
    } else {
      // 3. 如果是第一次加載（沒有保存狀態），添加歡迎日誌
      console.log('未找到保存的狀態，初始化新遊戲。');
      store.addNarrativeMessage('system', '歡迎來到網紅小區。你作為房東的模擬經營遊戲現在開始。');
    }
  } catch (error) {
    console.error('加載遊戲狀態時出錯:', error);
    store.addNarrativeMessage('system', `[錯誤] 加載遊戲狀態失敗: ${error.message}`);
  }
});

// 4. 監聽 Pinia 狀態變化，並將其自動保存回消息樓層變量
watchEffect(async () => {
  if (store.isLoading) {
    // 如果正在等待 LLM 回應 (isLoading)，則暫不保存
    // 避免在 Mvu.parseMessage 還未完成時就觸發保存，導致狀態不一致
    return;
  }

  try {
    // 使用 klona() 去除 proxy，這對於 replaceVariables 至關重要
    const stateToSave = klona(store.$state);

    // 確保只保存核心狀態，而不是整個 store 實例
    await replaceVariables(stateToSave, {
      type: 'message',
      message_id: messageId,
    });
    console.log('遊戲狀態已自動保存到消息樓層。');
  } catch (error) {
    console.error('自動保存遊戲狀態時出錯:', error);
    // 可選：在敘事日誌中顯示保存失敗
    // store.addNarrativeMessage('system', `[錯誤] 自動保存失敗: ${error.message}`);
  }
});
</script>

<style lang="scss">
/* 導入全局主題樣式 */
@import './styles/theme.scss';

#app-container {
  width: 100%;
  height: 100%;
  min-width: 800px;
  min-height: 600px;
  color: var(--apt-text);
  background-color: var(--apt-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主卡片容器 */
.main-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  max-height: 900px;
  margin: 0 auto;
}

/* 头部信息栏 */
.header-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  border-bottom: none;
  flex-shrink: 0;
  border-radius: 12px 12px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 1.5em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.title-text {
  font-size: 1.3em;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-info-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.95);
  margin-left: 32px;
}

.info-item {
  white-space: nowrap;
}

.info-separator {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .header-bar {
    padding: 10px 16px;
  }

  .title-icon {
    font-size: 1.2em;
  }

  .title-text {
    font-size: 1.1em;
  }

  .header-info-line {
    font-size: 0.8em;
    margin-left: 28px;
    flex-wrap: wrap;
  }
}

/* 标签页内容区域 */
.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.tab-pane {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

/* 底部标签页按钮栏 - 融合在卡片内 */
.tab-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--apt-border);
  padding: 12px 16px;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--apt-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 107, 157, 0.5);
    color: var(--apt-text);
  }

  &.active {
    background: linear-gradient(135deg, var(--apt-primary) 0%, var(--apt-secondary) 100%);
    border-color: var(--apt-primary);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);

    .tab-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.tab-icon {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.tab-label {
  font-size: 14px;
  white-space: nowrap;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .tab-btn {
    min-width: 70px;
    padding: 8px 12px;
    gap: 6px;
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-label {
    font-size: 12px;
  }
}
</style>
