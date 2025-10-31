/**
 * MVU 数据加载 Composable
 * 封装 MVU 数据获取逻辑，实现重试机制
 */

import { storeToRefs } from 'pinia';
import { useApartmentStore } from '../stores/apartment';

export interface UseMVUDataReturn {
  /** 是否正在加载 */
  loading: Readonly<Ref<boolean>>;
  /** 错误信息 */
  error: Readonly<Ref<string | null>>;
  /** 是否有数据 */
  hasData: Readonly<Ref<boolean>>;
  /** 楼层列表 */
  floors: Readonly<Ref<any[]>>;
  /** 当前时间 */
  currentTime: Readonly<Ref<string>>;
  /** 公寓名称 */
  apartmentName: Readonly<Ref<string>>;
  /** 加载数据 */
  loadData: () => Promise<boolean>;
  /** 刷新数据 */
  refreshData: () => Promise<boolean>;
  /** 清空数据 */
  clearData: () => void;
  /** 重置错误 */
  resetError: () => void;
}

/**
 * MVU 数据加载 Hook
 * 
 * 使用 Pinia Store 管理数据状态
 * 
 * @example
 * ```ts
 * const { loading, error, hasData, floors, loadData, refreshData } = useMVUData();
 * 
 * // 加载数据
 * await loadData();
 * 
 * // 刷新数据
 * await refreshData();
 * ```
 */
export function useMVUData(): UseMVUDataReturn {
  const apartmentStore = useApartmentStore();

  // 从 store 获取响应式引用
  const { loading, error, hasData, floors, currentTime, apartmentName } = storeToRefs(apartmentStore);

  // 从 store 获取 actions
  const { loadData, refreshData, clearData, resetError } = apartmentStore;

  return {
    // 响应式状态
    loading: readonly(loading),
    error: readonly(error),
    hasData: readonly(hasData),
    floors: readonly(floors),
    currentTime: readonly(currentTime),
    apartmentName: readonly(apartmentName),

    // 方法
    loadData,
    refreshData,
    clearData,
    resetError,
  };
}

