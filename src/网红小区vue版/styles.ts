
/**
 * 样式打包文件
 * 
 * 使用 ?raw 查询参数导入所有 CSS 文件内容，
 * 并将它们拼接成一个单独的字符串导出。
 */

// 注意：导入顺序很重要，变量和动画需要先导入
import variables from './styles/variables.css?raw';
import animations from './styles/animations.css?raw';
import common from './styles/common.css?raw';
import app from './App.css?raw';
import toggleButton from './components/ToggleButton.css?raw';
import mainPanel from './components/MainPanel.css?raw';
import managementActions from './components/ManagementActions.css?raw';
import floorView from './components/FloorView.css?raw';
import roomCard from './components/RoomCard.css?raw';
import baseModal from './components/modals/BaseModal.css?raw';
import functionalInputModal from './components/modals/FunctionalInputModal.css?raw';
import roomModal from './components/modals/RoomModal.css?raw';

/**
 * 包含所有插件样式的字符串
 */
export const allStyles: string = `
  ${variables}
  ${animations}
  ${common}
  ${app}
  ${toggleButton}
  ${mainPanel}
  ${managementActions}
  ${floorView}
  ${roomCard}
  ${baseModal}
  ${functionalInputModal}
  ${roomModal}
`;
