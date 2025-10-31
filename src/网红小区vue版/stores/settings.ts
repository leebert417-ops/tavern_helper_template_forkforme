/**
 * 设置 Store
 * 管理插件设置，支持 localStorage 持久化
 */

import { defineStore } from 'pinia';
import type { PluginSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../types';

interface SettingsState extends PluginSettings {
  /** 是否已初始化 */
  initialized: boolean;
}

export const useSettingsStore = defineStore('settings', {
  // ==================== State ====================
  state: (): SettingsState => ({
    autoRefreshEnabled: DEFAULT_SETTINGS.autoRefreshEnabled,
    refreshInterval: DEFAULT_SETTINGS.refreshInterval,
    initialized: false,
  }),

  // ==================== Getters ====================
  getters: {
    /**
     * 刷新间隔（秒）
     */
    refreshIntervalSeconds(): number {
      return Math.floor(this.refreshInterval / 1000);
    },

    /**
     * 刷新间隔（分钟）
     */
    refreshIntervalMinutes(): number {
      return Math.floor(this.refreshInterval / 60000);
    },

    /**
     * 格式化的刷新间隔
     */
    formattedRefreshInterval(): string {
      const seconds = this.refreshIntervalSeconds;
      if (seconds < 60) {
        return `${seconds}秒`;
      }
      const minutes = this.refreshIntervalMinutes;
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes}分钟`;
      }
      return `${minutes}分${remainingSeconds}秒`;
    },
  },

  // ==================== Actions ====================
  actions: {
    /**
     * 从 localStorage 加载设置
     */
    loadFromStorage(): void {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
          const settings: PluginSettings = JSON.parse(stored);
          this.autoRefreshEnabled = settings.autoRefreshEnabled ?? DEFAULT_SETTINGS.autoRefreshEnabled;
          this.refreshInterval = settings.refreshInterval ?? DEFAULT_SETTINGS.refreshInterval;
          console.log('✅ 设置已从 localStorage 加载', settings);
        } else {
          console.log('ℹ️ 未找到保存的设置，使用默认值');
        }
      } catch (error) {
        console.error('❌ 加载设置失败:', error);
        this.resetToDefaults();
      } finally {
        this.initialized = true;
      }
    },

    /**
     * 保存设置到 localStorage
     */
    saveToStorage(): void {
      try {
        const settings: Settings = {
          autoRefreshEnabled: this.autoRefreshEnabled,
          refreshInterval: this.refreshInterval,
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        console.log('💾 设置已保存到 localStorage', settings);
      } catch (error) {
        console.error('❌ 保存设置失败:', error);
      }
    },

    /**
     * 切换自动刷新
     */
    toggleAutoRefresh(): void {
      this.autoRefreshEnabled = !this.autoRefreshEnabled;
      this.saveToStorage();
      console.log(`🔄 自动刷新${this.autoRefreshEnabled ? '已启用' : '已禁用'}`);
    },

    /**
     * 启用自动刷新
     */
    enableAutoRefresh(): void {
      if (!this.autoRefreshEnabled) {
        this.autoRefreshEnabled = true;
        this.saveToStorage();
        console.log('✅ 自动刷新已启用');
      }
    },

    /**
     * 禁用自动刷新
     */
    disableAutoRefresh(): void {
      if (this.autoRefreshEnabled) {
        this.autoRefreshEnabled = false;
        this.saveToStorage();
        console.log('⏸️ 自动刷新已禁用');
      }
    },

    /**
     * 设置刷新间隔
     * @param interval - 间隔时间（毫秒）
     */
    setRefreshInterval(interval: number): void {
      // 限制最小间隔为 5 秒
      const minInterval = 5000;
      this.refreshInterval = Math.max(interval, minInterval);
      this.saveToStorage();
      console.log(`⏱️ 刷新间隔已设置为 ${this.formattedRefreshInterval}`);
    },

    /**
     * 设置刷新间隔（秒）
     * @param seconds - 秒数
     */
    setRefreshIntervalSeconds(seconds: number): void {
      this.setRefreshInterval(seconds * 1000);
    },

    /**
     * 设置刷新间隔（分钟）
     * @param minutes - 分钟数
     */
    setRefreshIntervalMinutes(minutes: number): void {
      this.setRefreshInterval(minutes * 60000);
    },

    /**
     * 重置为默认设置
     */
    resetToDefaults(): void {
      this.autoRefreshEnabled = DEFAULT_SETTINGS.autoRefreshEnabled;
      this.refreshInterval = DEFAULT_SETTINGS.refreshInterval;
      this.saveToStorage();
      console.log('🔄 设置已重置为默认值');
    },

    /**
     * 初始化设置
     * 从 localStorage 加载，如果不存在则使用默认值
     */
    initialize(): void {
      if (!this.initialized) {
        this.loadFromStorage();
      }
    },

    /**
     * 清除保存的设置
     */
    clearStorage(): void {
      try {
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        this.resetToDefaults();
        console.log('🗑️ 已清除保存的设置');
      } catch (error) {
        console.error('❌ 清除设置失败:', error);
      }
    },

    /**
     * 导出设置（用于备份）
     */
    exportSettings(): PluginSettings {
      return {
        autoRefreshEnabled: this.autoRefreshEnabled,
        refreshInterval: this.refreshInterval,
      };
    },

    /**
     * 导入设置（用于恢复）
     * @param settings - 设置对象
     */
    importSettings(settings: Partial<PluginSettings>): void {
      if (settings.autoRefreshEnabled !== undefined) {
        this.autoRefreshEnabled = settings.autoRefreshEnabled;
      }
      if (settings.refreshInterval !== undefined) {
        this.refreshInterval = settings.refreshInterval;
      }
      this.saveToStorage();
      console.log('📥 设置已导入', settings);
    },
  },
});
