<template>
  <div class="panel">
    <div class="header" @click="expanded = !expanded">
      <i class="fa" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <span class="header-title">母畜养殖系统</span>
    </div>
    <div v-if="expanded" class="body">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
          :class="{ active: activeTab === tab }">{{ tab }}</button>
      </div>
      <div class="content">
        <!-- Tab: 目标 -->
        <div v-if="activeTab === '目标'" class="tab-pane">
          <div v-if="!candidates.length" class="empty">暂无备选母畜</div>
          <div v-for="(c, name) in candidates" :key="name" class="card">
            <div class="card-header">{{ name }} <span class="rating" v-if="c.母畜评级">{{ c.母畜评级 }}</span></div>
            <div class="row"><span>好感度</span><span>{{ c.好感度 }}</span></div>
            <div class="row"><span>堕落值</span><span>{{ c.堕落值 }}</span></div>
            <div class="row"><span>检疫成功率</span><span>{{ c.成功率 }}%</span></div>
          </div>
        </div>

        <!-- Tab: 母畜 -->
        <div v-if="activeTab === '母畜'" class="tab-pane">
          <div v-if="!livestock.length" class="empty">暂无母畜</div>
          <div v-for="(m, name) in livestock" :key="name" class="card">
            <div class="card-header">
              {{ name }}
              <span class="badge" :class="m.类型">{{ m.类型 }}</span>
              <span class="level">lv.{{ m.等级 }}</span>
            </div>
            <div class="row"><span>经验</span><span>{{ m.经验 }}</span></div>
            <div class="row"><span>自由点数</span><span>{{ m.自由点数 }}</span></div>
            <div class="attrs">
              <div class="attr"><label>乳房</label><span>{{ m.乳房 }}</span></div>
              <div class="attr"><label>臀部</label><span>{{ m.臀部 }}</span></div>
              <div class="attr"><label>子宫</label><span>{{ m.子宫 }}</span></div>
              <div class="attr"><label>阴道</label><span>{{ m.阴道 }}</span></div>
              <div class="attr"><label>肛门</label><span>{{ m.肛门 }}</span></div>
            </div>
            <div class="row" v-if="m.重修次数"><span>重修次数</span><span>{{ m.重修次数 }}</span></div>
          </div>
        </div>

        <!-- Tab: 道具 -->
        <div v-if="activeTab === '道具'" class="tab-pane">
          <div v-for="(qty, name) in data.主角.道具栏" :key="name" class="row" :class="{ dim: !qty }">
            <span>{{ itemLabel(name) }}</span><span>{{ qty }}</span>
          </div>
        </div>

        <!-- Tab: 商店 -->
        <div v-if="activeTab === '商店'" class="tab-pane">
          <div class="section">
            <div class="section-title"><i class="fa fa-money"></i> 财务概览</div>
            <div class="row"><span>母畜币</span><span>{{ data.主角.母畜币 }}</span></div>
            <div class="row"><span>卡内余额</span><span>&yen;{{ data.主角.联名卡余额 }}<small>（次日4点自动兑换）</small></span></div>
            <div class="row"><span>卡外资产</span><span>&yen;{{ data.主角.卡外资产 }}</span></div>
          </div>
          <div class="section">
            <div class="section-title"><i class="fa fa-shopping-cart"></i> 可购买商品</div>
            <div v-for="item in shopItems" :key="item.name" class="row">
              <span>{{ item.name }}</span>
              <span>{{ item.price }} 母畜币 <small v-if="item.once">（限购一次）</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from './store';

const data = useDataStore();
const expanded = ref(false);
const activeTab = ref('目标');
const tabs = ['目标', '母畜', '道具', '商店'];

const candidates = computed(() => data.备选母畜 ?? {});
const livestock = computed(() => data.母畜 ?? {});

const itemLabels: Record<string, string> = {
  母猪检疫印章: '母猪检疫印章',
  母牛检疫印章: '母牛检疫印章',
  母狗检疫印章: '母狗检疫印章',
  母畜检疫特供印泥: '检疫特供印泥',
  转职卡: '转职卡',
  重修卡: '重修卡',
  重修稳定剂: '重修稳定剂',
};

function itemLabel(key: string) {
  return itemLabels[key] ?? key;
}

const shopItems = [
  { name: '母猪检疫印章', price: 1000, once: true },
  { name: '母牛检疫印章', price: 1000, once: true },
  { name: '母狗检疫印章', price: 1000, once: true },
  { name: '母畜联名卡', price: 0, once: true },
  { name: '母畜检疫特供印泥', price: '?', once: false },
  { name: '转职卡', price: '?', once: false },
  { name: '重修卡', price: '?', once: false },
  { name: '重修稳定剂', price: '?', once: false },
  { name: '95软妹币（已扣税）', price: '?', once: false },
];
</script>

<style lang="scss" scoped>
.panel {
  width: 100%;
  border: 1px solid #c0c0c0;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  &:hover { background: rgba(0,0,0,0.03); }
  .fa { font-size: 12px; width: 14px; }
  .header-title { font-weight: 600; }
}

.body {
  border-top: 1px solid #c0c0c0;
}

.tabs {
  display: flex;
  gap: 0;
  background: #f5f5f5;
  border-bottom: 1px solid #c0c0c0;
  button {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: none;
    font-size: 13px;
    cursor: pointer;
    color: #666;
    &.active { color: #333; font-weight: 600; background: #fff; border-bottom: 2px solid #c00000; }
    &:hover:not(.active) { background: rgba(0,0,0,0.04); }
  }
}

.content {
  padding: 8px 12px;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 12px 0;
}

.card {
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
  .card-header {
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.rating {
  font-size: 11px;
  background: #fff3cd;
  color: #856404;
  padding: 0 4px;
}

.badge {
  font-size: 11px;
  padding: 0 5px;
  border-radius: 3px;
  color: #fff;
  &.母猪 { background: #e91e63; }
  &.母牛 { background: #795548; }
  &.母狗 { background: #ff9800; }
}

.level {
  font-size: 11px;
  color: #666;
  margin-left: auto;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: none; }
  small { color: #999; font-size: 11px; margin-left: 4px; }
  &.dim { opacity: 0.4; }
}

.attrs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 4px 0;
  .attr {
    text-align: center;
    label { display: block; font-size: 10px; color: #888; }
    span { font-size: 13px; font-weight: 500; }
  }
}

.section {
  .section-title {
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #ddd;
    .fa { margin-right: 4px; }
  }
  & + & { margin-top: 10px; }
}
</style>