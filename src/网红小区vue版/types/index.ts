/**
 * 网红小区 Vue 版 - TypeScript 类型定义
 */

// ==================== 基础类型 ====================

/**
 * 任意对象类型
 */
export type AnyObject = Record<string, any>;

/**
 * MVU 数组格式（MVU 框架特有的数据格式）
 */
export type MVUArray<T = any> = [T] | T;

// ==================== 拖动相关类型 ====================

/**
 * 拖动数据
 */
export interface DragData {
  /** 拖动开始时的鼠标 X 坐标 */
  startX: number;
  /** 拖动开始时的鼠标 Y 坐标 */
  startY: number;
  /** 元素初始 left 值 */
  initialLeft: number;
  /** 元素初始 top 值 */
  initialTop: number;
  /** 是否正在拖动 */
  isDragging?: boolean;
  /** 拖动开始时间戳（用于区分点击和拖动） */
  startTime?: number;
}

/**
 * 位置数据
 */
export interface Position {
  /** 左边距（px） */
  left: number;
  /** 上边距（px） */
  top: number;
}

/**
 * 保存的位置数据（localStorage）
 */
export interface SavedPosition {
  /** 按钮位置 */
  button?: Position;
  /** 面板位置 */
  panel?: Position;
}

// ==================== MVU 数据类型 ====================

/**
 * 租客信息
 */
export interface Tenant {
  /** 租客名称 */
  name: MVUArray<string>;
  /** 好感度 */
  affection?: MVUArray<number>;
  /** 性欲值 */
  lust?: MVUArray<number>;
  /** 租客特征/描述 */
  description?: MVUArray<string>;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 房间信息
 */
export interface Room {
  /** 房间号（如 "101", "102"） */
  number: MVUArray<string>;
  /** 房间类型（"空房间", "标准套间", "功能性房间"） */
  type: MVUArray<string>;
  /** 房间名称（功能性房间有自定义名称） */
  name?: MVUArray<string>;
  /** 房间作用（功能性房间的描述） */
  purpose?: MVUArray<string>;
  /** 租客信息（如果有租客） */
  tenant?: Tenant;
  /** 是否为合并房间 */
  isMerged?: boolean;
  /** 合并房间的跨度（占用几个房间位置） */
  mergedSpan?: number;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 楼层信息
 */
export interface Floor {
  /** 楼层名称（如 "1楼", "2楼"） */
  name: MVUArray<string>;
  /** 楼层编号 */
  level: MVUArray<number>;
  /** 房间列表 */
  rooms: Room[];
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 公寓数据（MVU stat_data）
 */
export interface ApartmentData {
  /** 楼层列表 */
  floors?: Floor[];
  /** 当前时间 */
  current_time?: MVUArray<string>;
  /** 公寓名称 */
  apartment_name?: MVUArray<string>;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * MVU 获取数据的结果
 */
export interface MVUResult {
  /** 统计数据 */
  stat_data?: ApartmentData;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * MVU 获取数据的参数
 */
export interface MVUGetDataParams {
  /** 数据类型 */
  type: 'message' | string;
  /** 消息 ID */
  message_id: 'latest' | number | string;
}

// ==================== UI 状态类型 ====================

/**
 * 模态框类型
 */
export type ModalType =
  | 'room' // 房间详情
  | 'recruitment' // 招募租客
  | 'renovate' // 装修选择
  | 'functional-input' // 功能性房间输入
  | null;

/**
 * UI 状态
 */
export interface UIState {
  /** 面板是否可见 */
  isPanelVisible: boolean;
  /** 当前打开的模态框 */
  activeModal: ModalType;
  /** 当前选中的房间 */
  currentRoom: Room | null;
  /** 当前正在装修的房间号 */
  currentRenovatingRoom: string;
  /** 当前待拆除的房间号 */
  currentRoomForDemolish: string;
}

// ==================== 设置类型 ====================

/**
 * 插件设置
 */
export interface PluginSettings {
  /** 是否启用自动刷新 */
  autoRefreshEnabled: boolean;
  /** 自动刷新间隔（毫秒） */
  refreshInterval: number;
}

// ==================== 常量 ====================

/**
 * 房间类型常量
 */
export const ROOM_TYPES = {
  EMPTY: '空房间',
  STANDARD: '标准套间',
  FUNCTIONAL: '功能性房间',
} as const;

/**
 * 房间类型
 */
export type RoomType = (typeof ROOM_TYPES)[keyof typeof ROOM_TYPES];

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  autoRefreshEnabled: false,
  refreshInterval: 30000, // 30 秒
};

/**
 * 重试配置
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 400, // 毫秒
} as const;

/**
 * LocalStorage 键名
 */
export const STORAGE_KEYS = {
  POSITION: 'ngq-plugin-position',
  SETTINGS: 'ngq-plugin-settings',
} as const;

// ==================== 全局类型声明 ====================

/**
 * 全局 MVU 对象
 */
declare global {
  interface Window {
    Mvu?: {
      getMvuData: (params: MVUGetDataParams) => MVUResult | undefined;
    };
  }

  /**
   * MVU 全局变量
   */
  const Mvu: {
    getMvuData: (params: MVUGetDataParams) => MVUResult | undefined;
  };
}

// ==================== 工具类型 ====================

/**
 * 解包 MVU 数组类型
 */
export type UnwrapMVU<T> = T extends MVUArray<infer U> ? U : T;

/**
 * 深度解包 MVU 数组类型
 */
export type DeepUnwrapMVU<T> =
  T extends MVUArray<infer U> ? U : T extends object ? { [K in keyof T]: DeepUnwrapMVU<T[K]> } : T;
