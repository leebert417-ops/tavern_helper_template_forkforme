/**
 * MVU 数据处理工具函数
 */

import type { AnyObject, MVUArray } from '../types';

/**
 * 安全获取对象深层属性值
 * 
 * 支持：
 * 1. 点号路径访问（如 "user.profile.name"）
 * 2. 自动解包 MVU 数组格式
 * 3. 空值安全处理
 * 
 * @param obj - 源对象
 * @param path - 属性路径（用点号分隔）
 * @param defaultValue - 默认值
 * @returns 属性值或默认值
 * 
 * @example
 * ```ts
 * const data = { user: [{ name: ['张三'] }] };
 * safeGetValue(data, 'user.name'); // '张三'
 * safeGetValue(data, 'user.age', '未知'); // '未知'
 * ```
 */
export function safeGetValue(
  obj: AnyObject | undefined,
  path: string,
  defaultValue: string = ''
): string {
  if (!obj) return defaultValue;

  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue;
    }

    // 先解包 MVU 数组格式
    if (Array.isArray(current)) {
      current = current[0];
    }

    if (typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }

    current = current[key];
  }

  // 最后解包 MVU 数组格式
  if (Array.isArray(current)) {
    return current.length > 0 ? String(current[0] ?? defaultValue) : defaultValue;
  }

  if (current === undefined || current === null) {
    return defaultValue;
  }

  return String(current);
}

/**
 * 解包 MVU 数组格式
 * 
 * @param value - MVU 数组或普通值
 * @param defaultValue - 默认值
 * @returns 解包后的值
 * 
 * @example
 * ```ts
 * unwrapMVU(['张三']); // '张三'
 * unwrapMVU('李四'); // '李四'
 * unwrapMVU([], '未知'); // '未知'
 * ```
 */
export function unwrapMVU<T = any>(value: MVUArray<T> | undefined, defaultValue?: T): T | undefined {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : defaultValue;
  }

  return value;
}

/**
 * 解包 MVU 数组为字符串
 * 
 * @param value - MVU 数组或普通值
 * @param defaultValue - 默认值
 * @returns 字符串值
 */
export function unwrapMVUString(value: MVUArray<any> | undefined, defaultValue: string = ''): string {
  const unwrapped = unwrapMVU(value);
  if (unwrapped === undefined || unwrapped === null) {
    return defaultValue;
  }
  return String(unwrapped);
}

/**
 * 解包 MVU 数组为数字
 * 
 * @param value - MVU 数组或普通值
 * @param defaultValue - 默认值
 * @returns 数字值
 */
export function unwrapMVUNumber(value: MVUArray<any> | undefined, defaultValue: number = 0): number {
  const unwrapped = unwrapMVU(value);
  if (unwrapped === undefined || unwrapped === null) {
    return defaultValue;
  }
  const num = Number(unwrapped);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 检查 MVU 是否可用
 * 
 * @returns MVU 是否可用
 */
export function isMVUAvailable(): boolean {
  return typeof Mvu !== 'undefined' || (window.parent && typeof (window.parent as any).Mvu !== 'undefined');
}

/**
 * 获取 MVU 实例
 * 
 * @returns MVU 实例或 undefined
 */
export function getMVUInstance() {
  if (typeof Mvu !== 'undefined') {
    return Mvu;
  }

  if (window.parent && typeof (window.parent as any).Mvu !== 'undefined') {
    // 将父窗口的 MVU 引用到当前窗口
    (window as any).Mvu = (window.parent as any).Mvu;
    return (window as any).Mvu;
  }

  return undefined;
}

/**
 * 格式化好感度/性欲值显示
 * 
 * @param value - 数值
 * @param max - 最大值（默认 100）
 * @returns 格式化后的字符串
 * 
 * @example
 * ```ts
 * formatProgress(75); // '75/100'
 * formatProgress(50, 200); // '50/200'
 * ```
 */
export function formatProgress(value: number, max: number = 100): string {
  return `${value}/${max}`;
}

/**
 * 计算进度百分比
 * 
 * @param value - 当前值
 * @param max - 最大值
 * @returns 百分比（0-100）
 */
export function calculateProgress(value: number, max: number = 100): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

