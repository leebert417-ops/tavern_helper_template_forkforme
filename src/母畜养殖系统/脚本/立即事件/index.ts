$(async () => {
  await waitGlobalInitialized('Mvu');

  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async variables => {
    // 每回合更新随机数 (0-99)
    const random = Math.floor(Math.random() * 100);
    _.set(variables, 'stat_data.随机数', random);

    // 遍历备选母畜，根据好感度+堕落值计算各角色成功率
    const candidates = _.get(variables, 'stat_data.备选母畜', {});
    for (const [name, data] of Object.entries(candidates)) {
      const fav = _.get(data, '好感度', 0);
      const corr = _.get(data, '堕落值', 0);
      const rate = calcRate(fav as number, corr as number);
      _.set(data, '成功率', rate);
    }
  });

  function calcRate(fav: number, corr: number): number {
    // 高阶值做基准，低阶值做增幅，增幅随基准靠近100而线性衰减
    const H = Math.max(fav, corr);
    const L = Math.min(fav, corr);
    const bonus = L * (100 - H) / 100;
    return Math.floor(H + bonus);
  }
});
