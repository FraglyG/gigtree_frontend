<script setup lang="ts">
interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => string;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortOrder: 'desc'
});

const emit = defineEmits<{
  sort: [column: string, order: 'asc' | 'desc'];
  rowClick: [row: any];
}>();

function handleSort(column: TableColumn) {
  if (!column.sortable) return;

  const newOrder = props.sortBy === column.key && props.sortOrder === 'desc' ? 'asc' : 'desc';
  emit('sort', column.key, newOrder);
}

function getSortIcon(column: TableColumn) {
  if (!column.sortable) return '';
  if (props.sortBy !== column.key) return '↕️';
  return props.sortOrder === 'asc' ? '↑' : '↓';
}
</script>

<template>
  <div class="tw-overflow-x-auto tw-bg-card tw-rounded-lg tw-shadow">
    <table class="tw-min-w-full tw-divide-y tw-divide-border">
      <thead class="tw-bg-muted">
        <tr>
          <th v-for="column in columns" :key="column.key" :class="[
            'tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-muted-foreground tw-uppercase tw-tracking-wider',
            column.sortable ? 'tw-cursor-pointer hover:tw-bg-accent' : ''
          ]" @click="handleSort(column)">
            <div class="tw-flex tw-items-center tw-space-x-1">
              <span>{{ column.title }}</span>
              <span v-if="column.sortable" class="tw-text-muted-foreground">{{ getSortIcon(column) }}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody v-if="!loading" class="tw-bg-card tw-divide-y tw-divide-border">
        <tr v-for="(row, index) in data" :key="index" class="hover:tw-bg-accent tw-cursor-pointer"
          @click="emit('rowClick', row)">
          <td v-for="column in columns" :key="column.key"
            class="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-foreground">
            <slot :name="`cell-${column.key}`" :row="row" :column="column">
              <span v-if="column.render" v-html="column.render(row[column.key], row)"></span>
              <span v-else>{{ row[column.key] || '-' }}</span>
            </slot>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="tw-px-6 tw-py-4 tw-text-center tw-text-muted-foreground">
            No data available
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="i in 5" :key="`loading-${i}`">
          <td v-for="column in columns" :key="column.key" class="tw-px-6 tw-py-4 tw-whitespace-nowrap">
            <div class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
