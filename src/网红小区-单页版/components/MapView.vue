<template>
  <div class="map-view apt-card">
    <div class="apt-card-title">
      <span>🏢</span>
      <span>公寓地图</span>
    </div>
    <div class="apt-card-body custom-scrollbar">
      <!-- 按楼层倒序显示（三楼在最上面） -->
      <div
        v-for="(floorConfig, floorKey) in sortedFloors"
        :key="floorKey"
        class="floor-level"
      >
        <div class="floor-title">
          {{ floorConfig.显示名称 }}
        </div>
        <div class="floor-grid">
          <div
            v-for="(room, roomId) in getFloorRooms(floorKey)"
            :key="roomId"
            :class="['room-card', getRoomClass(room)]"
            @click="onRoomClick(roomId, room)"
          >
            <div class="room-name">{{ roomId }}</div>
            <div class="room-type">{{ room.类型 }}</div>
            <div v-if="room.住户" class="room-occupant">{{ room.住户 }}</div>

            <!-- 显示当前在房间里的角色 -->
            <div v-if="getRoomOccupants(roomId).length > 0" class="room-people">
              <div v-for="person in getRoomOccupants(roomId)" :key="person.name" class="person-indicator">
                {{ person.icon }} {{ person.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../gameStore';
import _ from 'lodash';

const store = useGameStore();

// 按顺序（从高到低）排序楼层
const sortedFloors = computed(() => {
  const floors = store.apartments.楼层配置;
  return _.orderBy(
    Object.entries(floors).map(([key, value]) => ({ key, ...value })),
    ['顺序'],
    ['desc']
  ).reduce((acc, floor) => {
    acc[floor.key] = floor;
    return acc;
  }, {} as Record<string, any>);
});

// 获取指定楼层的所有房间
function getFloorRooms(floorKey: string) {
  const rooms = store.apartments.房间列表;
  return _.pickBy(rooms, room => room.布局?.楼层 === floorKey);
}

// 获取房间的样式类
function getRoomClass(room: any) {
  const type = room.类型;
  if (type === '套间') {
    return room.住户 === '未知' ? 'bedroom vacant' : 'bedroom';
  } else if (type === '您的房间') {
    return 'your';
  } else if (type === '公共客厅') {
    return 'public-lounge';
  } else if (type === '健身房') {
    return 'public-gym';
  } else if (type === '洗衣间') {
    return 'public-laundry';
  } else if (type === '空房间') {
    return 'empty';
  }
  return 'custom-functional';
}

// 获取当前在房间里的所有人（包括玩家和租客）
function getRoomOccupants(roomId: string) {
  const occupants: Array<{ name: string; icon: string }> = [];

  // 检查玩家是否在此房间
  if (store.player.currentLocation === roomId) {
    occupants.push({ name: '你', icon: '👤' });
  }

  // 检查租客是否在此房间
  for (const [tenantName, tenant] of Object.entries(store.tenants)) {
    if (tenant.当前位置 === roomId) {
      occupants.push({ name: tenantName, icon: '👥' });
    }
  }

  return occupants;
}

// 房间点击事件
function onRoomClick(roomId: string, room: any) {
  console.log('点击房间:', roomId, room);
  // TODO: 可以添加更多交互，如显示房间详情、移动玩家等
}
</script>

<style lang="scss" scoped>
.map-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apt-card-body {
  flex: 1;
  overflow-y: auto;
}

.floor-level {
  background: var(--apt-card);
  border: 1px solid var(--apt-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.floor-title {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--apt-text);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '🏢';
  }
}

.floor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

.room-card {
  border-radius: 10px;
  padding: 12px 8px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-weight: 600;
  font-size: 0.85em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 157, 0.3);
    border-color: var(--apt-primary);
  }

  // 房间类型样式
  &.bedroom {
    background: var(--room-bedroom);
  }

  &.bedroom.vacant {
    background: var(--room-bedroom-vacant);
    border-color: rgba(255, 182, 193, 0.8);
  }

  &.empty {
    background: var(--room-empty);
    border-color: #5a5f6b;
    opacity: 0.7;
  }

  &.your {
    background: var(--room-player);
    border-color: #5dade2;
  }

  &.public-lounge {
    background: var(--room-lounge);
    border-color: #fbbf24;
  }

  &.public-gym {
    background: var(--room-gym);
    border-color: #34d399;
  }

  &.public-laundry {
    background: var(--room-laundry);
    border-color: #38bdf8;
  }

  &.custom-functional {
    background: var(--room-custom);
    border-color: rgba(52, 211, 153, 0.8);
  }
}

.room-name {
  font-weight: bold;
  font-size: 1em;
  margin-bottom: 4px;
}

.room-type {
  font-size: 0.75em;
  opacity: 0.9;
  margin-bottom: 2px;
}

.room-occupant {
  font-size: 0.7em;
  color: var(--apt-dim);
  margin-top: 2px;
}

.room-people {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.person-indicator {
  font-size: 0.7em;
  margin: 2px 0;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
