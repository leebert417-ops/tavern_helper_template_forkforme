import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useGameStore } from './store';
import './style.scss'; // 引入全局样式

$(() => {
    // 确保 DOM 准备就绪
    const mountPoint = document.getElementById('peep-app');
    if (mountPoint) {
        const app = createApp(App);
        const pinia = createPinia();
        app.use(pinia);
        app.mount(mountPoint);
        console.info('[窥视者日常] Vue应用已挂载');

        // 获取 store 实例
        const gameStore = useGameStore(pinia);

        // 设置定时器，每秒刷新一次游戏状态，以保持UI与后端变量同步
        // 实际游戏中，可以调整刷新频率或根据MVU事件触发刷新
        setInterval(() => {
            gameStore.refreshGameState();
        }, 1000); // 每1秒刷新一次
        
    } else {
        console.error('[窥视者日常] 未找到挂载点 #peep-app');
    }
});