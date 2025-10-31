/**
 * 拖动功能 Composable
 * 提供通用的拖动逻辑，支持鼠标和触摸事件
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import type { Position } from '../types';

export interface UseDragOptions {
  /** 元素引用 */
  elementRef: Ref<HTMLElement | null>;
  /** 是否启用拖动 */
  enabled?: Ref<boolean> | boolean;
  /** 拖动手柄元素引用（如果不提供，则整个元素可拖动） */
  handleRef?: Ref<HTMLElement | null>;
  /** 是否限制在视口内 */
  constrainToViewport?: boolean;
  /** 边界偏移量（px） */
  boundaryOffset?: number;
  /** 点击阈值（px，移动距离小于此值视为点击） */
  clickThreshold?: number;
  /** 拖动开始回调 */
  onDragStart?: (position: Position) => void;
  /** 拖动中回调 */
  onDragMove?: (position: Position) => void;
  /** 拖动结束回调 */
  onDragEnd?: (position: Position, isClick: boolean) => void;
  /** 点击回调（仅当移动距离小于阈值时触发） */
  onClick?: () => void;
}

export interface UseDragReturn {
  /** 是否正在拖动 */
  isDragging: Ref<boolean>;
  /** 当前位置 */
  position: Ref<Position>;
  /** 手动设置位置 */
  setPosition: (pos: Position) => void;
  /** 重置位置 */
  resetPosition: () => void;
}

/**
 * 拖动功能 Hook
 */
export function useDrag(options: UseDragOptions): UseDragReturn {
  const {
    elementRef,
    enabled = true,
    handleRef,
    constrainToViewport = true,
    boundaryOffset = 0,
    clickThreshold = 5,
    onDragStart,
    onDragMove,
    onDragEnd,
    onClick,
  } = options;

  const isDragging = ref(false);
  const position = ref<Position>({ left: 0, top: 0 });

  let dragData: {
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
    startTime: number;
  } | null = null;

  /**
   * 获取是否启用
   */
  const isEnabled = (): boolean => {
    return typeof enabled === 'boolean' ? enabled : enabled.value;
  };

  /**
   * 获取当前位置
   */
  const getCurrentPosition = (): Position => {
    const element = elementRef.value;
    if (!element) return { left: 0, top: 0 };

    const computedStyle = window.getComputedStyle(element);
    const left = parseInt(computedStyle.left) || 0;
    const top = parseInt(computedStyle.top) || 0;

    return { left, top };
  };

  /**
   * 限制位置在视口内
   */
  const constrainPosition = (pos: Position): Position => {
    if (!constrainToViewport) return pos;

    const element = elementRef.value;
    if (!element) return pos;

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const maxX = viewportWidth - rect.width - boundaryOffset;
    const maxY = viewportHeight - rect.height - boundaryOffset;

    return {
      left: Math.max(boundaryOffset, Math.min(pos.left, maxX)),
      top: Math.max(boundaryOffset, Math.min(pos.top, maxY)),
    };
  };

  /**
   * 应用位置
   */
  const applyPosition = (pos: Position): void => {
    const element = elementRef.value;
    if (!element) return;

    const constrainedPos = constrainPosition(pos);
    element.style.left = `${constrainedPos.left}px`;
    element.style.top = `${constrainedPos.top}px`;
    position.value = constrainedPos;
  };

  /**
   * 拖动开始
   */
  const handleDragStart = (clientX: number, clientY: number): boolean => {
    if (!isEnabled() || dragData) return false;

    const currentPos = getCurrentPosition();

    dragData = {
      startX: clientX,
      startY: clientY,
      initialLeft: currentPos.left,
      initialTop: currentPos.top,
      startTime: Date.now(),
    };

    isDragging.value = true;
    onDragStart?.(currentPos);

    return true;
  };

  /**
   * 拖动移动
   */
  const handleDragMove = (clientX: number, clientY: number): void => {
    if (!dragData) return;

    const deltaX = clientX - dragData.startX;
    const deltaY = clientY - dragData.startY;

    const newPos: Position = {
      left: dragData.initialLeft + deltaX,
      top: dragData.initialTop + deltaY,
    };

    applyPosition(newPos);
    onDragMove?.(position.value);
  };

  /**
   * 拖动结束
   */
  const handleDragEnd = (clientX: number, clientY: number): void => {
    if (!dragData) return;

    isDragging.value = false;

    // 计算拖动距离
    const deltaX = clientX - dragData.startX;
    const deltaY = clientY - dragData.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 判断是否为点击
    const isClick = distance < clickThreshold;

    const currentPos = getCurrentPosition();
    onDragEnd?.(currentPos, isClick);

    if (isClick) {
      onClick?.();
    }

    dragData = null;
  };

  /**
   * 鼠标按下
   */
  const onMouseDown = (e: MouseEvent): void => {
    if (handleDragStart(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * 触摸开始
   */
  const onTouchStart = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (touch && handleDragStart(touch.clientX, touch.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * 鼠标移动
   */
  const onMouseMove = (e: MouseEvent): void => {
    handleDragMove(e.clientX, e.clientY);
    if (dragData) e.preventDefault();
  };

  /**
   * 触摸移动
   */
  const onTouchMove = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (touch) {
      handleDragMove(touch.clientX, touch.clientY);
      if (dragData) e.preventDefault();
    }
  };

  /**
   * 鼠标释放
   */
  const onMouseUp = (e: MouseEvent): void => {
    handleDragEnd(e.clientX, e.clientY);
  };

  /**
   * 触摸结束
   */
  const onTouchEnd = (e: TouchEvent): void => {
    const touch = e.changedTouches[0];
    if (touch) {
      handleDragEnd(touch.clientX, touch.clientY);
    } else {
      handleDragEnd(0, 0);
    }
  };

  /**
   * 手动设置位置
   */
  const setPosition = (pos: Position): void => {
    applyPosition(pos);
  };

  /**
   * 重置位置
   */
  const resetPosition = (): void => {
    setPosition({ left: 0, top: 0 });
  };

  /**
   * 绑定事件
   */
  const bindEvents = (): void => {
    const handle = handleRef?.value || elementRef.value;
    if (!handle) return;

    // 绑定拖动手柄事件
    handle.addEventListener('mousedown', onMouseDown);
    handle.addEventListener('touchstart', onTouchStart, { passive: false });

    // 绑定文档事件
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
  };

  /**
   * 解绑事件
   */
  const unbindEvents = (): void => {
    const handle = handleRef?.value || elementRef.value;
    if (handle) {
      handle.removeEventListener('mousedown', onMouseDown);
      handle.removeEventListener('touchstart', onTouchStart);
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchEnd);
  };

  // 生命周期
  onMounted(() => {
    bindEvents();
  });

  onUnmounted(() => {
    unbindEvents();
  });

  return {
    isDragging,
    position,
    setPosition,
    resetPosition,
  };
}

