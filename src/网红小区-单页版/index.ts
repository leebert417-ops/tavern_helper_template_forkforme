import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 引入 to_do.md 中计划要创建的组件的样式 (如果它们有的话)
// import './components/style.css';

// 在加载脚本时执行
$(() => {
  console.log('“网红小区-单页版”脚本加载...');

  const pinia = createPinia();
  const app = createApp(App);

  app.use(pinia);

  // 将 Vue 应用挂载到 #app 元素上
  // 这个 #app 元素是在 index.html 中定义的
  app.mount('#app');

  console.log('Vue 应用已成功挂载.');
});

// 在卸载脚本时执行
$(window).on('pagehide', () => {
  console.log('“网红小区-单页版”脚本卸载.');
  // 注意: 实际项目中可能需要在这里处理应用卸载和资源清理
});
