<template>
  <div class="ngq-room-card" :class="roomClasses" @click="onCardClick">
    <div class="ngq-room-name">{{ roomIcon }} {{ room.name }}</div>
    <div class="ngq-room-occupant">{{ occupantText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useUIStore } from '../stores';
import type { Room } from '../types';

const props = defineProps({
  room: {
    type: Object as PropType<Room>,
    required: true,
  },
});

const uiStore = useUIStore();

const isYourRoom = computed(() => props.room.type === '您的房间');
const isEmptyRoom = computed(() => props.room.type === '空房间');
const isSuite = computed(() => props.room.type === '套间');
const isPublicLounge = computed(() => props.room.type === '公共客厅');
const isPublicGym = computed(() => props.room.type === '健身房');
const isPublicLaundry = computed(() => props.room.type === '洗衣间');
const isDefaultPublic = computed(() => isPublicLounge.value || isPublicGym.value || isPublicLaundry.value);
const isCustomFunctional = computed(() => !isSuite.value && !isYourRoom.value && !isEmptyRoom.value && !isDefaultPublic.value);
const isVacant = computed(() => props.room.tenant === '未知' && isSuite.value);

const roomClasses = computed(() => ({
  'your': isYourRoom.value,
  'empty': isEmptyRoom.value,
  'public-lounge': isPublicLounge.value,
  'public-gym': isPublicGym.value,
  'public-laundry': isPublicLaundry.value,
  'custom-functional': isCustomFunctional.value,
  'bedroom vacant': isVacant.value,
  'bedroom': !isVacant.value && isSuite.value,
  'merged': props.room.isMerged,
}));

const roomIcon = computed(() => {
  if (isYourRoom.value) return '👑';
  if (isEmptyRoom.value) return '🔧';
  if (isPublicLounge.value) return '🛋️';
  if (isPublicGym.value) return '💪';
  if (isPublicLaundry.value) return '🧺';
  if (isCustomFunctional.value) return '🏢';
  return '🏠';
});

const occupantText = computed(() => {
  if (isYourRoom.value) return '🔑 房东自住';
  if (isEmptyRoom.value) return '🔨 未装修';
  if (isDefaultPublic.value) return `✨ ${props.room.type}`;
  if (isCustomFunctional.value) return `🎨 ${props.room.type}`;
  if (props.room.tenant && props.room.tenant !== '未知') {
    const tenantDisplay = props.room.tenant === '<user>' ? '房东' : props.room.tenant;
    return `👤 ${tenantDisplay}`;
  }
  return '🏷️ 待出租';
});

const onCardClick = () => {
  if (isEmptyRoom.value) {
    uiStore.openModal('renovate', { roomId: props.room.name });
  } else {
    uiStore.openModal('room', { roomId: props.room.name });
  }
};

</script>
