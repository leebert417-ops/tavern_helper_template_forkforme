import { klona } from 'klona/lite';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';
import { initialApartmentsState, initialTenantsState, initialWorldState, type ScheduleEntry } from './initialData';

// ========== 类型定义 ==========

// 敘事訊息的結構
export interface NarrativeMessage {
  id: number;
  type: 'system' | 'action' | 'dialogue' | 'event';
  text: string;
  timestamp: string; // 记录消息发生时的游戏时间
}

// 假設的 MvuData 結構 (基於 mvu.d.ts)
// 我們主要關心 stat_data
interface MvuData {
  stat_data: Record<string, any>;
  display_data?: Record<string, any>;
  delta_data?: Record<string, any>;
  initialized_lorebooks?: string[];
}

// ========== 時間處理輔助函數 ==========

/**
 * 解析時間字符串為分鐘數（從 00:00 開始算）
 * @param timeStr - 時間字符串，格式：HH:MM
 * @returns 從 00:00 開始的總分鐘數
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 將分鐘數格式化為時間字符串
 * @param minutes - 從 00:00 開始的總分鐘數
 * @returns 格式化的時間字符串 HH:MM
 */
function formatTime(minutes: number): string {
  // 處理跨天情況（分鐘數可能 >= 1440）
  const totalMinutes = minutes % 1440; // 1440 = 24 * 60
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 給時間字符串增加指定的小時數
 * @param timeStr - 時間字符串，格式：HH:MM
 * @param hours - 要增加的小時數
 * @returns 新的時間字符串
 */
function addHours(timeStr: string, hours: number): string {
  const minutes = parseTime(timeStr);
  const newMinutes = minutes + hours * 60;
  return formatTime(newMinutes);
}

/**
 * 檢查當前時間是否在某個時間段內
 * @param currentTime - 當前時間字符串 HH:MM
 * @param startTime - 時間段開始時間 HH:MM
 * @param endTime - 時間段結束時間 HH:MM
 * @returns 是否在時間段內
 */
function isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // 處理跨天的情況（如 22:00 到次日 06:00）
  if (end <= start) {
    end += 1440; // 加上 24 小時
    // 如果當前時間小于開始時間，說明當前時間是第二天的
    if (current < start) {
      return current <= end - 1440;
    }
  }

  return current >= start && current < end;
}

/**
 * 根據當前時間和日程表，查找租客應該在的位置
 * @param currentTime - 當前時間字符串 HH:MM
 * @param schedule - 租客的日程表
 * @returns 應該在的位置（房間號），如果沒有匹配則返回 null
 */
function findLocationByTime(currentTime: string, schedule: ScheduleEntry[]): string | null {
  for (const entry of schedule) {
    if (isTimeInRange(currentTime, entry.startTime, entry.endTime)) {
      return entry.location;
    }
  }
  return null;
}

export const useGameStore = defineStore('game', () => {
  // --- 狀態定義 ---
  // 使用從 initialData.ts 導入的數據來初始化狀態
  const world = ref(initialWorldState);
  const apartments = ref(initialApartmentsState);
  const tenants = ref(initialTenantsState);

  // --- 玩家狀態 ---
  const player = ref({
    currentLocation: '203', // 默認為玩家自己的房間
    inventory: [] as Array<{
      name: string;
      type: string;
      description?: string;
      effect?: string;
      quantity?: number;
      usable?: boolean;
    }>,
  });

  // --- 敘事和加載狀態 ---
  const narrativeLog = ref<NarrativeMessage[]>([]);
  const isLoading = ref(false);
  let messageIdCounter = ref(0);

  // --- 輔助函數 ---
  /**
   * 向敘事日誌添加一條新消息
   * @param type 消息類型
   * @param text 消息文本
   */
  function addNarrativeMessage(type: NarrativeMessage['type'], text: string) {
    narrativeLog.value.push({
      id: messageIdCounter.value++,
      type,
      text,
      timestamp: world.value.时间,
    });
  }

  /**
   * 遊戲核心循環: 推進時間並更新世界狀態
   * @param hours - 要推進的小時數
   */
  function advanceTime(hours: number) {
    if (isLoading.value) return; // 避免在等待 LLM 回應時推進時間

    console.log(`推進時間 ${hours} 小時...`);

    // 1. 更新世界時間
    const currentTime = world.value.时间;
    const newTime = addHours(currentTime, hours);
    world.value.时间 = newTime;

    addNarrativeMessage('system', `時間推進了 ${hours} 小時, 現在是 ${newTime}。`);
    console.log(`時間從 ${currentTime} 推進到 ${newTime}`);

    // 2. 根據日程更新所有租客的位置
    for (const [tenantName, tenant] of Object.entries(tenants.value)) {
      const newLocation = findLocationByTime(newTime, tenant.schedule);

      if (newLocation && newLocation !== tenant.当前位置) {
        const oldLocation = tenant.当前位置;
        tenant.当前位置 = newLocation;
        console.log(`${tenantName} 從 ${oldLocation} 移動到 ${newLocation}`);
        addNarrativeMessage('system', `${tenantName} 從 ${oldLocation} 移動到了 ${newLocation}。`);

        // 可選：更新租客的狀態描述
        const scheduleEntry = tenant.schedule.find(entry => isTimeInRange(newTime, entry.startTime, entry.endTime));
        if (scheduleEntry && scheduleEntry.activity) {
          tenant.状态 = scheduleEntry.activity;
        }
      } else if (newLocation) {
        console.log(`${tenantName} 仍在 ${newLocation}`);
      }
    }

    // 3. TODO: 檢查並觸發事件
  }

  /**
   * 玩家移動到新房間
   * @param roomId 房間 ID
   */
  function moveToRoom(roomId: string) {
    if (isLoading.value) return;
    if (player.value.currentLocation === roomId) return;

    player.value.currentLocation = roomId;
    const room = (apartments.value.房间列表 as any)[roomId];
    addNarrativeMessage('action', `你移動到了 ${roomId} (${room.类型})。`);
    console.log(`移動到房間: ${roomId}`);
  }

  /**
   * 清空敘事日誌
   */
  function clearNarrativeLog() {
    narrativeLog.value = [];
    addNarrativeMessage('system', '歡迎來到網紅小區。');
  }

  /**
   * 與租客互動 (Phase 5 核心實現)
   * @param tenantId - 要互動的租客ID
   */
  async function interactWithTenant(tenantId: string) {
    if (isLoading.value) {
      console.warn('正在等待上一個互動完成...');
      return;
    }

    isLoading.value = true;
    console.log(`[Phase 5] 開始與 ${tenantId} 互動...`);

    try {
      const tenant = (tenants.value as any)[tenantId];
      const room = (apartments.value.房间列表 as any)[player.value.currentLocation];

      // 1. 等待 Mvu 初始化
      await waitGlobalInitialized('Mvu');

      // 2. 獲取當前 MvuData (使用 Pinia $state 作為 stat_data 的來源)
      const oldMvuData: MvuData = {
        stat_data: klona(useGameStore().$state),
        display_data: {},
        delta_data: {},
        initialized_lorebooks: [],
      };

      // 3. 構建增強的 Prompt
      const prompt = `你正在扮演一个模拟经营游戏的叙事引擎。玩家是一位公寓房东，正在与租客互动。

[当前游戏状态]
时间: ${world.value.时间}
地点: ${player.value.currentLocation} (${room.类型})
房东正在与 ${tenantId} 互动

[租客 ${tenantId} 的信息]
职业: ${tenant.职业}
性格: ${tenant.性格}
当前状态: ${tenant.状态}
好感度: ${tenant.好感度}/100
当前位置: ${tenant.当前位置}

[互动规则]
1. 好感度变化：
   - 普通友好互动：+3 到 +5
   - 深入交谈、帮助租客：+5 到 +10
   - 送礼物、完成请求：+8 到 +15
   - 冷淡、拒绝：-3 到 -8

2. 状态更新：反映租客当前正在做的事情

3. 记忆添加：仅在重要或有意义的互动后添加（10-20字）

[任务]
生成一段简短的互动叙事（50-100字），描述房东与 ${tenantId} 的对话或互动场景。
然后使用 MVU 指令更新游戏状态。

[输出格式]
叙事文本...

<UpdateVariable>
  <Analysis>
    tenants.${tenantId}.好感度: Yes/No
    tenants.${tenantId}.状态: Yes/No
    tenants.${tenantId}.记忆: Yes/No
  </Analysis>
  _.add('tenants.${tenantId}.好感度', X); // 原因
  _.set('tenants.${tenantId}.状态', '旧状态', '新状态'); // 原因
  _.insert('tenants.${tenantId}.记忆', '记忆内容'); // 原因
</UpdateVariable>

请开始生成：`;

      addNarrativeMessage('action', `你开始与 ${tenantId} 互动...`);
      console.log('[Phase 5] 调用 generate()...');

      // 4. 调用 generate()
      const llmResponse = await generate(prompt, {
        max_tokens: 400,
        temperature: 0.8,
      });

      console.log('[Phase 5] 收到 LLM 回应:', llmResponse);

      // 5. 提取叙事文本
      const mvuRegex = /<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g;
      const narrativeText = llmResponse.replace(mvuRegex, '').trim();

      if (narrativeText) {
        addNarrativeMessage('dialogue', narrativeText);
      }

      // 6. 解析 MVU 指令
      const newMvuData = await Mvu.parseMessage(llmResponse, oldMvuData as any);

      // 7. 更新 store 状态
      if (newMvuData && newMvuData.stat_data) {
        console.log('[Phase 5] Mvu.parseMessage 解析成功，正在更新 Pinia 状态...');
        useGameStore().$patch(newMvuData.stat_data);

        // 显示变量变化
        if (newMvuData.delta_data && Object.keys(newMvuData.delta_data).length > 0) {
          for (const [key, change] of Object.entries(newMvuData.delta_data)) {
            const friendlyKey = key
              .replace('tenants.', '')
              .replace('.好感度', ' 的好感度')
              .replace('.状态', ' 的状态')
              .replace('.记忆', ' 的记忆');
            addNarrativeMessage('event', `📊 ${friendlyKey}: ${change}`);
          }
        }
      } else {
        console.warn('[Phase 5] Mvu.parseMessage 未返回新状态或未解析到指令。');
        addNarrativeMessage('system', '(未检测到状态变化)');
      }
    } catch (error: any) {
      console.error('[Phase 5] 互动时发生错误:', error);
      addNarrativeMessage('system', `❌ 互动处理失败: ${error?.message || '未知错误'}`);
    } finally {
      isLoading.value = false;
      console.log('[Phase 5] 互动结束。');
    }
  }

  return {
    world,
    apartments,
    tenants,
    player,
    narrativeLog: readonly(narrativeLog), // UI 只能讀取
    isLoading: readonly(isLoading), // UI 只能讀取
    advanceTime,
    moveToRoom,
    interactWithTenant,
    clearNarrativeLog,
    addNarrativeMessage, // 允許 App.vue 在 onMounted 時添加歡迎消息
  };
});
