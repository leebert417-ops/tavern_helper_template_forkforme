<template>
  <div class="panel">
    <div class="header" @click="expanded = !expanded">
      <i class="fa" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <i class="fa fa-pagelines header-icon"></i>
      <span class="header-title">母畜养殖系统</span>
    </div>

    <transition name="slide">
      <div v-if="expanded">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <i class="fa" :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <transition name="fade" mode="out-in">
          <div class="tab-body" :key="activeTab">
            <!-- 目标（备选母畜） -->
            <div v-if="activeTab === 'target'" class="pane">
              <div v-if="!candidateCount" class="empty">
                <i class="fa fa-user-plus empty-icon"></i>
                <span>暂无备选母畜</span>
                <span class="empty-hint">增加角色好感度或堕落值以解锁检疫目标</span>
              </div>
              <div v-for="(info, name) in store.data.备选母畜" :key="name" class="card">
                <div class="card-head">
                  <span class="name">{{ name }}</span>
                  <span v-if="info.母畜评级" class="tag rating">{{ info.母畜评级 }}</span>
                </div>
                <div class="kv"><span>好感度</span><div class="bar-track"><div class="bar-fill fav" :style="{ width: info.好感度 + '%' }"></div></div><span class="val">{{ info.好感度 }}</span></div>
                <div class="kv"><span>堕落值</span><div class="bar-track"><div class="bar-fill corr" :style="{ width: info.堕落值 + '%' }"></div></div><span class="val">{{ info.堕落值 }}</span></div>
                <div class="kv highlight"><span>检疫成功率</span><span class="val" :class="rateClass(info.成功率)">{{ info.成功率 }}%</span></div>
              </div>
            </div>

            <!-- 母畜 -->
            <div v-if="activeTab === 'livestock'" class="pane">
              <div v-if="!livestockCount" class="empty">
                <i class="fa fa-inbox empty-icon"></i>
                <span>暂无母畜</span>
                <span class="empty-hint">对备选母畜发起检疫成功后即可获得母畜</span>
              </div>
              <div v-for="(info, name) in activeLivestock" :key="name" class="card">
                <div class="card-head">
                  <span class="name">{{ name }}</span>
                  <span class="tag type" :class="info.类型">{{ info.类型 }}</span>
                  <span class="level-badge" :class="levelClass(info.等级)">lv.{{ info.等级 }}</span>
                </div>
                <div class="kv"><span>经验</span><div class="bar-track"><div class="bar-fill xp" :style="{ width: xpPercent(info) + '%' }"></div></div><span class="val">{{ info.经验 }} / {{ xpNext(info) }}</span></div>
                <div class="kv"><span>自由点数</span><span class="val" :class="{ 'has-points': info.自由点数 > 0 }">{{ info.自由点数 || 0 }}</span></div>
                <div class="stat-grid">
                  <div class="stat" v-for="s in statKeys" :key="s.key">
                    <label>{{ s.label }}</label>
                    <span :class="statLevelClass(info[s.key])">{{ info[s.key] || 0 }}</span>
                  </div>
                </div>
                <div v-if="info.重修次数" class="kv warn">
                  <span><i class="fa fa-exclamation-triangle"></i> 重修风险</span>
                  <span class="val">{{ Math.min(info.重修次数 * 15, 90) }}%</span>
                </div>
              </div>
            </div>

            <!-- 道具 -->
            <div v-if="activeTab === 'items'" class="pane">
              <div class="section">
                <div class="section-title"><i class="fa fa-stamp"></i> 检疫工具</div>
                <div class="kv" v-for="(qty, name) in stampItems" :key="name" :class="{ dim: !qty }">
                  <span>{{ itemLabel(String(name)) }}</span><span class="val">{{ qty }}</span>
                </div>
              </div>
              <div class="section">
                <div class="section-title"><i class="fa fa-flask"></i> 消耗道具</div>
                <div class="kv" v-for="(qty, name) in consumableItems" :key="name" :class="{ dim: !qty }">
                  <span>{{ itemLabel(String(name)) }}</span><span class="val">{{ qty }}</span>
                </div>
              </div>
              <div class="section">
                <div class="section-title"><i class="fa fa-medkit"></i> 医疗道具</div>
                <div class="kv" v-for="(qty, name) in medicalItems" :key="name" :class="{ dim: !qty }">
                  <span>{{ itemLabel(String(name)) }}</span><span class="val">{{ qty }}</span>
                </div>
              </div>
            </div>

            <!-- 商店 -->
            <div v-if="activeTab === 'shop'" class="pane">
              <div class="section">
                <div class="section-title"><i class="fa fa-money"></i> 财务</div>
                <div class="kv"><span>母畜币</span><span class="val primary">{{ store.data.主角.母畜币 }}</span></div>
                <div class="kv"><span>联名卡余额</span><span class="val">&yen;{{ store.data.主角.联名卡余额 }}</span><small class="hint">次日 4:00 自动兑换</small></div>
                <div class="kv"><span>卡外资产</span><span class="val">&yen;{{ store.data.主角.卡外资产 }}</span></div>
              </div>
              <div class="section">
                <div class="section-title"><i class="fa fa-shopping-cart"></i> 一次性购买</div>
                <div class="shop-item" v-for="item in oneTimeItems" :key="item.name">
                  <div class="shop-name">{{ item.name }}</div>
                  <div class="shop-price">{{ item.price }}</div>
                  <div class="shop-desc">{{ item.desc }}</div>
                </div>
              </div>
              <div class="section">
                <div class="section-title"><i class="fa fa-repeat"></i> 可重复购买</div>
                <div class="shop-item" v-for="item in repeatItems" :key="item.name">
                  <div class="shop-name">{{ item.name }}</div>
                  <div class="shop-price">{{ item.price }}</div>
                  <div class="shop-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();

const expanded = ref(false);
const activeTab = ref('target');

const tabs = [
  { key: 'target', label: '目标', icon: 'fa-crosshairs' },
  { key: 'livestock', label: '母畜', icon: 'fa-paw' },
  { key: 'items', label: '道具', icon: 'fa-briefcase' },
  { key: 'shop', label: '商店', icon: 'fa-shopping-basket' },
];

const statKeys = [
  { key: '乳房', label: '乳房' },
  { key: '臀部', label: '臀部' },
  { key: '子宫', label: '子宫' },
  { key: '阴道', label: '阴道' },
  { key: '肛门', label: '肛门' },
] as const;

const candidateCount = computed(() => Object.keys(store.data.备选母畜).length);
const activeLivestock = computed(() => Object.fromEntries(Object.entries(store.data.母畜).filter(([_, v]) => v.是否母畜化)));
const livestockCount = computed(() => Object.keys(activeLivestock.value).length);

function itemLabel(key: string): string {
  const names: Record<string, string> = {
    母猪检疫印章: '母猪检疫印章',
    母牛检疫印章: '母牛检疫印章',
    母狗检疫印章: '母狗检疫印章',
    母畜检疫特供印泥: '检疫特供印泥',
    转职卡: '转职卡',
    重修卡: '重修卡',
    重修稳定剂: '重修稳定剂',
    公交车经营许可证: '公交车经营许可证',
    公交车经营保险: '公交车经营保险',
    性病康复针剂: '性病康复针剂',
    无害人流丸: '无害人流丸',
  };
  return names[key] ?? key;
}

// 道具分类
const stampItems = computed(() => {
  const all = store.data.主角.道具栏;
  return { 母猪检疫印章: all.母猪检疫印章, 母牛检疫印章: all.母牛检疫印章, 母狗检疫印章: all.母狗检疫印章 };
});

const consumableItems = computed(() => {
  const all = store.data.主角.道具栏;
  return {
    母畜检疫特供印泥: all.母畜检疫特供印泥,
    转职卡: all.转职卡,
    重修卡: all.重修卡,
    重修稳定剂: all.重修稳定剂,
    公交车经营许可证: all.公交车经营许可证,
    公交车经营保险: all.公交车经营保险,
  };
});

const medicalItems = computed(() => {
  const all = store.data.主角.道具栏;
  return { 性病康复针剂: all.性病康复针剂, 无害人流丸: all.无害人流丸 };
});

// XP 进度
function xpNext(info: any): number {
  const thresholds = [0, 100, 300, 600, 1200];
  return thresholds[Math.min(info.等级, 4)] ?? 0;
}
function xpPercent(info: any): number {
  const next = xpNext(info);
  return next ? Math.min(100, (info.经验 / next) * 100) : 100;
}

// 样式辅助
function rateClass(rate: number): string {
  if (rate >= 80) return 'high';
  if (rate >= 50) return 'mid';
  return 'low';
}
function levelClass(lv: number): string {
  if (lv >= 4) return 'gold';
  if (lv >= 2) return 'silver';
  return '';
}
function statLevelClass(val: number): string {
  if (val >= 4) return 'stat-high';
  if (val >= 2) return 'stat-mid';
  return '';
}

// 商店数据
const oneTimeItems = [
  { name: '母猪检疫印章', price: '1,000 币', desc: '每用户限购一张' },
  { name: '母牛检疫印章', price: '1,000 币', desc: '每用户限购一张' },
  { name: '母狗检疫印章', price: '1,000 币', desc: '每用户限购一张' },
  { name: '母畜联名卡', price: '0 币', desc: '与农业银行联名借记卡' },
];

const repeatItems = [
  { name: '母畜检疫特供印泥', price: '5 币', desc: '每次检疫消耗一份' },
  { name: '转职卡', price: '30 币', desc: '转换母畜类型' },
  { name: '重修卡', price: '60 币', desc: '重置等级，保留属性效果' },
  { name: '重修稳定剂', price: '15 币', desc: '降低重修脱离风险' },
  { name: '公交车经营许可证', price: '20 币', desc: '母狗自主接客，嫖资上交' },
  { name: '公交车经营保险', price: '20 币', desc: '持证母狗免疫性病与怀孕' },
  { name: '性病康复针剂', price: '10 币', desc: '痊愈所有性病' },
  { name: '无害人流丸', price: '5 币', desc: '无伤害流产' },
  { name: '98软妹币（已扣税）', price: '1 币', desc: '兑换至联名卡余额' },
];
</script>

<style lang="scss" scoped>
.panel {
  width: 100%;
  border: 1px solid #c8c0b8;
  border-radius: 6px;
  overflow: hidden;
  background: #f7f3ed;
  font-size: 13px;
  line-height: 1.5;
  color: #3a322e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  background: linear-gradient(180deg, #faf7f2, #f0ebe3);
  border-bottom: 1px solid #d9d0c7;

  &:hover { background: linear-gradient(180deg, #f5f0e8, #ebe3d9); }

  .fa-chevron-down, .fa-chevron-right {
    font-size: 11px;
    width: 14px;
    color: #8c8279;
  }
  .header-icon { color: #c00000; font-size: 15px; }
  .header-title { font-weight: 700; font-size: 14px; }
}

// Tabs
.tabs {
  display: flex;
  background: #ebe4da;
  border-bottom: 1px solid #c8c0b8;

  button {
    flex: 1;
    padding: 8px 4px;
    border: none;
    background: none;
    font-size: 12px;
    cursor: pointer;
    color: #8c8279;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: color 0.15s, background 0.15s;

    .fa { font-size: 12px; }

    &.active {
      color: #3a322e;
      font-weight: 600;
      background: #f7f3ed;
      box-shadow: inset 0 -2px 0 #c00000;
    }

    &:hover:not(.active) { color: #5a524a; background: rgba(0, 0, 0, 0.03); }
  }
}

.tab-body {
  padding: 10px 14px;
  min-height: 60px;
  height: 360px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c8c0b8 #f7f3ed;
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// Empty state
.empty {
  text-align: center;
  color: #b0a69e;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .empty-icon { font-size: 24px; opacity: 0.4; }
  .empty-hint { font-size: 11px; opacity: 0.6; margin-top: 2px; }
}

// Cards
.card {
  border: 1px solid #e0d8cf;
  background: #ffffff;
  border-radius: 5px;
  padding: 8px 12px;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;

  .name { font-weight: 600; font-size: 13px; }
  .level-badge {
    margin-left: auto;
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 10px;
    font-weight: 600;
    color: #8c8279;

    &.silver { background: #e8e4e0; color: #6b625b; }
    &.gold { background: #faf0d7; color: #8b6914; }
  }
}

// Tags
.tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;

  &.rating {
    background: #faf0d7;
    color: #8b6914;
  }
  &.type {
    color: #fff;
    &.母猪 { background: #c62828; }
    &.母牛 { background: #6d4c41; }
    &.母狗 { background: #ef6c00; }
  }
}

// Key-value rows
.kv {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  border-bottom: 1px solid #f2efe9;

  &:last-child { border-bottom: none; }
  &.dim { opacity: 0.35; }
  &.highlight { background: #fdf8f0; margin: 0 -12px; padding: 3px 12px; }
  &.warn { color: #c62828; font-size: 11px; }

  > span:first-child { flex-shrink: 0; min-width: 60px; color: #6b625b; }
  .val {
    font-weight: 500;
    text-align: right;
    min-width: 30px;
    &.high { color: #2e7d32; font-weight: 600; }
    &.mid { color: #ef6c00; font-weight: 600; }
    &.low { color: #c62828; font-weight: 600; }
    &.has-points { color: #c00000; font-weight: 600; }
    &.primary { color: #c00000; font-weight: 700; font-size: 14px; }
  }
  .hint {
    color: #b0a69e;
    font-size: 10px;
    flex-shrink: 0;
  }
}

// Progress bars
.bar-track {
  flex: 1;
  height: 6px;
  background: #e8e4e0;
  border-radius: 3px;
  overflow: hidden;

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;

    &.fav { background: #c00000; }
    &.corr { background: #6a1b9a; }
    &.xp { background: #2e7d32; }
  }
}

// Stat grid
.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 4px 0;

  .stat {
    text-align: center;

    label {
      display: block;
      font-size: 10px;
      color: #999;
    }
    span {
      font-size: 14px;
      font-weight: 600;

      &.stat-high { color: #e65100; }
      &.stat-mid { color: #5d4037; }
    }
  }
}

// Shop
.shop-item {
  padding: 6px 0;
  border-bottom: 1px solid #f2efe9;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 1px 8px;

  &:last-child { border-bottom: none; }

  .shop-name { font-weight: 500; }
  .shop-price {
    text-align: right;
    font-weight: 600;
    color: #c00000;
    grid-row: 1 / 3;
    align-self: center;
  }
  .shop-desc {
    font-size: 11px;
    color: #8c8279;
    grid-column: 1;
  }
}

// Sections
.section {
  .section-title {
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 6px;
    padding-bottom: 5px;
    border-bottom: 1px solid #d9d0c7;
    color: #5a524a;

    .fa { margin-right: 4px; color: #c00000; width: 14px; }
  }
  & + & { margin-top: 14px; }
}

// Transitions
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to, .slide-leave-from {
  max-height: 2000px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>