<template>
  <div class="panel">
    <div class="header" @click="expanded = !expanded">
      <i class="fa" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <i class="fa fa-pagelines header-icon"></i>
      <span class="header-title">母畜养殖系统</span><span class="header-coin"><i class="fa fa-circle"></i> {{ store.data.主角.母畜币 }} 母畜币</span>
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

            <!-- 基础 -->
            <div v-if="activeTab === 'basic'" class="pane">
                            <div class="section">
                <div class="section-title"><i class="fa fa-money"></i> 资产</div>
                <div class="kv"><span>联名卡余额</span><span class="val">&yen;{{ store.data.主角.联名卡余额.toLocaleString() }}</span><small class="hint">次日 4:00 自动兑换</small></div>
                <div class="kv"><span>卡外资产</span><span class="val">&yen;{{ store.data.主角.卡外资产.toLocaleString() }}</span></div>
              </div><div class="section">
                <div class="section-title"><i class="fa fa-wrench"></i> 可用技能</div>
                <div class="skill-card" v-for="skill in skills" :key="skill.name" :class="{ disabled: !skill.available }">
                  <div class="skill-head">
                    <i class="fa" :class="skill.icon"></i>
                    <span class="skill-name">{{ skill.name }}</span>
                    <span v-if="!skill.available" class="tag unavailable">不可用</span>
                    <span v-else class="tag available">可用</span>
                  </div>
                  <div class="skill-desc">{{ skill.desc }}</div>
                  <div v-if="skill.cost" class="skill-cost"><i class="fa fa-circle"></i> {{ skill.cost }}</div>
                </div>
              </div>
              <div class="section">
                <div class="section-title"><i class="fa fa-home"></i> 特殊建造</div>
                <div v-if="!roomCount" class="kv dim"><span>暂无已建房间</span><span class="val">—</span></div>
                <div class="kv" v-for="(info, name) in store.data.主角.特殊建造" :key="name">
                  <span><i class="fa" :class="roomIcon(String(name))"></i> {{ name }}</span>
                  <span class="val">{{ info.面积 }} m²</span>
                </div>
                <div v-if="roomCount" class="room-loc" v-for="(info, name) in store.data.主角.特殊建造" :key="'loc-'+name">
                  <span class="loc-label">位置</span><span>{{ info.位置 }}</span>
                </div>
              </div>

            </div>

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
              <div class="shop-grid">
                <div
                  v-for="item in shopItems"
                  :key="item.id"
                  class="shop-card"
                  :class="{ disabled: item.once && isShopItemPurchased(item.id) }"
                  @click="!item.once || !isShopItemPurchased(item.id) ? openShopDetail(item) : undefined"
                >
                  <div class="shop-card-icon"><i class="fa" :class="item.icon"></i></div>
                  <div class="shop-card-name">{{ item.name }}</div>
                  <div class="shop-card-price"><i class="fa fa-circle"></i> {{ item.price }}</div>
                  <div v-if="item.once && isShopItemPurchased(item.id)" class="shop-card-overlay">
                    <i class="fa fa-check-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

  </div>

  <!-- 商品详情弹窗 -->
  <transition name="fade">
    <div v-if="selectedItem" class="shop-modal-backdrop" @click.self="selectedItem = null">
      <div class="shop-modal">
        <div class="shop-modal-icon"><i class="fa" :class="selectedItem.icon"></i></div>
        <div class="shop-modal-name">{{ selectedItem.name }}</div>
        <div class="shop-modal-price"><i class="fa fa-circle"></i> {{ selectedItem.price }} 母畜币</div>
        <div class="shop-modal-desc">{{ selectedItem.desc }}</div>
        <div v-if="!selectedItem.once && selectedItem.invKey" class="shop-modal-qty">
          当前持有: {{ store.data.主角.道具栏[selectedItem.invKey] || 0 }}
        </div>
        <button class="shop-modal-close" @click="selectedItem = null">
          <i class="fa fa-times"></i> 关闭
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

const expanded = ref(false);
const activeTab = ref('basic');

const tabs = [
    { key: 'basic', label: '基础', icon: 'fa-home' },
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

// 基础 tab
const roomCount = computed(() => Object.keys(store.data.主角.特殊建造).length);


const skills = computed(() => {
  const { 道具栏, 母畜币 } = store.data.主角;
  const hasStamp = 道具栏.母猪检疫印章 > 0 || 道具栏.母牛检疫印章 > 0 || 道具栏.母狗检疫印章 > 0;
  const hasInk = 道具栏.母畜检疫特供印泥 > 0;
  const hasLivestock = livestockCount.value > 0;

  return [
    { name: '母畜鉴定', icon: 'fa-search', desc: '鉴定指定母畜的详细属性信息', cost: '1 母畜币', available: 母畜币 >= 1 },
    { name: '母畜检疫', icon: 'fa-stamp', desc: '对备选母畜发起检疫，成功后转化为母畜', cost: '1 印泥', available: hasStamp && hasInk },
    { name: '特殊建造', icon: 'fa-building', desc: '花费母畜币将封闭空间改造为特殊功能房间', cost: '1~8 母畜币/m²', available: 母畜币 >= 1 },
    { name: '远程指挥', icon: 'fa-bullhorn', desc: '母畜遭遇危险时远程下达命令', cost: null, available: hasLivestock },
  ];
});

function roomIcon(roomType: string): string {
  const icons: Record<string, string> = {
    爱欲房间: 'fa-heart',
    繁育室: 'fa-child',
    育儿室: 'fa-graduation-cap',
    榨乳室: 'fa-tint',
    改造室: 'fa-wrench',
    接待室: 'fa-door-open',
  };
  return icons[roomType] ?? 'fa-home';
}

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


const selectedItem = ref<ShopItem | null>(null);

interface ShopItem {
  id: string;
  name: string;
  price: number;
  once: boolean;
  icon: string;
  desc: string;
  invKey?: string;
}

const shopItems: ShopItem[] = [
  { id: '母猪检疫印章', name: '母猪检疫印章', price: 1000, once: true, icon: 'fa-stamp', desc: '执行母畜检疫的印章，母猪版。每用户仅限购一张。', invKey: '母猪检疫印章' },
  { id: '母牛检疫印章', name: '母牛检疫印章', price: 1000, once: true, icon: 'fa-stamp', desc: '执行母畜检疫的印章，母牛版。每用户仅限购一张。', invKey: '母牛检疫印章' },
  { id: '母狗检疫印章', name: '母狗检疫印章', price: 1000, once: true, icon: 'fa-stamp', desc: '执行母畜检疫的印章，母狗版。每用户仅限购一张。', invKey: '母狗检疫印章' },
  { id: '母畜联名卡', name: '母畜联名卡', price: 0, once: true, icon: 'fa-credit-card', desc: '与农业银行联名的借记卡，兼具正常借记卡全部功能。免费领取。', invKey: undefined },
  { id: '母畜检疫特供印泥', name: '检疫特供印泥', price: 5, once: false, icon: 'fa-tint', desc: '与检疫印章配合使用的消耗品，每次检疫消耗一份。用后紫色消失只剩白色棉垫。', invKey: '母畜检疫特供印泥' },
  { id: '转职卡', name: '转职卡', price: 30, once: false, icon: 'fa-exchange', desc: '对指定母畜使用，使其在母猪/母牛/母狗三种类型之间转化。消耗品，单只母畜单次使用。', invKey: '转职卡' },
  { id: '重修卡', name: '重修卡', price: 60, once: false, icon: 'fa-refresh', desc: '使指定母畜回到 lv.0，已加点的属性效果保留，可重新升级获取自由点数。消耗品。', invKey: '重修卡' },
  { id: '重修稳定剂', name: '重修稳定剂', price: 15, once: false, icon: 'fa-shield', desc: '配合重修道具使用，降低重修时脱离母畜化的风险。可与重修道具叠加使用。', invKey: '重修稳定剂' },
  { id: '公交车经营许可证', name: '公交车经营许可证', price: 20, once: false, icon: 'fa-bus', desc: '颁发给任意母狗后，该母狗会自主寻找客户卖淫，所有嫖资上交宿主。一次性，颁发后有效。', invKey: '公交车经营许可证' },
  { id: '公交车经营保险', name: '公交车经营保险', price: 20, once: false, icon: 'fa-shield', desc: '为持有许可证的母狗提供保护，使其免疫性病且内射不怀孕。预防性道具，已孕或已感染无效。', invKey: '公交车经营保险' },
  { id: '性病康复针剂', name: '性病康复针剂', price: 10, once: false, icon: 'fa-medkit', desc: '注射后痊愈所有性病。一次性，对所有人可用。', invKey: '性病康复针剂' },
  { id: '无害人流丸', name: '无害人流丸', price: 5, once: false, icon: 'fa-medkit', desc: '塞入怀孕者子宫后无伤害完成流产。一次性，对所有人可用。', invKey: '无害人流丸' },
  { id: '98软妹币', name: '98软妹币（已扣税）', price: 1, once: false, icon: 'fa-money', desc: '以母畜币兑换为RMB，到账至联名卡余额。到账后请在次日凌晨4点前取出。', invKey: undefined },
];

function isShopItemPurchased(id: string): boolean {
  const items = store.data.主角.道具栏;
  if (id === '母畜联名卡') return store.data.主角.已购道具.母畜联名卡;
  if (id === '母猪检疫印章') return items.母猪检疫印章 > 0;
  if (id === '母牛检疫印章') return items.母牛检疫印章 > 0;
  if (id === '母狗检疫印章') return items.母狗检疫印章 > 0;
  return false;
}

function openShopDetail(item: ShopItem) {
  selectedItem.value = item;
}

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
  .header-coin { margin-left: auto; font-weight: 600; font-size: 12px; color: #c00000; display: flex; align-items: center; gap: 4px; .fa-circle { font-size: 8px; } }
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
  height: 360px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c8c0b8 #f7f3ed;
  display: flex;
  flex-direction: column;
}

.pane {
  flex: 1;
  min-height: 0;
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
  justify-content: center;
  flex: 1;

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


// Skill cards
.skill-card {
  padding: 8px 12px;
  border: 1px solid #e0d8cf;
  border-radius: 5px;
  background: #ffffff;
  margin-bottom: 6px;

  &:last-child { margin-bottom: 0; }
  &.disabled { opacity: 0.45; .skill-head .fa { color: #999; } }

  .skill-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;

    .fa { color: #c00000; font-size: 13px; }
    .skill-name { font-weight: 600; font-size: 13px; }
  }
  .skill-desc { font-size: 11px; color: #8c8279; padding-left: 19px; }
  .skill-cost {
    font-size: 10px;
    color: #c00000;
    font-weight: 500;
    padding-left: 19px;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 3px;
    .fa-circle { font-size: 7px; }
  }
}

.tag.available { background: #e8f5e9; color: #2e7d32; }
.tag.unavailable { background: #fce4ec; color: #c62828; }

.room-loc {
  font-size: 11px;
  color: #8c8279;
  padding: 0 0 0 6px;
  display: flex;
  gap: 6px;

  .loc-label { color: #b0a69e; flex-shrink: 0; }
}


// Shop grid
.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.shop-card {
  position: relative;
  border: 1px solid #e0d8cf;
  border-radius: 6px;
  background: #ffffff;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, opacity 0.15s;
  overflow: hidden;

  &:hover:not(.disabled) {
    border-color: #c00000;
    box-shadow: 0 2px 8px rgba(192, 0, 0, 0.12);
    transform: translateY(-1px);
  }

  &.disabled {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }

  .shop-card-icon {
    font-size: 22px;
    color: #c00000;
    margin-bottom: 4px;
    .fa-stamp { color: #5d4037; }
  }

  .shop-card-name {
    font-size: 11px;
    font-weight: 600;
    color: #3a322e;
    margin-bottom: 3px;
    line-height: 1.3;
  }

  .shop-card-price {
    font-size: 11px;
    color: #c00000;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    .fa-circle { font-size: 7px; }
  }

  .shop-card-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 16px;
    color: #2e7d32;
    opacity: 0.9;
  }
}

// Shop modal
.shop-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.shop-modal {
  background: #faf7f2;
  border: 1px solid #c8c0b8;
  border-radius: 8px;
  padding: 20px 24px;
  max-width: 300px;
  width: 85%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  .shop-modal-icon {
    font-size: 36px;
    color: #c00000;
    margin-bottom: 8px;
  }

  .shop-modal-name {
    font-size: 16px;
    font-weight: 700;
    color: #3a322e;
    margin-bottom: 6px;
  }

  .shop-modal-price {
    font-size: 13px;
    color: #c00000;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    .fa-circle { font-size: 8px; }
  }

  .shop-modal-desc {
    font-size: 12px;
    color: #6b625b;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .shop-modal-qty {
    font-size: 12px;
    color: #2e7d32;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .shop-modal-close {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 18px;
    border: 1px solid #c8c0b8;
    border-radius: 4px;
    background: #f7f3ed;
    color: #5a524a;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #ebe4da; }
    .fa { font-size: 11px; }
  }
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
