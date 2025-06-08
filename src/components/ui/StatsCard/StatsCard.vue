<script setup lang="ts">
interface Props {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease';
  };
  icon?: any;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});
</script>

<template>
  <div class="tw-bg-card tw-overflow-hidden tw-shadow tw-rounded-lg">
    <div class="tw-p-5">
      <div class="tw-flex tw-items-center">
        <div class="tw-flex-shrink-0">
          <component v-if="icon && !loading" :is="icon" class="tw-h-6 tw-w-6 tw-text-muted-foreground"
            aria-hidden="true" />
          <div v-else-if="loading" class="tw-h-6 tw-w-6 tw-bg-muted tw-rounded tw-animate-pulse"></div>
        </div>
        <div class="tw-ml-5 tw-w-0 tw-flex-1">
          <dl>
            <dt class="tw-text-sm tw-font-medium tw-text-muted-foreground tw-truncate">
              <div v-if="loading" class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse tw-w-24"></div>
              <span v-else>{{ title }}</span>
            </dt>
            <dd>
              <div class="tw-text-lg tw-font-medium tw-text-foreground">
                <div v-if="loading" class="tw-h-6 tw-bg-muted tw-rounded tw-animate-pulse tw-w-16"></div>
                <span v-else>{{ typeof value === 'number' ? value.toLocaleString() : value }}</span>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="change && !loading" class="tw-bg-muted tw-px-5 tw-py-3">
      <div class="tw-text-sm">
        <span :class="[
          'tw-font-medium',
          change.type === 'increase' ? 'tw-text-success' : 'tw-text-destructive'
        ]">
          {{ change.type === 'increase' ? '↗' : '↘' }}
          {{ change.value }}
        </span>
        <span class="tw-text-muted-foreground tw-ml-1">from last period</span>
      </div>
    </div>
    <div v-else-if="loading" class="tw-bg-muted tw-px-5 tw-py-3">
      <div class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse tw-w-32"></div>
    </div>
  </div>
</template>
