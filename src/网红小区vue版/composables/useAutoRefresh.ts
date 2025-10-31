/**
 * 自动刷新 Composable
 * 实现定时刷新逻辑
 */

import { ref, watch, onUnmounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '../stores/settings';

export interface UseAutoRefreshOptions {
  /** 刷新回调函数 */
  onRefresh: () => void | Promise<void>;
  /** 是否立即开始（如果启用了自动刷新） */
  immediate?: boolean;
}

export interface UseAutoRefreshReturn {
  /** 是否启用自动刷新 */
  isEnabled: Readonly<Ref<boolean>>;
  /** 刷新间隔（毫秒） */
  interval: Readonly<Ref<number>>;
  /** 刷新间隔（格式化字符串） */
  formattedInterval: Readonly<Ref<string>>;
  /** 是否正在运行 */
  isRunning: Ref<boolean>;
  /** 启动自动刷新 */
  start: () => void;
  /** 停止自动刷新 */
  stop: () => void;
  /** 切换自动刷新 */
  toggle: () => void;
  /** 设置刷新间隔（毫秒） */
  setInterval: (ms: number) => void;
}

/**
 * 自动刷新 Hook
 * 
 * @example
 * ```ts
 * const { isEnabled, isRunning, start, stop, toggle } = useAutoRefresh({
 *   onRefresh: async () => {
 *     await loadData();
 *   },
 *   immediate: true,
 * });
 * 
 * // 启动自动刷新
 * start();
 * 
 * // 停止自动刷新
 * stop();
 * 
 * // 切换自动刷新
 * toggle();
 * ```
 */
export function useAutoRefresh(options: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const { onRefresh, immediate = false } = options;

  const settingsStore = useSettingsStore();
  const { autoRefreshEnabled, refreshInterval, formattedRefreshInterval } = storeToRefs(settingsStore);

  const isRunning = ref(false);
  let timerId: number | null = null;

  /**
   * 执行刷新
   */
  const executeRefresh = async (): Promise<void> => {
    try {
      await onRefresh();
      console.log('🔄 自动刷新完成');
    } catch (error) {
      console.error('❌ 自动刷新失败:', error);
    }
  };

  /**
   * 启动定时器
   */
  const startTimer = (): void => {
    if (timerId !== null) {
      stopTimer();
    }

    timerId = window.setInterval(() => {
      executeRefresh();
    }, refreshInterval.value);

    isRunning.value = true;
    console.log(`⏰ 自动刷新已启动，间隔: ${formattedRefreshInterval.value}`);
  };

  /**
   * 停止定时器
   */
  const stopTimer = (): void => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
    isRunning.value = false;
    console.log('⏸️ 自动刷新已停止');
  };

  /**
   * 启动自动刷新
   */
  const start = (): void => {
    if (!isRunning.value) {
      startTimer();
    }
  };

  /**
   * 停止自动刷新
   */
  const stop = (): void => {
    if (isRunning.value) {
      stopTimer();
    }
  };

  /**
   * 切换自动刷新
   */
  const toggle = (): void => {
    if (isRunning.value) {
      stop();
    } else {
      start();
    }
  };

  /**
   * 设置刷新间隔
   */
  const setInterval = (ms: number): void => {
    settingsStore.setRefreshInterval(ms);
    
    // 如果正在运行，重启定时器以应用新间隔
    if (isRunning.value) {
      stopTimer();
      startTimer();
    }
  };

  // 监听设置变化
  watch(autoRefreshEnabled, (enabled) => {
    if (enabled) {
      start();
    } else {
      stop();
    }
  });

  // 监听间隔变化
  watch(refreshInterval, () => {
    if (isRunning.value) {
      // 重启定时器以应用新间隔
      stopTimer();
      startTimer();
    }
  });

  // 立即启动（如果启用）
  if (immediate && autoRefreshEnabled.value) {
    start();
  }

  // 组件卸载时清理
  onUnmounted(() => {
    stop();
  });

  return {
    isEnabled: readonly(autoRefreshEnabled),
    interval: readonly(refreshInterval),
    formattedInterval: readonly(formattedRefreshInterval),
    isRunning,
    start,
    stop,
    toggle,
    setInterval,
  };
}

