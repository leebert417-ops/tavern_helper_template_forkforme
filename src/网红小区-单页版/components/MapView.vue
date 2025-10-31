<template>
  <div class="map-view apt-card">
    <div class="apt-card-title">
      <span>🏢</span>
      <span>公寓地图</span>
      <span class="subtitle">点击房间查看详情</span>
    </div>
    <div class="apt-card-body custom-scrollbar">
      <!-- 按楼层倒序显示（三楼在最上面） -->
      <div v-for="(floorConfig, floorKey) in sortedFloors" :key="floorKey" class="floor-level">
        <div class="floor-title">
          {{ floorConfig.显示名称 }}
        </div>
        <div class="floor-grid">
          <!-- 遍历处理后的房间列表（合并了公共区域） -->
          <div
            v-for="roomGroup in getFloorRoomGroups(floorKey)"
            :key="roomGroup.id"
            :class="['room-card', getRoomClass(roomGroup), { 'double-width': roomGroup.isMerged }]"
            @click="onRoomClick(roomGroup)"
          >
            <!-- 左侧：房间基础信息 -->
            <div class="room-info">
              <div class="room-id">{{ getRoomIdDisplay(roomGroup) }}</div>
              <div class="room-name">{{ roomGroup.类型 }}</div>
            </div>

            <!-- 右侧：当前在这里的人 -->
            <div class="room-occupants">
              <div v-if="getRoomGroupOccupants(roomGroup).length > 2" class="occupants-summary">
                <span class="summary-icon">👥</span>
                <span class="summary-text">{{ getRoomGroupOccupants(roomGroup).length }}人</span>
              </div>
              <div v-else-if="getRoomGroupOccupants(roomGroup).length > 0" class="occupants-list">
                <div v-for="person in getRoomGroupOccupants(roomGroup)" :key="person.name" class="person-indicator">
                  <span class="person-icon">{{ person.icon }}</span>
                  <span class="person-name">{{ person.name }}</span>
                </div>
              </div>
              <div v-else class="empty-indicator">空</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间详情弹窗 -->
    <RoomDetailModal ref="roomDetailModal" />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useGameStore } from '../gameStore';
import RoomDetailModal from './RoomDetailModal.vue';

const store = useGameStore();
const roomDetailModal = ref<InstanceType<typeof RoomDetailModal> | null>(null);

// 房间组接口
interface RoomGroup {
  id: string;
  displayName: string;
  类型: string;
  住户?: string;
  功能区?: string;
  roomIds: string[]; // 包含的房间ID列表（合并房间会有多个）
  isMerged: boolean; // 是否是合并的房间
}

// 按顺序（从高到低）排序楼层
const sortedFloors = computed(() => {
  const floors = store.apartments.楼层配置;
  return _.orderBy(
    Object.entries(floors).map(([key, value]) => ({ key, ...value })),
    ['顺序'],
    ['desc'],
  ).reduce(
    (acc, floor) => {
      acc[floor.key] = floor;
      return acc;
    },
    {} as Record<string, any>,
  );
});

// 获取指定楼层的房间组（合并公共区域）
function getFloorRoomGroups(floorKey: string): RoomGroup[] {
  const rooms = store.apartments.房间列表;
  const floorRooms = _.pickBy(rooms, room => room.布局?.楼层 === floorKey);

  const roomGroups: RoomGroup[] = [];
  const processedRoomIds = new Set<string>();

  // 按房间ID排序
  const sortedRoomIds = Object.keys(floorRooms).sort();

  for (const roomId of sortedRoomIds) {
    if (processedRoomIds.has(roomId)) continue;

    const room = floorRooms[roomId];
    const roomType = room.类型;

    // 检查是否需要合并
    if (roomType === '公共客厅' && floorKey === '一楼') {
      // 合并101和102
      const relatedRooms = ['101', '102'].filter(id => floorRooms[id]);
      relatedRooms.forEach(id => processedRoomIds.add(id));

      roomGroups.push({
        id: 'lounge-merged',
        displayName: '公共客厅',
        类型: '公共客厅',
        功能区: '会客区、用餐区、休息区、娱乐区',
        roomIds: relatedRooms,
        isMerged: true,
      });
    } else if (roomType === '健身房' && floorKey === '一楼') {
      // 合并103和104
      const relatedRooms = ['103', '104'].filter(id => floorRooms[id]);
      relatedRooms.forEach(id => processedRoomIds.add(id));

      roomGroups.push({
        id: 'gym-merged',
        displayName: '健身房',
        类型: '健身房',
        功能区: '健身设备区、瑜伽区、舞蹈区',
        roomIds: relatedRooms,
        isMerged: true,
      });
    } else {
      // 普通房间，不合并
      processedRoomIds.add(roomId);
      roomGroups.push({
        id: roomId,
        displayName: roomId,
        类型: roomType,
        住户: room.住户,
        功能区: room.功能区,
        roomIds: [roomId],
        isMerged: false,
      });
    }
  }

  return roomGroups;
}

// 获取房间组的样式类
function getRoomClass(roomGroup: RoomGroup) {
  const type = roomGroup.类型;
  if (type === '套间') {
    return roomGroup.住户 === '未知' ? 'bedroom vacant' : 'bedroom';
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

// 获取房间组中的所有人（包括玩家和租客）
function getRoomGroupOccupants(roomGroup: RoomGroup) {
  const occupants: Array<{ name: string; icon: string }> = [];

  // 遍历房间组包含的所有房间ID
  for (const roomId of roomGroup.roomIds) {
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
  }

  // 去重（如果有重复）
  return _.uniqBy(occupants, 'name');
}

// 获取房间ID显示
function getRoomIdDisplay(roomGroup: RoomGroup): string {
  if (roomGroup.isMerged) {
    return roomGroup.roomIds.join('-');
  }
  return roomGroup.roomIds[0];
}

// 房间点击事件 - 打开详情弹窗
function onRoomClick(roomGroup: RoomGroup) {
  console.log('点击房间组:', roomGroup);
  roomDetailModal.value?.openModal(roomGroup);
}
</script>

<style lang="scss" scoped>
.map-view {
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
  padding: 10px;
  min-height: 100px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: 8px;
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

  // 合并房间占据两格宽度
  &.double-width {
    grid-column: span 2;
  }

  // 左侧：房间基础信息
  .room-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    text-align: left;
    min-width: 0; // 允许文字截断
  }

  .room-id {
    font-weight: 700;
    font-size: 1.1em;
    color: var(--apt-text);
    opacity: 0.9;
  }

  .room-name {
    font-weight: 600;
    font-size: 0.95em;
    color: var(--apt-text-secondary);
  }

  // 右侧：当前在这里的人
  .room-occupants {
    flex-shrink: 0;
    width: 80px; // 从 60px 增加到 80px，确保能显示四字人名
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    padding-left: 8px;
  }

  .occupants-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 4px;
    background: rgba(255, 107, 157, 0.2);
    border-radius: 6px;
    text-align: center;
    width: 100%;
  }

  .summary-icon {
    font-size: 1.5em;
  }

  .summary-text {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--apt-text);
  }

  .occupants-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .person-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8em; // 从 0.75em 增加到 0.8em
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 5px; // 从 2px 4px 增加到 3px 5px
    border-radius: 4px;
    white-space: nowrap;
  }

  .person-icon {
    flex-shrink: 0;
    font-size: 1.2em;
  }

  .person-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-indicator {
    font-size: 0.75em;
    color: var(--apt-text-secondary);
    opacity: 0.5;
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
</style>
