/**
 * 公寓数据 Store
 * 管理 MVU 数据、楼层、房间、租客信息
 */

import { defineStore } from 'pinia';
import type { ApartmentData, Floor, Room, MVUGetDataParams, MVUResult } from '../types';
import { RETRY_CONFIG } from '../types';
import { getMVUInstance, unwrapMVUString } from '../utils/mvuHelper';

interface ApartmentState {
  /** MVU 原始数据 */
  rawData: ApartmentData | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前重试次数 */
  retryCount: number;
  /** 最后更新时间 */
  lastUpdateTime: number | null;
}

export const useApartmentStore = defineStore('apartment', {
  // ==================== State ====================
  state: (): ApartmentState => ({
    rawData: null,
    loading: false,
    error: null,
    retryCount: 0,
    lastUpdateTime: null,
  }),

  // ==================== Getters ====================
  getters: {
    /**
     * 是否有数据
     */
    hasData: (state): boolean => {
      return state.rawData !== null && state.rawData !== undefined;
    },

    /**
     * 楼层列表
     */
    floors: (state): Floor[] => {
      if (!state.rawData?.floors) return [];
      return state.rawData.floors;
    },

    /**
     * 楼层数量
     */
    floorCount(): number {
      return this.floors.length;
    },

    /**
     * 所有房间列表（扁平化）
     */
    allRooms(): Room[] {
      const rooms: Room[] = [];
      this.floors.forEach(floor => {
        if (floor.rooms && Array.isArray(floor.rooms)) {
          rooms.push(...floor.rooms);
        }
      });
      return rooms;
    },

    /**
     * 房间总数
     */
    roomCount(): number {
      return this.allRooms.length;
    },

    /**
     * 已出租房间数量
     */
    rentedRoomCount(): number {
      return this.allRooms.filter(room => {
        const type = unwrapMVUString(room.type);
        return type === '标准套间' && room.tenant;
      }).length;
    },

    /**
     * 空房间数量
     */
    emptyRoomCount(): number {
      return this.allRooms.filter(room => {
        const type = unwrapMVUString(room.type);
        return type === '空房间';
      }).length;
    },

    /**
     * 功能性房间数量
     */
    functionalRoomCount(): number {
      return this.allRooms.filter(room => {
        const type = unwrapMVUString(room.type);
        return type === '功能性房间';
      }).length;
    },

    /**
     * 当前时间
     */
    currentTime: (state): string => {
      if (!state.rawData?.current_time) return '';
      return unwrapMVUString(state.rawData.current_time);
    },

    /**
     * 公寓名称
     */
    apartmentName: (state): string => {
      if (!state.rawData?.apartment_name) return '网红小区';
      return unwrapMVUString(state.rawData.apartment_name, '网红小区');
    },

    /**
     * 根据房间号查找房间
     */
    getRoomByNumber: (state) => {
      return (roomNumber: string): Room | undefined => {
        for (const floor of state.rawData?.floors || []) {
          if (!floor.rooms) continue;
          const room = floor.rooms.find(r => unwrapMVUString(r.number) === roomNumber);
          if (room) return room;
        }
        return undefined;
      };
    },

    /**
     * 根据楼层编号查找楼层
     */
    getFloorByLevel: (state) => {
      return (level: number): Floor | undefined => {
        return state.rawData?.floors?.find(f => {
          const floorLevel = Array.isArray(f.level) ? f.level[0] : f.level;
          return floorLevel === level;
        });
      };
    },

    /**
     * 是否可以重试
     */
    canRetry: (state): boolean => {
      return state.retryCount < RETRY_CONFIG.MAX_RETRIES;
    },
  },

  // ==================== Actions ====================
  actions: {
    /**
     * 加载 MVU 数据
     */
    async loadData(): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        // 检查 MVU 是否可用
        const mvu = getMVUInstance();
        if (!mvu) {
          throw new Error('MVU 框架未加载或无法访问');
        }

        // 获取最新消息的 MVU 数据
        const params: MVUGetDataParams = {
          type: 'message',
          message_id: 'latest',
        };

        const mvuResult: MVUResult | undefined = mvu.getMvuData(params);
        const data = mvuResult?.stat_data;

        if (!data) {
          throw new Error('MVU 数据为空');
        }

        // 保存数据
        this.rawData = data;
        this.lastUpdateTime = Date.now();
        this.retryCount = 0;
        this.loading = false;

        console.log('✅ 公寓数据加载成功', data);
        return true;
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        this.loading = false;

        console.error('❌ 加载公寓数据失败:', errorMessage);

        // 如果可以重试，则自动重试
        if (this.canRetry) {
          this.retryCount++;
          console.log(`🔄 第 ${this.retryCount}/${RETRY_CONFIG.MAX_RETRIES} 次重试...`);
          
          await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY));
          return this.loadData();
        }

        return false;
      }
    },

    /**
     * 刷新数据
     */
    async refreshData(): Promise<boolean> {
      console.log('🔄 刷新公寓数据...');
      this.retryCount = 0; // 重置重试计数
      return this.loadData();
    },

    /**
     * 清空数据
     */
    clearData(): void {
      this.rawData = null;
      this.error = null;
      this.retryCount = 0;
      this.lastUpdateTime = null;
      console.log('🗑️ 公寓数据已清空');
    },

    /**
     * 重置错误状态
     */
    resetError(): void {
      this.error = null;
      this.retryCount = 0;
    },

    /**
     * 手动设置数据（用于测试）
     */
    setData(data: ApartmentData): void {
      this.rawData = data;
      this.lastUpdateTime = Date.now();
      this.error = null;
      this.retryCount = 0;
    },
  },
});

