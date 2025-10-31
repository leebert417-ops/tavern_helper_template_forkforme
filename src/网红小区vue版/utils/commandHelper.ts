/**
 * 命令填充工具函数
 * 
 * 用于将命令文本填充到 SillyTavern 的输入框
 */

/**
 * 填充命令到输入框
 * 
 * @param command - 要填充的命令文本
 * 
 * @example
 * ```ts
 * fillCommand('招募租客：性感的女大学生');
 * fillCommand('装修房间101为标准套间');
 * ```
 */
export function fillCommand(command: string): void {
  try {
    // 获取 SillyTavern 的输入框
    const textarea = document.querySelector('#send_textarea') as HTMLTextAreaElement;
    
    if (!textarea) {
      console.warn('⚠️ 未找到输入框元素 #send_textarea');
      toastr?.warning('未找到输入框');
      return;
    }

    // 设置输入框的值
    textarea.value = command;

    // 触发 input 事件以确保 SillyTavern 检测到变化
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(inputEvent);

    // 聚焦到输入框
    textarea.focus();

    // 将光标移到末尾
    textarea.setSelectionRange(command.length, command.length);

    console.log('✅ 命令已填充:', command);
  } catch (error) {
    console.error('❌ 填充命令失败:', error);
    toastr?.error('填充命令失败');
  }
}

/**
 * 生成招募租客命令
 * 
 * @param description - 租客描述/特征
 * @returns 命令文本
 */
export function generateRecruitCommand(description: string): string {
  return `招募租客：${description}`;
}

/**
 * 生成装修标准套间命令
 * 
 * @param roomNumber - 房间号
 * @returns 命令文本
 */
export function generateRenovateStandardCommand(roomNumber: string): string {
  return `装修房间${roomNumber}为标准套间`;
}

/**
 * 生成装修功能性房间命令
 * 
 * @param roomNumber - 房间号
 * @param roomName - 房间名称
 * @param roomPurpose - 房间作用
 * @returns 命令文本
 */
export function generateRenovateFunctionalCommand(
  roomNumber: string,
  roomName: string,
  roomPurpose: string
): string {
  return `装修房间${roomNumber}为功能性房间，名称：${roomName}，作用：${roomPurpose}`;
}

/**
 * 生成拆除房间命令
 * 
 * @param roomNumber - 房间号
 * @returns 命令文本
 */
export function generateDemolishCommand(roomNumber: string): string {
  return `拆除房间${roomNumber}`;
}

/**
 * 生成购置楼层命令
 * 
 * @returns 命令文本
 */
export function generatePurchaseFloorCommand(): string {
  return '购置新楼层';
}

/**
 * 生成刷新数据命令
 * 
 * @returns 命令文本
 */
export function generateRefreshCommand(): string {
  return '查看公寓状态';
}

// ==================== 全局类型声明 ====================

declare global {
  /**
   * toastr 通知库
   */
  const toastr: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  } | undefined;
}

