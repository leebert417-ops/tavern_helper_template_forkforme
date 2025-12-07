<template>
  <div class="peep-root">
    <div class="peep-dashboard">
      <header class="top-shell">
        <div class="title-row">
          <div class="title-block">
            <div>
              <h1>窥视者终端</h1>
              <p class="subtitle">运行监控 · 玩家视角</p>
            </div>
          </div>
          <button class="refresh-btn" @click="refresh">刷新情报</button>
        </div>
        <div class="header-info">
          <div class="info-chip">日期：{{ gameState.世界.日期 || '--' }}</div>
          <div class="info-chip">星期：{{ gameState.世界.星期 || '--' }}</div>
          <div class="info-chip">时间：{{ gameState.世界.时间 || '--' }}</div>
          <div class="info-chip">天气：{{ gameState.世界.天气 || '--' }}</div>
          <div class="info-chip">玩家位置：{{ gameState.玩家.位置 || '未知' }}</div>
        </div>
      </header>

      <div class="content-area" :style="contentAreaStyle">
        <section
          class="tab-content characters-tab"
          v-if="activeTab === 'characters'"
          ref="charactersSection"
        >
          <div class="panel-header">
            <h2>角色监控</h2>
            <p class="sub-text">追踪每名租客的即时状态</p>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>角色</th>
                  <th>位置</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="[name, char] in characterEntries"
                  :key="name"
                  class="character-row"
                  :style="characterRowStyle"
                  @click="openCharacter(name)"
                  title="点击查看详细信息"
                >
                  <td>{{ name }}</td>
                  <td>{{ char.位置 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="tab-content scrollable" v-else-if="activeTab === 'liqiang'">
          <div class="panel-header">
            <h2>李强警戒</h2>
            <p class="sub-text">随时掌握屋主的动向与戒心</p>
          </div>
          <div class="status-grid">
            <div class="status-card">
              <p class="label">位置</p>
              <p class="value">{{ gameState.李强.位置 || '未知' }}</p>
            </div>
            <div class="status-card">
              <p class="label">警戒度</p>
              <p class="value danger">{{ gameState.李强.警戒度 }}</p>
            </div>
          </div>
        </section>

        <section class="tab-content scrollable" v-else-if="activeTab === 'cameras'">
          <div class="panel-header">
            <h2>摄像头</h2>
            <p class="sub-text">覆盖范围、暴露度与最新画面</p>
          </div>
          <ul class="list-grid">
            <li
              v-for="[id, cam] in cameraEntries"
              :key="id"
              class="list-card camera-card"
              @click="openCamera(id)"
              title="点击查看当前画面"
            >
              <div class="list-title">{{ id }}</div>
              <div>位置：{{ cam.安装位置 }}</div>
              <div>
                暴露度：
                <span :class="{ danger: cam.暴露度 > 5 }">{{ cam.暴露度 }}</span>
              </div>
              <div v-if="cam.摄像内容">最新画面：{{ cam.摄像内容 }}</div>
            </li>
            <li v-if="cameraEntries.length === 0" class="empty">暂无摄像头数据</li>
          </ul>
        </section>

        <section class="tab-content scrollable" v-else-if="activeTab === 'devices'">
          <div class="panel-header">
            <h2>设备</h2>
            <p class="sub-text">玩家改造与远程控制的设备清单</p>
          </div>
          <ul class="list-grid">
            <li v-for="[id, device] in deviceEntries" :key="id" class="list-card">
              <div class="list-title">{{ id }}</div>
              <div>位置：{{ device.安装位置 }}</div>
              <div>状态：{{ device.状态 }}</div>
              <div>作用：{{ device.作用 }}</div>
            </li>
            <li v-if="deviceEntries.length === 0" class="empty">暂无设备</li>
          </ul>
        </section>

        <section class="tab-content scrollable" v-else>
          <div class="panel-header">
            <h2>仓库</h2>
            <p class="sub-text">库存道具与用途记录</p>
          </div>
          <ul class="list-grid">
            <li v-for="[item, info] in warehouseEntries" :key="item" class="list-card">
              <div class="list-title">{{ item }}</div>
              <div>数量：{{ info.数量 }}</div>
              <div>作用：{{ info.作用 }}</div>
            </li>
            <li v-if="warehouseEntries.length === 0" class="empty">仓库空空如也</li>
          </ul>
        </section>
      </div>

      <nav class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <transition name="fade">
        <div
          v-if="selectedCharacter"
          class="modal-overlay"
          @click.self="closeCharacter"
        >
          <div class="modal-card">
            <header class="modal-header">
              <div>
                <h3>{{ selectedCharacterName }}</h3>
                <p class="modal-location">当前位置：{{ selectedCharacter?.位置 || '未知' }}</p>
              </div>
              <button class="modal-close" @click="closeCharacter">×</button>
            </header>
            <div class="modal-content">
              <div class="modal-row">
                <span class="modal-label">状态</span>
                <span class="modal-value">{{ selectedCharacter?.状态 || '--' }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-label">心情</span>
                <span class="modal-value">{{ selectedCharacter?.心情 || '--' }}</span>
              </div>
              <div class="modal-row meter">
                <span class="modal-label">好感</span>
                <div class="meter-bar">
                  <div class="bar" :style="barStyle(selectedCharacter?.好感度 ?? 0, 'good')"></div>
                </div>
                <span class="modal-value">{{ selectedCharacter?.好感度 ?? 0 }}</span>
              </div>
              <div class="modal-row meter">
                <span class="modal-label">警戒</span>
                <div class="meter-bar">
                  <div class="bar" :style="barStyle(selectedCharacter?.警戒度 ?? 0, 'alert')"></div>
                </div>
                <span class="modal-value">{{ selectedCharacter?.警戒度 ?? 0 }}</span>
              </div>
              <div class="modal-row meter">
                <span class="modal-label">敏感</span>
                <div class="meter-bar">
                  <div class="bar" :style="barStyle(selectedCharacter?.身体敏感度 ?? 0, 'neutral')"></div>
                </div>
                <span class="modal-value">{{ selectedCharacter?.身体敏感度 ?? 0 }}</span>
              </div>
              <div class="modal-row meter">
                <span class="modal-label">意识</span>
                <div class="meter-bar">
                  <div class="bar" :style="barStyle(selectedCharacter?.意识值 ?? 0, 'good')"></div>
                </div>
                <span class="modal-value">{{ selectedCharacter?.意识值 ?? 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div
          v-if="selectedCamera"
          class="modal-overlay"
          @click.self="closeCamera"
        >
          <div class="modal-card camera-modal">
            <header class="modal-header">
              <div>
                <h3>{{ selectedCameraId }}</h3>
                <p class="modal-location">
                  安装位置：{{ selectedCamera?.安装位置 || '未知' }}
                </p>
              </div>
              <button class="modal-close" @click="closeCamera">×</button>
            </header>
            <div class="modal-content camera-modal-content">
              <p>暴露度：{{ selectedCamera?.暴露度 ?? '--' }}</p>
              <p>
                当前画面：
                {{ selectedCamera?.摄像内容 || '暂无画面' }}
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGameStore } from './store';
import { storeToRefs } from 'pinia';

const store = useGameStore();
const { gameState } = storeToRefs(store);

const tabs = [
  { key: 'characters', label: '角色监控' },
  { key: 'liqiang', label: '李强警戒' },
  { key: 'cameras', label: '摄像头' },
  { key: 'devices', label: '设备' },
  { key: 'warehouse', label: '仓库' },
];

const activeTab = ref<(typeof tabs)[number]['key']>('characters');

const characterEntries = computed(() => Object.entries(gameState.value.角色 || {}));
const cameraEntries = computed(() => Object.entries(gameState.value.摄像头 || {}));
const deviceEntries = computed(() => Object.entries(gameState.value.设备 || {}));
const warehouseEntries = computed(() => Object.entries(gameState.value.仓库 || {}));

const charactersSection = ref<HTMLElement | null>(null);
const DEFAULT_CONTENT_HEIGHT = 520;
const contentHeight = ref(DEFAULT_CONTENT_HEIGHT);

const measureCharactersHeight = () => {
  if (!charactersSection.value) return;
  const measured = Math.ceil(charactersSection.value.getBoundingClientRect().height);
  if (measured > 0) {
    contentHeight.value = measured;
  }
};

const queueHeightMeasure = () => {
  nextTick(() => {
    if (activeTab.value === 'characters') {
      measureCharactersHeight();
    }
  });
};

const onResize = () => {
  if (activeTab.value === 'characters') {
    measureCharactersHeight();
  }
};

onMounted(() => {
  queueHeightMeasure();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize);
  }
});

watch(characterEntries, () => {
  if (activeTab.value === 'characters') {
    queueHeightMeasure();
  }
});

watch(activeTab, (tab) => {
  if (tab === 'characters') {
    queueHeightMeasure();
  }
});


const refresh = () => store.refreshGameState();

const selectedCharacterName = ref<string | null>(null);
const selectedCharacter = computed(() => {
  if (!selectedCharacterName.value) return null;
  return gameState.value.角色?.[selectedCharacterName.value] || null;
});

const openCharacter = (name: string) => {
  selectedCharacterName.value = name;
};

const closeCharacter = () => {
  selectedCharacterName.value = null;
};

const selectedCameraId = ref<string | null>(null);
const selectedCamera = computed(() => {
  if (!selectedCameraId.value) return null;
  return gameState.value.摄像头?.[selectedCameraId.value] || null;
});

const openCamera = (id: string) => {
  selectedCameraId.value = id;
};

const closeCamera = () => {
  selectedCameraId.value = null;
};

const CHARACTER_ROW_HEIGHT = 48;
const characterRowStyle = computed(() => ({
  height: `${CHARACTER_ROW_HEIGHT}px`,
}));

const contentAreaStyle = computed(() => ({
  height: `${contentHeight.value}px`,
}));

const barStyle = (value: number, type: 'good' | 'alert' | 'neutral') => {
  const colors: Record<typeof type, string> = {
    good: '#3aff82',
    alert: '#ffb347',
    neutral: '#5bc0de',
  };
  return {
    '--bar-color': colors[type],
    width: `${Math.min(value, 100)}%`,
  };
};
</script>

<style scoped lang="scss">
.peep-root {
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  box-sizing: border-box;
}

.peep-dashboard {
  width: min(1100px, calc(100% - 48px));
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 18px;
  color: #d6f3d2;
  background: rgba(2, 8, 2, 0.6);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(132, 255, 132, 0.3);
}

.top-shell {
  border: 1px solid #1f441f;
  border-radius: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-block {
  display: flex;
  flex-direction: column;
  flex: 1;
}

h1 {
  margin: 0;
  font-size: 1.3rem;
  color: #f0fff0;
}

.subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #85b885;
}

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.info-chip {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.8rem;
}

.title-row .refresh-btn {
  margin-left: auto;
}

.refresh-btn {
  background: #0f380f;
  border: 1px solid #4caf50;
  border-radius: 6px;
  color: #a3fda3;
  padding: 6px 14px;
  font-weight: 600;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #1d5a1d;
}

.content-area {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
}

.tab-content {
  width: 100%;
  border: 1px solid #1f441f;
  border-radius: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.tab-content.scrollable {
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  color: #a4ffde;
  font-size: 1.3rem;
}

.sub-text {
  margin: 0;
  color: #7da47d;
  font-size: 0.85rem;
}

.label {
  font-size: 0.8rem;
  color: #7a9d7a;
  margin: 0;
}

.value {
  font-size: 1.1rem;
  margin: 0;
  color: #f0fff0;
}

.value.danger {
  color: #ff7070;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.character-row {
  cursor: pointer;
}

.characters-tab {
  overflow: visible;
  flex: 1 1 auto;
  height: 100%;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #1d301d;
  padding: 8px;
  text-align: left;
}

tbody tr:hover {
  background: rgba(66, 134, 66, 0.12);
}

.bar {
  height: 6px;
  background: var(--bar-color);
  border-radius: 3px;
  margin-bottom: 4px;
  transition: width 0.3s ease;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
}

.modal-card {
  width: min(480px, 100%);
  background: rgba(5, 15, 5, 0.95);
  border: 1px solid #2c582c;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #a4ffde;
}

.modal-location {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #7da47d;
}

.modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #f0fff0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-row:last-child {
  border-bottom: none;
}

.modal-label {
  color: #7da47d;
  font-size: 0.85rem;
}

.modal-value {
  color: #f0fff0;
  font-weight: 600;
}

.modal-row.meter {
  align-items: center;
}

.meter-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 4px;
}

.meter-bar .bar {
  margin: 0;
  height: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.status-card {
  border: 1px solid #2c582c;
  border-radius: 12px;
  padding: 16px;
  background: rgba(5, 15, 5, 0.7);
}

.list-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.list-card {
  border: 1px solid #234b23;
  border-radius: 12px;
  padding: 14px;
  background: rgba(5, 20, 5, 0.6);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}

.camera-card {
  cursor: pointer;
  transition: background 0.2s ease;
}

.camera-card:hover {
  background: rgba(18, 60, 18, 0.8);
}

.list-title {
  font-weight: bold;
  color: #efffe3;
  margin-bottom: 4px;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #5f7e5f;
  font-style: italic;
  border: 1px dashed #3f6a3f;
  border-radius: 10px;
  padding: 16px;
}

.tab-bar {
  margin-top: 0;
  display: flex;
  gap: 10px;
  border: 1px solid #1f441f;
  border-radius: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.tab-btn {
  flex: 1;
  min-width: 120px;
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  color: #9bcf9b;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #071706;
  background: linear-gradient(90deg, #74ffba, #53c781);
  box-shadow: 0 6px 18px rgba(84, 196, 129, 0.25);
}

.camera-modal .modal-content p {
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .tab-bar {
    flex-direction: column;
    gap: 8px;
  }

  .tab-btn {
    min-width: 0;
    width: 100%;
  }
}
</style>
