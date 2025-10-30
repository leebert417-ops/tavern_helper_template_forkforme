import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initialWorldState, initialApartmentsState, initialTenantsState, type Tenant, type ScheduleEntry } from './initialData';

// ========== 时间处理辅助函数 ==========

/**
 * 解析时间字符串为分钟数（从 00:00 开始算）
 * @param timeStr - 时间字符串，格式：HH:MM
 * @returns 从 00:00 开始的总分钟数
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 将分钟数格式化为时间字符串
 * @param minutes - 从 00:00 开始的总分钟数
 * @returns 格式化的时间字符串 HH:MM
 */
function formatTime(minutes: number): string {
  // 处理跨天情况（分钟数可能 >= 1440）
  const totalMinutes = minutes % 1440; // 1440 = 24 * 60
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 给时间字符串增加指定的小时数
 * @param timeStr - 时间字符串，格式：HH:MM
 * @param hours - 要增加的小时数
 * @returns 新的时间字符串
 */
function addHours(timeStr: string, hours: number): string {
  const minutes = parseTime(timeStr);
  const newMinutes = minutes + hours * 60;
  return formatTime(newMinutes);
}

/**
 * 检查当前时间是否在某个时间段内
 * @param currentTime - 当前时间字符串 HH:MM
 * @param startTime - 时间段开始时间 HH:MM
 * @param endTime - 时间段结束时间 HH:MM
 * @returns 是否在时间段内
 */
function isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // 处理跨天的情况（如 22:00 到次日 06:00）
  if (end <= start) {
    end += 1440; // 加上 24 小时
    // 如果当前时间小于开始时间，说明当前时间是第二天的
    if (current < start) {
      return current <= end - 1440;
    }
  }

  return current >= start && current < end;
}

/**
 * 根据当前时间和日程表，查找租客应该在的位置
 * @param currentTime - 当前时间字符串 HH:MM
 * @param schedule - 租客的日程表
 * @returns 应该在的位置（房间号），如果没有匹配则返回 null
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
  // --- 状态定义 ---
  // 使用从 initialData.ts 导入的数据来初始化状态
  const world = ref(initialWorldState);
  const apartments = ref(initialApartmentsState);
  const tenants = ref(initialTenantsState);

  // --- 玩家状态 ---
  const player = ref({
    currentLocation: '203', // 默认为玩家自己的房间
  });

  /**
   * 游戏核心循环: 推进时间并更新世界状态
   * @param hours - 要推进的小时数
   */
  function advanceTime(hours: number) {
    console.log(`推进时间 ${hours} 小时...`);

    // 1. 更新世界时间
    const currentTime = world.value.时间;
    const newTime = addHours(currentTime, hours);
    world.value.时间 = newTime;

    console.log(`时间从 ${currentTime} 推进到 ${newTime}`);

    // 2. 根据日程更新所有租客的位置
    for (const [tenantName, tenant] of Object.entries(tenants.value)) {
      const newLocation = findLocationByTime(newTime, tenant.schedule);

      if (newLocation && newLocation !== tenant.当前位置) {
        const oldLocation = tenant.当前位置;
        tenant.当前位置 = newLocation;
        console.log(`${tenantName} 从 ${oldLocation} 移动到 ${newLocation}`);

        // 可选：更新租客的状态描述
        const scheduleEntry = tenant.schedule.find(entry =>
          isTimeInRange(newTime, entry.startTime, entry.endTime)
        );
        if (scheduleEntry && scheduleEntry.activity) {
          tenant.状态 = scheduleEntry.activity;
        }
      } else if (newLocation) {
        console.log(`${tenantName} 仍在 ${newLocation}`);
      }
    }

    // 3. TODO: 检查并触发事件
    // 未来可以在这里添加事件触发逻辑，例如：
    // - 检查好感度阈值
    // - 检查性欲阈值
    // - 检查特定时间点的特殊事件
    // - 检查玩家和租客是否在同一房间
  }

  /**
   * 与租客互动
   * @param tenantId - 要互动的租客ID
   */
  async function interactWithTenant(tenantId: string) {
    console.log(`与 ${tenantId} 互动...`);
    // TODO:
    // 1. 构建 Prompt
    // 2. 调用 generate()
    // 3. 调用 Mvu.parseMessage()
    // 4. 更新 store 状态
  }

  return {
    world,
    apartments,
    tenants,
    player,
    advanceTime,
    interactWithTenant,
  };
});
