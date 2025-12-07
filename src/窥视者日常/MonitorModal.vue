<template>
  <div class="monitor-modal-overlay" @click.self="$emit('close')">
    <div class="monitor-modal" ref="modalContentRef">
      <div class="modal-header">
        <span class="modal-title">CAM-{{ tenant.room }} : {{ tenant.name }}</span>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 模拟监控画面 -->
        <div class="video-feed" :class="{ 'offline': !tenant.is_home }">
          <div class="feed-overlay">
            <span class="rec-badge" v-if="tenant.is_home">● REC</span>
            <span class="time-stamp">{{ currentTime }}</span>
          </div>
          <div class="feed-content">
             <div v-if="tenant.is_home" class="feed-live">
                <div class="scan-line"></div>
                <p class="state-large">{{ tenant.state }}</p>
             </div>
             <div v-else class="feed-offline">
                NO SIGNAL
             </div>
          </div>
        </div>

        <!-- 数据面板 -->
        <div class="data-panel" v-if="tenant.is_home">
           <div class="data-row">
             <label>意识 (Consciousness)</label>
             <div class="progress-bar">
               <div class="fill" :style="{width: tenant.params.consciousness + '%', background: getConsciousnessColor(tenant.params.consciousness)}"></div>
               <span class="value">{{ tenant.params.consciousness }}%</span>
             </div>
           </div>
           <div class="data-row">
             <label>警惕 (Alertness)</label>
             <div class="progress-bar">
               <div class="fill alert" :style="{width: tenant.params.alertness + '%'}"></div>
               <span class="value">{{ tenant.params.alertness }}%</span>
             </div>
           </div>
           <div class="data-row" v-if="tenant.params.li_qiang_alertness !== undefined">
             <label class="danger-text">⚠ 李强警惕度</label>
             <div class="progress-bar">
               <div class="fill danger" :style="{width: tenant.params.li_qiang_alertness + '%'}"></div>
               <span class="value">{{ tenant.params.li_qiang_alertness }}%</span>
             </div>
           </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-panel">
            <button class="action-btn stealth" :disabled="!tenant.is_home" @click="triggerAction('stealth')">
                👻 潜入
            </button>
            <button class="action-btn" @click="triggerAction('hack')">
                💻 黑入设备
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useGameStore } from './store';

const props = defineProps<{
  tenant: any
}>();

const emit = defineEmits(['close']);
const store = useGameStore();

const modalContentRef = ref<HTMLElement | null>(null);

const currentTime = computed(() => store.gameState.world.time);

const getConsciousnessColor = (val: number) => {
  if (val < 30) return '#ff00ff'; // 昏迷 (紫色)
  if (val < 60) return '#ffff00'; // 困倦 (黄色)
  return '#00ff00'; // 清醒 (绿色)
};

const triggerAction = (action: string) => {
  console.log(`触发动作: ${action} 目标: ${props.tenant.name}`);
  // TODO: 发送 slash 指令
};

onMounted(async () => {
  await nextTick();
  if (modalContentRef.value) {
    const modalHeight = modalContentRef.value.offsetHeight;
    console.log('[MonitorModal] Modal content height:', modalHeight);

    if (typeof setIframeHeight === 'function') {
      setIframeHeight(modalHeight + 40);
      console.log('[MonitorModal] Adjusted iframe height to:', modalHeight + 40);
    } else {
      console.warn('[MonitorModal] setIframeHeight function not found globally.');
    }
  }
});

onUnmounted(() => {
  if (typeof setIframeHeight === 'function') {
    setIframeHeight();
    console.log('[MonitorModal] Reset iframe height.');
  }
});
</script>

<style lang="scss" scoped>
.monitor-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  overflow-y: auto;
}

.monitor-modal {
  background: #0a0a0a;
  border: 1px solid #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  max-height: 95vh;
  overflow-y: auto;
}

.modal-header {
  flex-shrink: 0;
  padding: 10px;
  background: #002200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #004400;
  
  .modal-title {
    color: #00ff00;
    font-weight: bold;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: #00ff00;
    font-size: 1.5rem;
    cursor: pointer;
    &:hover { color: #fff; }
  }
}

.modal-body {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.video-feed {
  aspect-ratio: 16/9;
  background: #000;
  position: relative;
  border: 1px solid #333;
  overflow: hidden;
  flex-shrink: 0;
  
  &.offline { border-color: #333; }
  
  .feed-overlay {
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    display: flex;
    justify-content: space-between;
    color: #00ff00;
    font-size: 0.8rem;
    z-index: 2;
    text-shadow: 0 0 2px #000;
  }
  
  .rec-badge {
    color: #ff0000;
    animation: blink 1s infinite;
  }
  
  .feed-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00aa00;
    font-family: 'Courier New', monospace;
  }
  
  .state-large {
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 0 0 5px #00ff00;
    text-align: center;
  }
  
  .feed-offline {
    font-size: 1.5rem;
    color: #555;
    font-style: italic;
  }
  
  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(0, 255, 0, 0.1);
    animation: scan 3s linear infinite;
  }
}

.data-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  
  label { 
    width: 100px; 
    color: #888;
    flex-shrink: 0;
    &.danger-text { color: #ff4444; }
  }
  
  .progress-bar {
    flex: 1;
    height: 12px;
    background: #222;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    
    .fill {
      height: 100%;
      background: #00ff00;
      &.alert { background: #ffaa00; }
      &.danger { background: #ff0000; }
      transition: width 0.3s ease-in-out;
    }
    
    .value {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      color: #fff;
      text-shadow: 0 0 2px #000;
    }
  }
}

.action-panel {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  flex-shrink: 0;
  
  .action-btn {
    flex: 1;
    padding: 10px;
    background: #003300;
    color: #00ff00;
    border: 1px solid #006600;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) { background: #005500; }
    &:disabled { background: #222; color: #555; border-color: #333; cursor: not-allowed; }
    
    &.stealth {
      border-color: #aa00aa;
      color: #ffccff;
      background: #330033;
      &:hover:not(:disabled) { background: #550055; }
    }
  }
}

@keyframes blink { 50% { opacity: 0; } }
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
</style>