<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { adminApi, type DashboardOverview, type SystemHealth } from '@/lib/adminApi';
import { StatsCard } from '@/components/ui/StatsCard';

const UsersIcon = { template: '<div class="tw-w-6 tw-h-6 tw-bg-blue-500 tw-rounded"></div>' };
const ClipboardIcon = { template: '<div class="tw-w-6 tw-h-6 tw-bg-green-500 tw-rounded"></div>' };
const ChatIcon = { template: '<div class="tw-w-6 tw-h-6 tw-bg-purple-500 tw-rounded"></div>' };

interface Props {
  dashboardData: DashboardOverview | null;
  systemHealth: SystemHealth | null;
  loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  refresh: [];
}>();

const userGrowthData = ref<{ date: string; count: number }[]>([]);
const growthLoading = ref(false);
const selectedDays = ref(7);

const daysOptions = [7, 14, 30, 60, 90];

// Stats for the overview cards
const growthStats = computed(() => {
  if (!props.dashboardData) return [];
  const data = props.dashboardData;
  return [
    {
      title: 'Total Users',
      value: data.totals?.users || 0,
      change: { value: data.recentActivity?.newUsers || 0, type: 'increase' as const },
      icon: UsersIcon
    },
    {
      title: 'Total Listings',
      value: data.totals?.listings || 0,
      change: { value: data.recentActivity?.newListings || 0, type: 'increase' as const },
      icon: ClipboardIcon
    },
    {
      title: 'Total Messages',
      value: data.totals?.messages || 0,
      change: { value: data.recentActivity?.newMessages || 0, type: 'increase' as const },
      icon: ChatIcon
    },
    {
      title: 'Active Users',
      value: data.userStats?.verified || 0,
      icon: UsersIcon
    }
  ];
});

const moderationStats = computed(() => {
  if (!props.dashboardData) return [];
  return [
    {
      title: 'Banned Users',
      value: props.dashboardData.userStats.banned,
      icon: { template: '<div class="tw-w-6 tw-h-6 tw-bg-red-500 tw-rounded"></div>' }
    },
    {
      title: 'Muted Users',
      value: props.dashboardData.userStats.muted,
      icon: { template: '<div class="tw-w-6 tw-h-6 tw-bg-orange-500 tw-rounded"></div>' }
    },
    {
      title: 'Job Listing Banned',
      value: props.dashboardData.userStats.jobListingBanned,
      icon: { template: '<div class="tw-w-6 tw-h-6 tw-bg-yellow-500 tw-rounded"></div>' }
    },
    {
      title: 'Verified Users',
      value: props.dashboardData.userStats.verified,
      icon: { template: '<div class="tw-w-6 tw-h-6 tw-bg-green-500 tw-rounded"></div>' }
    }
  ];
});

const systemStatus = computed(() => {
  if (!props.systemHealth) return 'unknown';

  const dbStatus = props.systemHealth.database.status;
  const responseTime = props.systemHealth.database.responseTime;

  if (dbStatus === 'disconnected') return 'critical';
  if (responseTime > 1000) return 'warning';
  return 'healthy';
});

// Add a computed property to safely access memory usage
const memoryUsage = computed(() => {
  if (!props.systemHealth?.server?.memoryUsage) return { used: 0, total: 0 };
  const memory = props.systemHealth.server.memoryUsage;
  return {
    used: memory.heapUsed || 0,
    total: memory.heapTotal || 0
  };
});

async function loadUserGrowthData() {
  growthLoading.value = true;
  try {
    userGrowthData.value = await adminApi.getUserGrowthData(selectedDays.value);
  } catch (error) {
    console.error('Failed to load user growth data:', error);
    // Set empty data on error to prevent infinite loading
    userGrowthData.value = [];
  } finally {
    growthLoading.value = false;
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

onMounted(() => {
  loadUserGrowthData();
});
</script>

<template>
  <div class="tw-space-y-6">
    <!-- Overall System Status -->
    <div class="tw-bg-card tw-shadow tw-rounded-lg tw-p-6">
      <div class="tw-flex tw-items-center tw-justify-between">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Overall System Status</h3>
        <span :class="[
          'tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium',
          systemStatus === 'healthy' ? 'tw-bg-success/10 tw-text-success' :
            systemStatus === 'warning' ? 'tw-bg-warning/10 tw-text-warning' :
              systemStatus === 'critical' ? 'tw-bg-destructive/10 tw-text-destructive' :
                'tw-bg-muted tw-text-muted-foreground'
        ]">
          {{ systemStatus === 'healthy' ? 'All Systems Operational' :
            systemStatus === 'warning' ? 'Performance Issues Detected' :
              systemStatus === 'critical' ? 'Critical Issues' :
                'Status Unknown' }}
        </span>
      </div>
    </div>

    <!-- Growth Statistics -->
    <div>
      <h3 class="tw-text-lg tw-font-medium tw-text-foreground tw-mb-4">Userbase Overview</h3>
      <div class="tw-grid tw-gap-5 tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
        <StatsCard v-for="stat in growthStats" :key="stat.title" :title="stat.title" :value="stat.value"
          :change="stat.change" :icon="stat.icon" :loading="loading" />
      </div>
    </div>

    <!-- Moderation Statistics -->
    <div>
      <h3 class="tw-text-lg tw-font-medium tw-text-foreground tw-mb-4">Moderation Overview</h3>
      <div class="tw-grid tw-gap-5 tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
        <StatsCard v-for="stat in moderationStats" :key="stat.title" :title="stat.title" :value="stat.value"
          :icon="stat.icon" :loading="loading" />
      </div>
    </div>

    <!-- System Health -->
    <div>
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">System Health</h3>
        <button @click="emit('refresh')" :disabled="loading"
          class="tw-bg-primary hover:tw-bg-primary/90 disabled:tw-opacity-50 tw-text-primary-foreground tw-px-3 tw-py-1 tw-rounded tw-text-sm">
          Refresh
        </button>
      </div>
      <div class="tw-bg-card tw-shadow tw-rounded-lg tw-p-6">
        <div v-if="loading" class="tw-grid tw-grid-cols-1 tw-md:grid-cols-2 tw-gap-6">
          <!-- Database Status Skeleton -->
          <div>
            <div class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse tw-mb-2 tw-w-20"></div>
            <div class="tw-space-y-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-12"></div>
                <div class="tw-h-5 tw-bg-muted tw-rounded-full tw-animate-pulse tw-w-16"></div>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-20"></div>
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-12"></div>
              </div>
            </div>
          </div>
          <!-- Server Status Skeleton -->
          <div>
            <div class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse tw-mb-2 tw-w-16"></div>
            <div class="tw-space-y-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-12"></div>
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-16"></div>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-16"></div>
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-12"></div>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-12"></div>
                <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-20"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="systemHealth" class="tw-grid tw-grid-cols-1 tw-md:grid-cols-2 tw-gap-6">
          <!-- Database Status -->
          <div>
            <h4 class="tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-2">Database</h4>
            <div class="tw-space-y-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-text-sm tw-text-foreground">Status</span>
                <span :class="[
                  'tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
                  systemHealth.database.status === 'connected'
                    ? 'tw-bg-success/10 tw-text-success'
                    : 'tw-bg-destructive/10 tw-text-destructive'
                ]">
                  {{ systemHealth.database.status }}
                </span>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-text-sm tw-text-foreground">Response Time</span>
                <span class="tw-text-sm tw-text-muted-foreground">{{ systemHealth.database.responseTime }}ms</span>
              </div>
            </div>
          </div>

          <!-- Server Status -->
          <div>
            <h4 class="tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-2">Server</h4>
            <div class="tw-space-y-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-text-sm tw-text-foreground">Uptime</span>
                <span class="tw-text-sm tw-text-muted-foreground">{{ formatUptime(systemHealth.server.uptime) }}</span>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-text-sm tw-text-foreground">CPU Usage</span>
                <span class="tw-text-sm tw-text-muted-foreground">{{ systemHealth.server.cpuUsage.toFixed(1) }}%</span>
              </div>
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-text-sm tw-text-foreground">Memory</span> <span
                  class="tw-text-sm tw-text-muted-foreground">
                  {{ formatBytes(memoryUsage.used) }} /
                  {{ formatBytes(memoryUsage.total) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="tw-text-center tw-text-muted-foreground">
          Unable to load system health data
        </div>
      </div>
    </div>

    <!-- User Growth Chart -->
    <div>
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">User Growth</h3>
        <select v-model="selectedDays" @change="loadUserGrowthData"
          class="tw-border tw-border-border tw-bg-card tw-text-foreground tw-rounded-md tw-px-3 tw-py-1 tw-text-sm">
          <option v-for="days in daysOptions" :key="days" :value="days">
            Last {{ days }} days
          </option>
        </select>
      </div>

      <div class="tw-bg-card tw-shadow tw-rounded-lg tw-p-6">
        <div v-if="growthLoading" class="tw-h-64 tw-flex tw-items-center tw-justify-center">
          <div class="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-primary"></div>
        </div>

        <div v-else-if="userGrowthData.length > 0" class="tw-h-64">
          <!-- Simple text-based chart for now - maybe I'll do a nice chart later -->
          <div class="tw-space-y-2">
            <div class="tw-text-sm tw-text-muted-foreground tw-mb-4">Daily User Registrations</div>
            <div class="tw-max-h-48 tw-overflow-y-auto tw-space-y-1">
              <div v-for="dataPoint in userGrowthData.slice(-10)" :key="dataPoint.date"
                class="tw-flex tw-items-center tw-justify-between tw-text-sm">
                <span class="tw-text-muted-foreground">{{ new Date(dataPoint.date).toLocaleDateString() }}</span>
                <div class="tw-flex tw-items-center tw-space-x-2">
                  <div class="tw-bg-primary tw-h-2 tw-rounded"
                    :style="{ width: `${Math.max(4, (dataPoint.count / Math.max(...userGrowthData.map(d => d.count))) * 100)}px` }">
                  </div>
                  <span class="tw-font-medium">{{ dataPoint.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="tw-h-64 tw-flex tw-items-center tw-justify-center tw-text-muted-foreground">
          No user growth data available
        </div>
      </div>
    </div>
  </div>
</template>
