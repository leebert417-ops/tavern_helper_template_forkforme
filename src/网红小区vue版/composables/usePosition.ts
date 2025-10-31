/**
 * 位置保存/恢复 Composable
 * 从 localStorage 读取和保存元素位置
 */

import { ref, watch, type Ref } from 'vue';
import type { Position, SavedPosition } from '../types';
import { STORAGE_KEYS } from '../types';

export interface UsePositionOptions {
  /** 位置键名（用于区分不同元素） */
  key: 'button' | 'panel';
  /** 默认位置 */
  defaultPosition?: Position;
  /** 是否自动保存（监听位置变化） */
  autoSave?: boolean;
  /** 是否验证位置在视口内 */
  validateInViewport?: boolean;
}

export interface UsePositionReturn {
  /** 当前位置 */
  position: Ref<Position>;
  /** 保存位置 */
  savePosition: (pos?: Position) => void;
  /** 恢复位置 */
  restorePosition: () => Position;
  /** 重置为默认位置 */
  resetPosition: () => void;
  /** 清除保存的位置 */
  clearSavedPosition: () => void;
}

/**
 * 位置保存/恢复 Hook
 * 
 * @example
 * ```ts
 * const { position, savePosition, restorePosition } = usePosition({
 *   key: 'button',
 *   defaultPosition: { left: 20, top: 100 },
 *   autoSave: true,
 * });
 * 
 * // 恢复保存的位置
 * const savedPos = restorePosition();
 * 
 * // 手动保存位置
 * savePosition({ left: 100, top: 200 });
 * ```
 */
export function usePosition(options: UsePositionOptions): UsePositionReturn {
  const {
    key,
    defaultPosition = { left: 0, top: 0 },
    autoSave = false,
    validateInViewport = true,
  } = options;

  const position = ref<Position>({ ...defaultPosition });

  /**
   * 验证位置是否在视口内
   */
  const validatePosition = (pos: Position): Position => {
    if (!validateInViewport) return pos;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 假设元素最大尺寸为 100x100（可以根据实际情况调整）
    const elementSize = 100;
    const maxX = viewportWidth - elementSize;
    const maxY = viewportHeight - elementSize;

    return {
      left: Math.max(0, Math.min(pos.left, maxX)),
      top: Math.max(0, Math.min(pos.top, maxY)),
    };
  };

  /**
   * 从 localStorage 读取所有位置
   */
  const loadAllPositions = (): SavedPosition => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POSITION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ 读取位置失败:', error);
    }
    return {};
  };

  /**
   * 保存所有位置到 localStorage
   */
  const saveAllPositions = (positions: SavedPosition): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSITION, JSON.stringify(positions));
    } catch (error) {
      console.error('❌ 保存位置失败:', error);
    }
  };

  /**
   * 保存位置
   */
  const savePosition = (pos?: Position): void => {
    const posToSave = pos || position.value;
    const validatedPos = validatePosition(posToSave);

    // 读取所有位置
    const allPositions = loadAllPositions();

    // 更新当前键的位置
    allPositions[key] = validatedPos;

    // 保存所有位置
    saveAllPositions(allPositions);

    // 更新当前位置
    position.value = validatedPos;

    console.log(`💾 ${key} 位置已保存:`, validatedPos);
  };

  /**
   * 恢复位置
   */
  const restorePosition = (): Position => {
    const allPositions = loadAllPositions();
    const savedPos = allPositions[key];

    if (savedPos) {
      const validatedPos = validatePosition(savedPos);
      position.value = validatedPos;
      console.log(`📂 ${key} 位置已恢复:`, validatedPos);
      return validatedPos;
    } else {
      position.value = { ...defaultPosition };
      console.log(`ℹ️ ${key} 未找到保存的位置，使用默认值:`, defaultPosition);
      return defaultPosition;
    }
  };

  /**
   * 重置为默认位置
   */
  const resetPosition = (): void => {
    position.value = { ...defaultPosition };
    savePosition(defaultPosition);
    console.log(`🔄 ${key} 位置已重置为默认值:`, defaultPosition);
  };

  /**
   * 清除保存的位置
   */
  const clearSavedPosition = (): void => {
    const allPositions = loadAllPositions();
    delete allPositions[key];
    saveAllPositions(allPositions);
    console.log(`🗑️ ${key} 保存的位置已清除`);
  };

  // 自动保存（监听位置变化）
  if (autoSave) {
    watch(
      position,
      (newPos) => {
        savePosition(newPos);
      },
      { deep: true }
    );
  }

  return {
    position,
    savePosition,
    restorePosition,
    resetPosition,
    clearSavedPosition,
  };
}

