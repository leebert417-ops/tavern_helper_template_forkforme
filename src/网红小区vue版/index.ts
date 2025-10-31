/**
 * 网红小区 Vue 版 - 入口文件
 * 
 * 初始化 Vue 应用并挂载到 SillyTavern 页面
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 导入全局样式
import './styles/common.css';

console.log('🏢 网红小区 Vue 版正在初始化...');

/**
 * 创建 Vue 应用
 */
function createNgqApp() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  return app;
}

/**
 * 获取目标文档（SillyTavern 的顶层文档）
 */
function getTargetDocument(): Document {
  return window.top?.document || document;
}

/**
 * 创建挂载容器
 */
function createMountContainer(targetDoc: Document): HTMLDivElement {
  const container = targetDoc.createElement('div');
  container.id = 'ngq-vue-app';
  container.setAttribute('data-script-id', getScriptId());
  return container;
}

/**
 * 销毁挂载容器
 */
function destroyMountContainer(targetDoc: Document): void {
  const container = targetDoc.getElementById('ngq-vue-app');
  if (container) {
    container.remove();
    console.log('🗑️ 挂载容器已移除');
  }
}

/**
 * 获取脚本 ID（用于标识和清理）
 */
function getScriptId(): string {
  // 从当前脚本路径提取 ID
  const scriptPath = import.meta.url;
  const match = scriptPath.match(/网红小区vue版/);
  return match ? '网红小区vue版' : 'ngq-vue';
}

/**
 * 初始化应用
 */
function initialize(): void {
  try {
    const targetDoc = getTargetDocument();
    
    // 检查是否已经初始化
    if (targetDoc.getElementById('ngq-vue-app')) {
      console.warn('⚠️ 应用已经初始化，跳过重复初始化');
      return;
    }

    // 创建 Vue 应用
    const app = createNgqApp();

    // 创建挂载容器
    const container = createMountContainer(targetDoc);
    targetDoc.body.appendChild(container);

    // 挂载应用
    app.mount(container);

    console.log('✅ 网红小区 Vue 版初始化成功');

    // 页面卸载时清理
    $(window).on('pagehide', () => {
      cleanup(app, targetDoc);
    });
  } catch (error) {
    console.error('❌ 网红小区 Vue 版初始化失败:', error);
    toastr?.error('网红小区插件初始化失败');
  }
}

/**
 * 清理应用
 */
function cleanup(app: any, targetDoc: Document): void {
  try {
    app.unmount();
    destroyMountContainer(targetDoc);
    console.log('🧹 网红小区 Vue 版已清理');
  } catch (error) {
    console.error('❌ 清理失败:', error);
  }
}

// 等待 DOM 加载完成后初始化
$(() => {
  initialize();
});

// 全局类型声明
declare global {
  const $: JQueryStatic;
  const toastr: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  } | undefined;
}

