// src/窥视者日常/store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { klona } from 'klona';

interface CharacterState {
  位置: string;
  状态: string;
  心情: string;
  好感度: number;
  警戒度: number;
  身体敏感度: number;
  意识值: number;
}

interface CameraState {
  安装位置: string;
  暴露度: number;
  摄像内容: string;
}

interface DeviceState {
  安装位置: string;
  状态: string;
  作用: string;
}

interface WarehouseItem {
  数量: number;
  作用: string;
}

export interface PeepGameData {
  世界: {
    日期: string;
    时间: string;
    星期: string;
    天气: string;
  };
  玩家: {
    位置: string;
  };
  角色: Record<string, CharacterState>;
  李强: {
    位置: string;
    警戒度: number;
  };
  摄像头: Record<string, CameraState>;
  设备: Record<string, DeviceState>;
  仓库: Record<string, WarehouseItem>;
}

const defaultState: PeepGameData = {
  世界: { 日期: '', 时间: '00:00', 星期: '', 天气: '' },
  玩家: { 位置: '' },
  角色: {},
  李强: { 位置: '', 警戒度: 0 },
  摄像头: {},
  设备: {},
  仓库: {},
};

export const useGameStore = defineStore('peepGame', () => {
  const gameState = ref<PeepGameData>(klona(defaultState));

  const refreshGameState = () => {
    try {
      let data: any = null;

      // @ts-ignore MVU 可能在全局或父窗口
      if (typeof Mvu !== 'undefined') {
        // @ts-ignore
        const mvuResult = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
        data = mvuResult?.stat_data;
      }
      // @ts-ignore
      else if (window.parent && typeof window.parent.Mvu !== 'undefined') {
        // @ts-ignore
        const mvuResult = window.parent.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
        data = mvuResult?.stat_data;
      } else {
        const globalVars = getVariables({ type: 'global' });
        data = globalVars?.stat_data;
      }

      if (data) {
        const merged: PeepGameData = {
          世界: { ...defaultState.世界, ...(data.世界 || {}) },
          玩家: { ...defaultState.玩家, ...(data.玩家 || {}) },
          角色: data.角色 || {},
          李强: { ...defaultState.李强, ...(data.李强 || {}) },
          摄像头: data.摄像头 || {},
          设备: data.设备 || {},
          仓库: data.仓库 || {},
        };

        gameState.value = klona(merged);
        console.info('[窥视者日常] 游戏状态已刷新');
      } else {
        console.warn('[窥视者日常] 未能获取到游戏数据(stat_data)');
      }
    } catch (error) {
      console.error('[窥视者日常] 刷新游戏状态时发生错误:', error);
    }
  };

  refreshGameState();

  return {
    gameState,
    refreshGameState,
  };
});
