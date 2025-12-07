<template>
  <div class="peep-terminal">
    <!-- Header -->
    <header class="terminal-header">
      <div class="status-indicator">🔴 LIVE</div>
      <div class="time-display">{{ gameState.world.time }} {{ gameState.world.weekday }}</div>
      <div class="resource-display">
        <span>💰 {{ gameState.player.money }}</span>
        <span>⚡ {{ gameState.player.energy }}</span>
      </div>
    </header>
    
    <!-- Tenant List -->
    <div class="tenant-list">
       <div class="list-header">
         <span>ROOM</span>
         <span>TARGET</span>
         <span>STATUS</span>
       </div>
       
       <div class="list-body">
         <template v-for="(tenant, charId) in gameState.tenants" :key="charId">
           <div class="tenant-row" 
                v-if="charId !== '$meta' && tenant.name"
                @click="openMonitor(tenant)"
                :class="{ 'offline': !tenant.is_home }"
           >
             <span class="cell-room">{{ tenant.room }}</span>
             <span class="cell-name">{{ tenant.name }}</span>
             <span class="cell-status">
               <span class="dot" :class="{ 'online': tenant.is_home }">●</span>
               {{ tenant.is_home ? tenant.state : 'OFFLINE' }}
             </span>
             <span class="cell-risk" v-if="tenant.is_home">
                <!-- 简单的警惕度指示器 -->
                <span class="risk-bar" :style="{ width: (tenant.params.alertness / 2) + 'px', background: tenant.params.alertness > 50 ? 'red' : 'orange' }"></span>
             </span>
           </div>
         </template>
       </div>
    </div>

    <!-- Footer Hint -->
    <div class="terminal-footer">
      >> 选择目标查看详细监控
    </div>

    <!-- Modal -->
    <MonitorModal 
      v-if="selectedTenant" 
      :tenant="selectedTenant" 
      @close="selectedTenant = null" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from './store';
import { storeToRefs } from 'pinia';
import MonitorModal from './MonitorModal.vue';

const store = useGameStore();
const { gameState } = storeToRefs(store);

const selectedTenant = ref<any>(null);

const openMonitor = (tenant: any) => {
  selectedTenant.value = tenant;
};
</script>

<style lang="scss" scoped>
.peep-terminal {
  background-color: #0a0a0a;
  color: #00ff00;
  font-family: 'Consolas', monospace;
  border: 2px solid #333;
  border-radius: 5px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 400px; // 固定一个高度，方便滚动
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.status-indicator { color: #ff0000; font-weight: bold; }

.tenant-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #222;
}

.list-header {
  display: grid;
  grid-template-columns: 60px 100px 1fr 40px;
  background: #111;
  padding: 5px 10px;
  font-weight: bold;
  font-size: 0.8rem;
  color: #666;
  border-bottom: 1px solid #333;
}

.list-body {
  flex: 1;
  overflow-y: auto;
}

.tenant-row {
  display: grid;
  grid-template-columns: 60px 100px 1fr 40px;
  padding: 8px 10px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.1s;
  align-items: center;
  
  &:hover { background: #002200; color: #fff; }
  
  &.offline { 
    color: #444; 
    &:hover { background: #111; }
  }
  
  .cell-status {
    font-size: 0.8rem;
    text-transform: uppercase;
  }
  
  .dot {
    color: #333;
    &.online { color: #f00; }
    margin-right: 3px;
  }
}

.terminal-footer {
  margin-top: 8px;
  font-size: 0.7rem;
  color: #555;
  text-align: right;
}
</style>