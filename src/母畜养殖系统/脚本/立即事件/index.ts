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
      const rate = _.clamp(Math.round(fav * 0.5 + corr * 0.5), 0, 100);
      _.set(data, '成功率', rate);
    }
  });
});