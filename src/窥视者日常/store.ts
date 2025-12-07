// src/窥视者日常/store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue'; // Removed watchEffect as we are not writing back
import { klona } from 'klona';

// Define the structure of our game state based on 变量初始化_beta.xyaml
interface PeepGameData {
    world: {
        day: number;
        time: string;
        weekday: string;
        weather: string;
    };
    player: {
        money: number;
        energy: number;
        location: string;
        mode: 'monitor' | 'stealth';
    };
    inventory: {
        items: string[];
        cameras: { [key: string]: { type: string; status: string } };
    };
    tenants: {
        [key: string]: { // Key will be character_id like "lin_xiaolu"
            name: string;
            room: string; // Room number (e.g., "201")
            is_home: boolean;
            state: string;
            params: {
                consciousness: number;
                alertness: number;
                trust: number;
                depravity: number;
                body_sensitivity: number;
                li_qiang_alertness?: number; // Optional: only for Wang Yan
            };
            flags: { [key: string]: any }; // Assuming flags can be dynamic key-value pairs
        };
    };
}

export const useGameStore = defineStore('peepGame', () => {
    // Initialize with a default empty state to match the interface structure
    const gameState = ref<PeepGameData>({
        world: { day: 0, time: '00:00', weekday: '', weather: '' },
        player: { money: 0, energy: 0, location: '', mode: 'monitor' },
        inventory: { items: [], cameras: {} },
        tenants: {} // Empty tenants initially, will be populated on refresh
    });

    const refreshGameState = () => {
        try {
            let data: any = null;

            // 尝试从 MVU 获取最新数据
            // @ts-ignore
            if (typeof Mvu !== 'undefined') {
                // @ts-ignore
                const mvuResult = Mvu.getMvuData({
                    type: 'message',
                    message_id: 'latest',
                });
                data = mvuResult?.stat_data;
            } 
            // 尝试从父窗口 MVU 获取 (iframe 环境)
            // @ts-ignore
            else if (window.parent && typeof window.parent.Mvu !== 'undefined') {
                // @ts-ignore
                const mvuResult = window.parent.Mvu.getMvuData({
                    type: 'message',
                    message_id: 'latest',
                });
                data = mvuResult?.stat_data;
            }
            // 回退方案：尝试读取全局变量
            else {
                 const globalVars = getVariables({ type: 'global' });
                 data = globalVars?.stat_data;
            }
            
            if (data) {
                // === 数据清洗：修复散落在 tenants 之外的人物数据 ===
                if (!data.tenants) data.tenants = {};
                
                Object.keys(data).forEach(key => {
                    const val = data[key];
                    // 如果某个属性是对象，且包含 'room' 字段，且不在 tenants 里
                    if (val && typeof val === 'object' && val.room && key !== 'tenants') {
                        console.warn(`[窥视者日常] 发现散落的人物数据: ${key}，正在尝试归位...`);
                        data.tenants[key] = val;
                        // 可选：删除原来的散落数据，保持 stat_data 整洁
                        // delete data[key]; 
                    }
                });
                // ================================================

                // Use klona for deep cloning to ensure reactivity and prevent
                // direct mutation issues when assigning to gameState.value.
                // Cast to PeepGameData to ensure type safety.
                gameState.value = klona(data) as PeepGameData;
                console.info('[窥视者日常] 游戏状态已刷新。');
            } else {
                console.warn('[窥视者日常] 未能获取到游戏数据 (stat_data)。请确保 MVU 已运行且变量已初始化。');
            }
        } catch (e) {
            console.error('[窥视者日常] 刷新游戏状态时发生错误:', e);
        }
    };

    // Perform an initial refresh when the store is created.
    refreshGameState();

    // Since initialization and updates are handled by other scripts,
    // this store primarily acts as a reader. External mechanisms (e.g.,
    // event listeners, polling) should call refreshGameState() to keep
    // the UI updated when the underlying global variable changes.

    return {
        gameState,
        refreshGameState, // Expose this method for external refresh triggers
    };
});