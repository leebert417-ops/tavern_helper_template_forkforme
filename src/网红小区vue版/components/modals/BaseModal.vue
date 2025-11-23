<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="ngq-modal-overlay" @click.self="close">
        <div class="ngq-modal-content" :style="{ maxWidth: maxWidth }">
          <h2 v-if="title" class="ngq-modal-title">{{ title }}</h2>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '420px'
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

// 监听 ESC 键
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
  }
});

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close();
  }
};

</script>
