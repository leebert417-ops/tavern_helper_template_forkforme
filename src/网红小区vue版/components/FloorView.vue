<template>
  <div class="ngq-floor-level">
    <div class="ngq-floor-level-title">🏢 {{ floor.name }}</div>
    <div v-if="processedRooms.length > 0" class="ngq-floor-grid">
      <RoomCard v-for="room in processedRooms" :key="room.name" :room="room" />
    </div>
    <div v-else class="ngq-empty" style="padding: 20px;">
      <div class="ngq-empty-text">该楼层暂无房间</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useApartmentStore } from '../stores';
import type { Floor, Room } from '../types';
import RoomCard from './RoomCard.vue';

const props = defineProps({
  floor: {
    type: Object as PropType<Floor>,
    required: true,
  },
});

const apartmentStore = useApartmentStore();

/**
 * 对当前楼层的房间进行过滤、排序和合并处理
 */
const processedRooms = computed(() => {
  // 1. 过滤出当前楼层的房间
  const floorRooms = apartmentStore.getRoomsByFloor(props.floor.name);

  // 2. 按单元号排序：A/B/C/D区（01/02/03/04）
  floorRooms.sort((a, b) => {
    const getOrder = (pos: string) => {
      if (pos.includes('A区') || pos.includes('01')) return 1;
      if (pos.includes('B区') || pos.includes('02')) return 2;
      if (pos.includes('C区') || pos.includes('03')) return 3;
      if (pos.includes('D区') || pos.includes('04')) return 4;
      return 0;
    };
    const orderDiff = getOrder(a.position) - getOrder(b.position);
    return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name);
  });

  // 3. 合并相邻的同类型公共设施
  const mergedRooms: Room[] = [];
  const skipIndices = new Set<number>();

  for (let i = 0; i < floorRooms.length; i++) {
    if (skipIndices.has(i)) continue;

    const currentRoom = floorRooms[i];
    const isPublic = ['公共客厅', '健身房'].includes(currentRoom.type);

    // 检查下一个房间是否是相同类型的公共设施
    if (isPublic && i + 1 < floorRooms.length) {
      const nextRoom = floorRooms[i + 1];
      if (nextRoom.type === currentRoom.type) {
        // 合并两个房间
        mergedRooms.push({
          ...currentRoom,
          name: `${currentRoom.name}-${nextRoom.name}`,
          isMerged: true,
        });
        skipIndices.add(i + 1);
        continue;
      }
    }

    // 不合并，单独显示
    mergedRooms.push(currentRoom);
  }

  return mergedRooms;
});

</script>
