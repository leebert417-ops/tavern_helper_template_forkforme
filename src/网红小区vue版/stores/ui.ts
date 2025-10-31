/**
 * UI 状态 Store
 * 管理面板显示、模态框状态、当前选中房间等 UI 相关状态
 */

import { defineStore } from 'pinia';
import type { Room, ModalType } from '../types';

interface UIState {
  /** 面板是否可见 */
  isPanelVisible: boolean;
  /** 当前打开的模态框类型 */
  activeModal: ModalType;
  /** 当前选中的房间 */
  currentRoom: Room | null;
  /** 当前正在装修的房间号 */
  currentRenovatingRoom: string;
  /** 当前待拆除的房间号 */
  currentRoomForDemolish: string;
}

export const useUIStore = defineStore('ui', {
  // ==================== State ====================
  state: (): UIState => ({
    isPanelVisible: false,
    activeModal: null,
    currentRoom: null,
    currentRenovatingRoom: '',
    currentRoomForDemolish: '',
  }),

  // ==================== Getters ====================
  getters: {
    /**
     * 是否有模态框打开
     */
    hasModalOpen: (state): boolean => {
      return state.activeModal !== null;
    },

    /**
     * 是否为房间详情模态框
     */
    isRoomModalOpen: (state): boolean => {
      return state.activeModal === 'room';
    },

    /**
     * 是否为招募租客模态框
     */
    isRecruitmentModalOpen: (state): boolean => {
      return state.activeModal === 'recruitment';
    },

    /**
     * 是否为装修选择模态框
     */
    isRenovateModalOpen: (state): boolean => {
      return state.activeModal === 'renovate';
    },

    /**
     * 是否为功能性房间输入模态框
     */
    isFunctionalInputModalOpen: (state): boolean => {
      return state.activeModal === 'functional-input';
    },

    /**
     * 当前房间号
     */
    currentRoomNumber: (state): string => {
      if (!state.currentRoom) return '';
      const number = state.currentRoom.number;
      return Array.isArray(number) ? number[0] || '' : number || '';
    },
  },

  // ==================== Actions ====================
  actions: {
    /**
     * 打开面板
     */
    openPanel(): void {
      this.isPanelVisible = true;
      console.log('📂 面板已打开');
    },

    /**
     * 关闭面板
     */
    closePanel(): void {
      this.isPanelVisible = false;
      console.log('📁 面板已关闭');
    },

    /**
     * 切换面板显示状态
     */
    togglePanel(): void {
      this.isPanelVisible = !this.isPanelVisible;
      console.log(`📂 面板${this.isPanelVisible ? '已打开' : '已关闭'}`);
    },

    /**
     * 打开模态框
     * @param type - 模态框类型
     * @param room - 相关房间（可选）
     */
    openModal(type: ModalType, room?: Room): void {
      this.activeModal = type;
      if (room) {
        this.currentRoom = room;
      }
      console.log(`🔲 打开模态框: ${type}`, room);
    },

    /**
     * 关闭模态框
     */
    closeModal(): void {
      const previousModal = this.activeModal;
      this.activeModal = null;
      this.currentRoom = null;
      this.currentRenovatingRoom = '';
      this.currentRoomForDemolish = '';
      console.log(`🔳 关闭模态框: ${previousModal}`);
    },

    /**
     * 打开房间详情模态框
     * @param room - 房间数据
     */
    openRoomModal(room: Room): void {
      this.openModal('room', room);
    },

    /**
     * 打开招募租客模态框
     */
    openRecruitmentModal(): void {
      this.openModal('recruitment');
    },

    /**
     * 打开装修选择模态框
     * @param roomNumber - 房间号
     */
    openRenovateModal(roomNumber: string): void {
      this.currentRenovatingRoom = roomNumber;
      this.openModal('renovate');
    },

    /**
     * 打开功能性房间输入模态框
     * @param roomNumber - 房间号
     */
    openFunctionalInputModal(roomNumber: string): void {
      this.currentRenovatingRoom = roomNumber;
      this.openModal('functional-input');
    },

    /**
     * 设置当前房间
     * @param room - 房间数据
     */
    setCurrentRoom(room: Room | null): void {
      this.currentRoom = room;
    },

    /**
     * 设置当前装修房间号
     * @param roomNumber - 房间号
     */
    setCurrentRenovatingRoom(roomNumber: string): void {
      this.currentRenovatingRoom = roomNumber;
    },

    /**
     * 设置当前待拆除房间号
     * @param roomNumber - 房间号
     */
    setCurrentRoomForDemolish(roomNumber: string): void {
      this.currentRoomForDemolish = roomNumber;
    },

    /**
     * 重置所有 UI 状态
     */
    reset(): void {
      this.isPanelVisible = false;
      this.activeModal = null;
      this.currentRoom = null;
      this.currentRenovatingRoom = '';
      this.currentRoomForDemolish = '';
      console.log('🔄 UI 状态已重置');
    },
  },
});

