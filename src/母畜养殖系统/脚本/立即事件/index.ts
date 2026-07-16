$(async () => {
  await waitGlobalInitialized('Mvu');

  // 用户发送消息后立刻生成随机数，存入隐藏字段供 AI 读取
  eventOn(tavern_events.MESSAGE_SENT, async () => {
    updateVariablesWith(variables => {
      _.set(variables, 'stat_data._本轮随机数', Math.floor(Math.random() * 100));
      return variables;
    }, { type: 'message', message_id: -1 });
  });

  // AI 回复并完成变量更新后，清理隐藏字段并计算成功率
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async variables => {
    _.unset(variables, 'stat_data._本轮随机数');

    const candidates = _.get(variables, 'stat_data.备选母畜', {});
    for (const data of Object.values(candidates as Record<string, any>)) {
      const fav = _.get(data, '好感度', 0);
      const corr = _.get(data, '堕落值', 0);
      const rate = calcRate(fav as number, corr as number);
      _.set(data, '成功率', rate);
    }
  });

  // 重修脱离母畜化判定：重修次数越高越容易脱离，可消耗重修稳定剂降低风险
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (new_variables, old_variables) => {
    const livestock = _.get(new_variables, 'stat_data.母畜', {});
    const oldLivestock = _.get(old_variables, 'stat_data.母畜', {});
    for (const [name, data] of Object.entries(livestock as Record<string, any>)) {
      const old重修 = _.get(oldLivestock, [name, '重修次数'], 0) as number;
      const new重修 = _.get(data, '重修次数', 0) as number;
      if (new重修 > old重修) {
        const items = _.get(new_variables, 'stat_data.主角.道具栏', {});
        let probability = new重修 * 15;
        if (_.get(items, '重修稳定剂', 0) > 0) {
          probability = Math.floor(probability / 2);
          _.set(items, '重修稳定剂', _.get(items, '重修稳定剂', 0) - 1);
        }
        if (Math.floor(Math.random() * 100) < probability) {
          _.set(data, '是否母畜化', false);
          _.unset(new_variables, `stat_data.母畜.${name}`);
        }
      }
    }
  });

  function calcRate(fav: number, corr: number): number {
    return Math.floor(Math.sqrt(fav * corr));
  }
});