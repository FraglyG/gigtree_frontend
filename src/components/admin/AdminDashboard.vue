<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useGetUser } from '@/composables/getUser';
import { adminApi, type DashboardOverview, type SystemHealth } from '@/lib/adminApi';
import { StatsCard } from '@/components/ui/StatsCard';
import UserManagement from './UserManagement.vue';
import ListingManagement from './ListingManagement.vue';
import MessageManagement from './MessageManagement.vue';
import ModerationTools from './ModerationTools.vue';
import SystemOverview from './SystemOverview.vue';
import { ChartBar, Clipboard, MessageCircle, Shield, Users } from 'lucide-vue-next';

const { user, isLoading: userLoading } = useGetUser();

const activeTab = ref('overview');
const dashboardData = ref<DashboardOverview | null>(null);
const systemHealth = ref<SystemHealth | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const tabs = [
  { id: 'overview', name: 'Overview', icon: ChartBar },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'listings', name: 'Listings', icon: Clipboard },
  { id: 'messages', name: 'Messages', icon: MessageCircle },
  { id: 'moderation', name: 'Moderation', icon: Shield },
];

const isAdmin = computed(() => {
  return user.value && (user.value as any).isAdmin !== false;
});

async function loadDashboardData() {
  if (!isAdmin.value) return;

  loading.value = true;
  error.value = null;

  try {
    const [overview, health] = await Promise.allSettled([
      adminApi.getDashboardOverview(),
      adminApi.getSystemHealth()
    ]);

    if (overview.status === 'fulfilled') {
      dashboardData.value = overview.value;
    } else {
      console.error('Failed to load dashboard overview:', overview.reason);
      // Provide fallback data
      dashboardData.value = {
        totals: { users: 0, listings: 0, channels: 0, messages: 0 },
        userStats: { verified: 0, banned: 0, muted: 0, jobListingBanned: 0, unverified: 0 },
        recentActivity: { newUsers: 0, newListings: 0, newMessages: 0 },
        userGrowth: [],
        topMessageSenders: [],
        recentModerations: []
      };
    }

    if (health.status === 'fulfilled') {
      systemHealth.value = health.value;
    } else {
      console.error('Failed to load system health:', health.reason);
      // Provide fallback health data
      systemHealth.value = {
        database: { status: 'disconnected', responseTime: 0 },
        server: { uptime: 0, memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }, cpuUsage: 0 }
      };
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Wait for user to load if it's still loading
  if (userLoading.value) {
    const unwatch = watch(userLoading, (isLoading: boolean) => {
      if (!isLoading) {
        loadDashboardData();
        unwatch();
      }
    });
  } else {
    loadDashboardData();
  }
});

function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}
</script>

<template>
  <div class="tw-min-h-screen tw-bg-background">
    <!-- Header -->
    <div class="tw-bg-card tw-shadow">
      <div class="tw-max-w-7xl tw-mx-auto tw-px-4 tw-sm:px-6 tw-lg:px-8">
        <div class="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-py-6">
          <div class="tw-flex tw-items-center">
            <h1 class="tw-text-3xl tw-font-bold tw-text-foreground">Admin Dashboard</h1>
          </div>
          <div v-if="user" class="tw-flex tw-items-center tw-space-x-4">
            <span class="tw-text-md tw-text-muted-foreground">👋 Welcome back, {{ user.profile.firstName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tw-bg-card tw-border-b tw-border-border">
      <div class="tw-max-w-7xl tw-mx-auto tw-px-4 tw-sm:px-6 tw-lg:px-8">
        <nav class="tw-flex tw-flex-wrap tw-space-x-8" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.id" @click="setActiveTab(tab.id)" :class="[
            'tw-flex tw-items-center tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm',
            activeTab === tab.id
              ? 'tw-border-primary tw-text-primary'
              : 'tw-border-transparent tw-text-muted-foreground hover:tw-text-foreground hover:tw-border-muted'
          ]">
            <component :is="tab.icon" class="tw-mr-2 tw-h-5 tw-w-5" />
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div class="tw-max-w-7xl tw-mx-auto tw-px-4 tw-sm:px-6 tw-lg:px-8 tw-py-8">
      <!-- Error State -->
      <div v-if="error" class="tw-bg-destructive/10 tw-border tw-border-destructive tw-rounded-md tw-p-4 tw-mb-6">
        <div class="tw-flex">
          <div class="tw-ml-3">
            <h3 class="tw-text-sm tw-font-medium tw-text-destructive">Error</h3>
            <p class="tw-mt-2 tw-text-sm tw-text-destructive">{{ error }}</p>
            <button @click="loadDashboardData"
              class="tw-mt-2 tw-bg-destructive/10 hover:tw-bg-destructive/20 tw-text-destructive tw-px-3 tw-py-1 tw-rounded tw-text-sm">
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Unauthorized Access -->
      <div v-if="!userLoading && !isAdmin" class="tw-text-center tw-py-12">
        <div class="tw-bg-information/10 tw-border tw-border-information tw-rounded-md tw-p-6 tw-max-w-md tw-mx-auto">
          <h3 class="tw-text-lg tw-font-medium tw-text-information tw-mb-2">Access Denied</h3>
          <p class="tw-text-information">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="isAdmin">
        <!-- Tabs -->
        <SystemOverview v-if="activeTab === 'overview'" :dashboard-data="dashboardData" :system-health="systemHealth"
          :loading="loading" @refresh="loadDashboardData" />
        <UserManagement v-else-if="activeTab === 'users'" />
        <ListingManagement v-else-if="activeTab === 'listings'" />
        <MessageManagement v-else-if="activeTab === 'messages'" />
        <ModerationTools v-else-if="activeTab === 'moderation'" />
      </div>

      <!-- Loading State -->
      <div v-else-if="userLoading" class="tw-text-center tw-py-12">
        <div class="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-primary tw-mx-auto">
        </div>
        <p class="tw-mt-4 tw-text-muted-foreground">Loading...</p>
      </div>
    </div>
  </div>
</template>
