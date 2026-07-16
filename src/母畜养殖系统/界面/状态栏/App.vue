<template>
  <div class="panel">
    <div class="header" @click="expanded = !expanded">
      <i class="fa" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <span class="header-title">母畜养殖系统</span>
    </div>

    <template v-if="expanded">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>

      <div class="tab-body">
        <!-- 目标（备选母畜） -->
        <div v-show="activeTab === '目标'" class="pane">
          <div v-if="!candidateCount" class="empty">暂无备选母畜</div>
          <div v-for="(info, name) in store.data.备选母畜" :key="name" class="card">
            <div class="card-head">
              <span class="name">{{ name }}</span>
              <span v-if="info.母畜评级" class="tag rating">{{ info.母畜评级 }}</span>
            </div>
            <div class="kv"><span>好感度</span><span>{{ info.好感度 }}</span></div>
            <div class="kv"><span>堕落值</span><span>{{ info.堕落值 }}</span></div>
            <div class="kv"><span>检疫成功率</span><span>{{ info.成功率 }}%</span></div>
          </div>
        </div>

        <!-- 母畜 -->
        <div v-show="activeTab === '母畜'" class="pane">
          <div v-if="!livestockCount" class="empty">暂无母畜</div>
          <div v-for="(info, name) in store.data.母畜" :key="name" class="card">
            <div class="card-head">
              <span class="name">{{ name }}</span>
              <span class="tag type" :class="info.类型">{{ info.类型 }}</span>
              <span class="level">lv.{{ info.等级 }}</span>
            </div>
            <div class="kv"><span>经验</span><span>{{ info.经验 }}</span></div>
            <div class="kv"><span>自由点数</span><span>{{ info.自由点数 }}</span></div>
            <div class="stat-grid">
              <div class="stat"><label>乳房</label><span>{{ info.乳房 }}</span></div>
              <div class="stat"><label>臀部</label><span>{{ info.臀部 }}</span></div>
              <div class="stat"><label>子宫</label><span>{{ info.子宫 }}</span></div>
              <div class="stat"><label>阴道</label><span>{{ info.阴道 }}</span></div>
              <div class="stat"><label>肛门</label><span>{{ info.肛门 }}</span></div>
            </div>
            <div v-if="info.重修次数" class="kv"><span>重修次数</span><span>{{ info.重修次数 }}</span></div>
          </div>
        </div>

        <!-- 道具 -->
        <div v-show="activeTab === '道具'" class="pane">
          <div v-for="(qty, name) in store.data.主角.道具栏" :key="name" class="kv" :class="{ dim: !qty }">
            <span>{{ itemLabel(name) }}</span><span>{{ qty }}</span>
          </div>
        </div>

        <!-- 商店 -->
        <div v-show="activeTab === '商店'" class="pane">
          <div class="section">
            <div class="section-title"><i class="fa fa-money"></i> 财务</div>
            <div class="kv"><span>母畜币</span><span>{{ store.data.主角.母畜币 }}</span></div>
            <div class="kv"><span>联名卡余额</span><span>&yen;{{ store.data.主角.联名卡余额 }} <small>（次日 4:00 自动兑换）</small></span></div>
            <div class="kv"><span>卡外资产</span><span>&yen;{{ store.data.主角.卡外资产 }}</span></div>
          </div>
          <div class="section">
            <div class="section-title"><i class="fa fa-shopping-cart"></i> 商品</div>
            <div v-for="item in shopItems" :key="item.name" class="kv">
              <span>{{ item.name }}</span><span>{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();

const expanded = ref(false);
const activeTab = ref('目标');
const tabs = ['目标', '母畜', '道具', '商店'];

const candidateCount = computed(() => Object.keys(store.data.备选母畜).length);
const livestockCount = computed(() => Object.keys(store.data.母畜).length);

const itemNames: Record<string, string> = {
  母猪检疫印章: '母猪检疫印章',
  母牛检疫印章: '母牛检疫印章',
  母狗检疫印章: '母狗检疫印章',
  母畜检疫特供印泥: '检疫特供印泥',
  转职卡: '转职卡',
  重修卡: '重修卡',
  重修稳定剂: '重修稳定剂',
};

function itemLabel(key: string): string {
  return itemNames[key] ?? key;
}

const shopItems = [
  { name: '母猪检疫印章', price: '1000 母畜币' },
  { name: '母牛检疫印章', price: '1000 母畜币' },
  { name: '母狗检疫印章', price: '1000 母畜币' },
  { name: '母畜检疫特供印泥', price: '5 母畜币' },
  { name: '转职卡', price: '30 母畜币' },
  { name: '重修卡', price: '60 母畜币' },
  { name: '重修稳定剂', price: '15 母畜币' },
  { name: '95软妹币（已扣税）', price: '1 母畜币' },
];
</script>

<style lang="scss" scoped>
.panel {
  width: 100%;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f1ec;
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

  &:hover { background: rgba(0, 0, 0, 0.03); }

  .fa {
    font-size: 12px;
    width: 14px;
  }

  .header-title { font-weight: 600; }
}

.tabs {
  display: flex;
  background: #e6e0d8;
  border-top: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;

  button {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: none;
    font-size: 13px;
    cursor: pointer;
    color: #666;

    &.active {
      color: #333;
      font-weight: 600;
      background: #fff;
      border-bottom: 2px solid #c00000;
    }

    &:hover:not(.active) { background: rgba(0, 0, 0, 0.04); }
  }
}

.tab-body {
  padding: 8px 12px;
  background: #f5f1ec;
}

.pane {
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
  background: #ffffff;
  border-radius: 4px;
  padding: 6px 10px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;

  .name { font-weight: 600; }
  .level { font-size: 11px; color: #666; margin-left: auto; }
}

.tag {
  font-size: 11px;
  padding: 0 5px;

  &.rating {
    background: #fff3cd;
    color: #856404;
  }

  &.type {
    color: #fff;
    &.母猪 { background: #e91e63; }
    &.母牛 { background: #795548; }
    &.母狗 { background: #ff9800; }
  }
}

.kv {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child { border-bottom: none; }

  small {
    color: #999;
    font-size: 11px;
    margin-left: 4px;
  }

  &.dim { opacity: 0.4; }
}

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
      color: #888;
    }

    span {
      font-size: 13px;
      font-weight: 500;
    }
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
