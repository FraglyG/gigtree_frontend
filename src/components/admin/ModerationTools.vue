<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminApi, type ModerationAction, type BannedUser, type MutedUser, type AdminUser } from '@/lib/adminApi';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Ban, MessageSquareX } from 'lucide-vue-next';

const bannedUsers = ref<BannedUser[]>([]);
const mutedUsers = ref<MutedUser[]>([]);
const searchResults = ref<AdminUser[]>([]);
const searchQuery = ref('');
const showSearchResults = ref(false);
const loading = ref(false);
const searchLoading = ref(false);
const searchTimeout = ref<NodeJS.Timeout | null>(null);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Modals
const showBanUserModal = ref(false);
const showMuteUserModal = ref(false);
const showActionModal = ref(false);
const selectedAction = ref<ModerationAction | null>(null);

// Forms
const banUserForm = ref({
  userId: '',
  username: '',
  email: '',
  reason: '',
  duration: '24' // hours
});

const muteUserForm = ref({
  userId: '',
  username: '',
  email: '',
  reason: '',
  duration: '2' // hours
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);

// Filters
const actionFilter = ref('all');
const moderatorFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const actionColumns = [
  { key: 'type', title: 'Action', label: 'Action', sortable: true },
  { key: 'targetUser', title: 'Target User', label: 'Target User', sortable: true },
  { key: 'moderator', title: 'Moderator', label: 'Moderator', sortable: true },
  { key: 'reason', title: 'Reason', label: 'Reason', sortable: false },
  { key: 'createdAt', title: 'Date', label: 'Date', sortable: true },
  { key: 'status', title: 'Status', label: 'Status', sortable: false },
  { key: 'actions', title: 'Actions', label: 'Actions', sortable: false }
];

const bannedUserColumns = [
  { key: 'user', title: 'User', label: 'User', sortable: true },
  { key: 'reason', title: 'Reason', label: 'Reason', sortable: false },
  // { key: 'bannedBy', title: 'Banned By', label: 'Banned By', sortable: true },
  { key: 'bannedAt', title: 'Banned At', label: 'Banned At', sortable: true },
  { key: 'expiresAt', title: 'Expires', label: 'Expires', sortable: true },
  { key: 'actions', title: 'Actions', label: 'Actions', sortable: false }
];

const mutedUserColumns = [
  { key: 'user', title: 'User', label: 'User', sortable: true },
  { key: 'reason', title: 'Reason', label: 'Reason', sortable: false },
  // { key: 'mutedBy', title: 'Muted By', label: 'Muted By', sortable: true },
  { key: 'mutedAt', title: 'Muted At', label: 'Muted At', sortable: true },
  { key: 'expiresAt', title: 'Expires', label: 'Expires', sortable: true },
  { key: 'actions', title: 'Actions', label: 'Actions', sortable: false }
];

async function loadBannedUsers() {
  loading.value = true;
  error.value = null;

  try {
    const response = await adminApi.getBannedUsers();
    bannedUsers.value = response.users;
  } catch (err) {
    error.value = 'Failed to load banned users';
    console.error('Error loading banned users:', err);
  } finally {
    loading.value = false;
  }
}

async function loadMutedUsers() {
  loading.value = true;
  error.value = null;

  try {
    const response = await adminApi.getMutedUsers();
    mutedUsers.value = response.users;
  } catch (err) {
    error.value = 'Failed to load muted users';
    console.error('Error loading muted users:', err);
  } finally {
    loading.value = false;
  }
}

async function banUser() {
  if (!banUserForm.value.userId || !banUserForm.value.reason) {
    error.value = 'User ID and reason are required';
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await adminApi.banUser(
      banUserForm.value.userId,
      banUserForm.value.reason,
      parseInt(banUserForm.value.duration)
    ); success.value = 'User banned successfully';
    showBanUserModal.value = false;
    banUserForm.value = { userId: '', username: '', email: '', reason: '', duration: '24' };

    // Reload data
    await loadBannedUsers();
  } catch (err) {
    error.value = 'Failed to ban user';
    console.error('Error banning user:', err);
  } finally {
    loading.value = false;
  }
}

async function muteUser() {
  if (!muteUserForm.value.userId || !muteUserForm.value.reason) {
    error.value = 'User ID and reason are required';
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await adminApi.muteUser(
      muteUserForm.value.userId,
      muteUserForm.value.reason,
      parseInt(muteUserForm.value.duration)
    ); success.value = 'User muted successfully';
    showMuteUserModal.value = false;
    muteUserForm.value = { userId: '', username: '', email: '', reason: '', duration: '2' };

    // Reload data
    await loadMutedUsers();
  } catch (err) {
    error.value = 'Failed to mute user';
    console.error('Error muting user:', err);
  } finally {
    loading.value = false;
  }
}

async function unbanUser(userId: string) {
  if (!confirm('Are you sure you want to unban this user?')) return;

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await adminApi.unbanUser(userId);
    success.value = 'User unbanned successfully';

    // Reload data
    await loadBannedUsers();
  } catch (err) {
    error.value = 'Failed to unban user';
    console.error('Error unbanning user:', err);
  } finally {
    loading.value = false;
  }
}

async function unmuteUser(userId: string) {
  if (!confirm('Are you sure you want to unmute this user?')) return;

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await adminApi.unmuteUser(userId);
    success.value = 'User unmuted successfully';

    // Reload data
    await loadMutedUsers();
  } catch (err) {
    error.value = 'Failed to unmute user';
    console.error('Error unmuting user:', err);
  } finally {
    loading.value = false;
  }
}

async function viewAction(action: ModerationAction) {
  selectedAction.value = action;
  showActionModal.value = true;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDuration(hours: number) {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  // loadModerationActions();
}

async function searchUsers() {
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }

  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    searchLoading.value = true;
    error.value = null;

    try {
      const response = await adminApi.getUsers({
        search: searchQuery.value.trim(),
        limit: 10 // Limit search results
      });
      searchResults.value = response.data;
      showSearchResults.value = true;
    } catch (err) {
      error.value = 'Failed to search users';
      console.error('Error searching users:', err);
    } finally {
      searchLoading.value = false;
    }
  }, 300); // 300ms debounce
}

function selectUserForAction(user: AdminUser, action: 'ban' | 'mute') {
  if (action === 'ban') {
    banUserForm.value.userId = user.userId;
    banUserForm.value.username = user.username;
    banUserForm.value.email = user.primaryEmail;
    showBanUserModal.value = true;
  } else if (action === 'mute') {
    muteUserForm.value.userId = user.userId;
    muteUserForm.value.username = user.username;
    muteUserForm.value.email = user.primaryEmail;
    showMuteUserModal.value = true;
  }

  // Clear search
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
  clearMessages();
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
}

function handleSearchBlur() {
  // Delay hiding results to allow clicking on them
  setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
}

function clearBanForm() {
  banUserForm.value = { userId: '', username: '', email: '', reason: '', duration: '24' };
}

function clearMuteForm() {
  muteUserForm.value = { userId: '', username: '', email: '', reason: '', duration: '2' };
}

function clearMessages() {
  error.value = null;
  success.value = null;
}

onMounted(() => {
  loadBannedUsers();
  loadMutedUsers();
});
</script>

<template>
  <div class="tw-space-y-6">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center">
      <h2 class="tw-text-2xl tw-font-bold tw-text-foreground">Moderation Tools</h2>
      <div class="tw-flex tw-space-x-3">
        <Button @click="showMuteUserModal = true; clearMessages();" variant="secondary" outline>
          <div>
            <MessageSquareX class="tw-inline-block tw-w-5 tw-h-5 tw-mr-2 tw-mb-0.5" />
            <span>Mute</span>
          </div>
        </Button>
        <Button @click="showBanUserModal = true; clearMessages();" variant="destructive" outline>
          <div>
            <Ban class="tw-inline-block tw-w-5 tw-h-5 tw-mr-2 tw-mb-0.5" />
            <span>Ban</span>
          </div>
        </Button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="error" class="tw-bg-destructive/10 tw-border tw-border-destructive tw-rounded-md tw-p-4">
      <div class="tw-flex">
        <div class="tw-text-sm tw-text-destructive">{{ error }}</div>
        <button @click="error = null" class="tw-ml-auto tw-text-destructive hover:tw-underline">×</button>
      </div>
    </div>

    <div v-if="success" class="tw-bg-success/10 tw-border tw-border-success tw-rounded-md tw-p-4">
      <div class="tw-flex">
        <div class="tw-text-sm tw-text-success">{{ success }}</div>
        <button @click="success = null" class="tw-ml-auto tw-text-success hover:tw-underline">×</button>
      </div>
    </div>

    <!-- Filters -->
    <!-- <div class="tw-bg-card tw-p-4 tw-rounded-lg tw-shadow tw-space-y-4">
      <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Filters</h3>
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Action Type
          </label>
          <select v-model="actionFilter"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary">
            <option value="all">All Actions</option>
            <option value="ban">Bans</option>
            <option value="mute">Mutes</option>
            <option value="warn">Warnings</option>
            <option value="unban">Unbans</option>
            <option value="unmute">Unmutes</option>
          </select>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Moderator
          </label>
          <input v-model="moderatorFilter" type="text" placeholder="Search by moderator..."
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            From Date
          </label>
          <input v-model="dateFrom" type="date"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            To Date
          </label>
          <input v-model="dateTo" type="date"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>
      </div>
    </div> -->

    <!-- Search Moderated User -->
    <div class="tw-bg-card tw-p-4 tw-rounded-lg tw-shadow">
      <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Search Any User</h3>
      <div class="tw-mt-2 tw-relative"> <input v-model="searchQuery" @input="searchUsers" @focus="searchUsers"
          @blur="handleSearchBlur" type="text" placeholder="Search by username or email..."
          class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />

        <!-- Search Results Dropdown -->
        <div v-if="showSearchResults && (searchResults.length > 0 || searchLoading)"
          class="tw-absolute tw-z-10 tw-w-full tw-mt-1 tw-bg-card tw-border tw-border-border tw-rounded-md tw-shadow-lg tw-max-h-60 tw-overflow-y-auto">

          <!-- Loading State -->
          <div v-if="searchLoading" class="tw-p-3 tw-text-center tw-text-muted-foreground">
            <div
              class="tw-animate-spin tw-w-4 tw-h-4 tw-border-2 tw-border-primary tw-border-t-transparent tw-rounded-full tw-mx-auto tw-mb-2">
            </div>
            Searching...
          </div>
          <!-- Search Results -->
          <div v-else-if="searchResults.length > 0" class="tw-py-2">
            <div v-for="user in searchResults" :key="user.userId"
              class="tw-px-3 tw-py-2 hover:tw-bg-muted tw-cursor-pointer">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-flex-1">
                  <div
                    class="tw-w-8 tw-h-8 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
                    <span class="tw-text-xs tw-font-medium tw-text-muted-foreground">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="tw-flex-1">
                    <div class="tw-flex tw-items-center tw-space-x-2">
                      <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ user.username }}</div>
                      <!-- Moderation Status Badges -->
                      <span v-if="user.moderation?.ban?.isBanned"
                        class="tw-px-1.5 tw-py-0.5 tw-text-xs tw-bg-destructive/10 tw-text-destructive tw-rounded">
                        Banned
                      </span>
                      <span v-if="user.moderation?.muted?.isMuted"
                        class="tw-px-1.5 tw-py-0.5 tw-text-xs tw-bg-warning/10 tw-text-warning tw-rounded">
                        Muted
                      </span>
                    </div>
                    <div class="tw-text-xs tw-text-muted-foreground">{{ user.primaryEmail }}</div>
                  </div>
                </div>
                <div class="tw-flex tw-space-x-2">
                  <!-- Mute/Unmute Button -->
                  <button v-if="user.moderation?.muted?.isMuted" @click="unmuteUser(user.userId)"
                    class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-text-success-foreground tw-bg-success tw-rounded hover:tw-bg-success/90">
                    Unmute
                  </button>
                  <button v-else @click="selectUserForAction(user, 'mute')"
                    class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-text-warning-foreground tw-bg-warning tw-rounded hover:tw-bg-warning/90">
                    Mute
                  </button>

                  <!-- Ban/Unban Button -->
                  <button v-if="user.moderation?.ban?.isBanned" @click="unbanUser(user.userId)"
                    class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-text-success-foreground tw-bg-success tw-rounded hover:tw-bg-success/90">
                    Unban
                  </button>
                  <button v-else @click="selectUserForAction(user, 'ban')"
                    class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-text-destructive-foreground tw-bg-destructive tw-rounded hover:tw-bg-destructive/90">
                    Ban
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="tw-p-3 tw-text-center tw-text-muted-foreground tw-text-sm">
            No users found
          </div>
        </div>
      </div>
    </div>

    <!-- Banned Users -->
    <div class="tw-bg-card tw-rounded-lg tw-shadow">
      <div class="tw-px-6 tw-py-4 tw-border-b tw-border-border">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Currently Banned Users</h3>
      </div>

      <DataTable :columns="bannedUserColumns" :data="bannedUsers" :loading="loading" @sort="(column, order) => { }">
        <template #cell-user="{ row }">
          <div class="tw-flex tw-items-center">
            <div class="tw-w-8 tw-h-8 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-xs tw-font-medium tw-text-muted-foreground">
                {{ row.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ row.username }}</div>
              <div class="tw-text-sm tw-text-muted-foreground">{{ row.email }}</div>
            </div>
          </div>
        </template>

        <template #cell-reason="{ row }">
          <span class="tw-text-sm tw-text-foreground">{{ row.banInfo.banReason || 'No reason provided' }}</span>
        </template>

        <!-- <template #cell-bannedBy="{ row }">
          <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ row.bannedBy.username }}</div>
        </template> -->

        <template #cell-bannedAt="{ row }">
          <span class="tw-text-sm tw-text-muted-foreground">{{ formatDate(row.banInfo.bannedAt) }}</span>
        </template>

        <template #cell-expiresAt="{ row }">
          <span :class="[
            'tw-text-sm',
            isExpired(row.banInfo.unbannedAt) ? 'tw-text-destructive' : 'tw-text-muted-foreground'
          ]">
            {{ row.banInfo.unbannedAt ? formatDate(row.banInfo.unbannedAt) : 'Permanent' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <button @click="unbanUser(row.userId)" class="tw-text-success hover:tw-underline tw-text-sm tw-font-medium">
            Unban
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Muted Users -->
    <div class="tw-bg-card tw-rounded-lg tw-shadow">
      <div class="tw-px-6 tw-py-4 tw-border-b tw-border-border">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Currently Muted Users</h3>
      </div>

      <DataTable :columns="mutedUserColumns" :data="mutedUsers" :loading="loading" @sort="(column, order) => { }">
        <template #cell-user="{ row }">
          <div class="tw-flex tw-items-center">
            <div class="tw-w-8 tw-h-8 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-xs tw-font-medium tw-text-muted-foreground">
                {{ row.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ row.username }}</div>
              <div class="tw-text-sm tw-text-muted-foreground">{{ row.email }}</div>
            </div>
          </div>
        </template>

        <template #cell-reason="{ row }">
          <span class="tw-text-sm tw-text-foreground">{{ row.muteInfo.muteReason || 'No reason provided' }}</span>
        </template>

        <!-- <template #cell-mutedBy="{ row }">
          <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ row.mutedBy.username }}</div>
        </template> -->

        <template #cell-mutedAt="{ row }">
          <span class="tw-text-sm tw-text-muted-foreground">{{ formatDate(row.muteInfo.mutedAt) }}</span>
        </template>

        <template #cell-expiresAt="{ row }">
          <span :class="[
            'tw-text-sm',
            isExpired(row.muteInfo.unmutedAt) ? 'tw-text-destructive' : 'tw-text-muted-foreground'
          ]">
            {{ row.muteInfo.unmutedAt ? formatDate(row.muteInfo.unmutedAt) : 'Permanent' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <button @click="unmuteUser(row.userId)" class="tw-text-success hover:tw-underline tw-text-sm tw-font-medium">
            Unmute
          </button>
        </template>
      </DataTable>
    </div> <!-- Ban User Modal -->
    <Modal :show="showBanUserModal" @close="showBanUserModal = false; clearMessages();" title="Ban User">
      <form @submit.prevent="banUser" class="tw-space-y-4"> <!-- Selected User Info -->
        <div v-if="banUserForm.username" class="tw-p-3 tw-bg-muted tw-rounded-md">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <h4 class="tw-text-sm tw-font-medium tw-text-foreground">Selected User:</h4>
            <button type="button" @click="clearBanForm"
              class="tw-text-xs tw-text-muted-foreground hover:tw-text-foreground">
              Clear
            </button>
          </div>
          <div class="tw-flex tw-items-center">
            <div class="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-xs tw-font-medium tw-text-primary-foreground">
                {{ banUserForm.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ banUserForm.username }}</div>
              <div class="tw-text-xs tw-text-muted-foreground">{{ banUserForm.email }}</div>
            </div>
          </div>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            User ID
          </label>
          <input v-model="banUserForm.userId" type="text" required placeholder="Enter user ID to ban"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Reason
          </label>
          <textarea v-model="banUserForm.reason" required rows="3" placeholder="Reason for ban"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary"></textarea>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Duration (hours)
          </label>
          <select v-model="banUserForm.duration"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary">
            <option value="1">1 hour</option>
            <option value="6">6 hours</option>
            <option value="24">24 hours</option>
            <option value="72">3 days</option>
            <option value="168">1 week</option>
            <option value="720">1 month</option>
            <option value="0">Permanent</option>
          </select>
        </div>

        <div class="tw-flex tw-justify-end tw-space-x-3 tw-pt-4">
          <button type="button" @click="showBanUserModal = false; clearMessages();"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-muted-foreground tw-bg-muted tw-rounded-md hover:tw-bg-muted/80">
            Cancel
          </button>
          <button type="submit" :disabled="loading"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-destructive-foreground tw-bg-destructive tw-rounded-md hover:tw-bg-destructive/90 disabled:tw-opacity-50">
            {{ loading ? 'Banning...' : 'Ban User' }}
          </button>
        </div>
      </form>
    </Modal> <!-- Mute User Modal -->
    <Modal :show="showMuteUserModal" @close="showMuteUserModal = false; clearMessages();" title="Mute User">
      <form @submit.prevent="muteUser" class="tw-space-y-4"> <!-- Selected User Info -->
        <div v-if="muteUserForm.username" class="tw-p-3 tw-bg-muted tw-rounded-md">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <h4 class="tw-text-sm tw-font-medium tw-text-foreground">Selected User:</h4>
            <button type="button" @click="clearMuteForm"
              class="tw-text-xs tw-text-muted-foreground hover:tw-text-foreground">
              Clear
            </button>
          </div>
          <div class="tw-flex tw-items-center">
            <div class="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-xs tw-font-medium tw-text-primary-foreground">
                {{ muteUserForm.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ muteUserForm.username }}</div>
              <div class="tw-text-xs tw-text-muted-foreground">{{ muteUserForm.email }}</div>
            </div>
          </div>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            User ID
          </label>
          <input v-model="muteUserForm.userId" type="text" required placeholder="Enter user ID to mute"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Reason
          </label>
          <textarea v-model="muteUserForm.reason" required rows="3" placeholder="Reason for mute"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary"></textarea>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Duration (hours)
          </label>
          <select v-model="muteUserForm.duration"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary">
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="6">6 hours</option>
            <option value="24">24 hours</option>
            <option value="72">3 days</option>
            <option value="168">1 week</option>
          </select>
        </div>

        <div class="tw-flex tw-justify-end tw-space-x-3 tw-pt-4">
          <button type="button" @click="showMuteUserModal = false; clearMessages();"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-muted-foreground tw-bg-muted tw-rounded-md hover:tw-bg-muted/80">
            Cancel
          </button>
          <button type="submit" :disabled="loading"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-warning-foreground tw-bg-warning tw-rounded-md hover:tw-bg-warning/90 disabled:tw-opacity-50">
            {{ loading ? 'Muting...' : 'Mute User' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Action Details Modal -->
    <Modal :show="showActionModal" @close="showActionModal = false" title="Moderation Action Details">
      <div v-if="selectedAction" class="tw-space-y-4">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Action Type</label>
            <span :class="['tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-mt-1',
              selectedAction.type === 'ban' ? 'tw-bg-destructive/10 tw-text-destructive' :
                selectedAction.type === 'mute' ? 'tw-bg-warning/10 tw-text-warning' :
                  selectedAction.type === 'warn' ? 'tw-bg-accent tw-text-accent-foreground' :
                    selectedAction.type === 'unban' ? 'tw-bg-success/10 tw-text-success' :
                      selectedAction.type === 'unmute' ? 'tw-bg-primary/10 tw-text-primary' :
                        'tw-bg-muted tw-text-muted-foreground'
            ]">
              {{ selectedAction.type.toUpperCase() }}
            </span>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Status</label>
            <span :class="['tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-mt-1',
              selectedAction.isActive ? 'tw-bg-success/10 tw-text-success' : 'tw-bg-muted tw-text-muted-foreground'
            ]">
              {{ selectedAction.isActive ? 'Active' : 'Expired' }}
            </span>
          </div>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Target User</label>
          <div class="tw-flex tw-items-center tw-mt-1">
            <div class="tw-w-10 tw-h-10 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-sm tw-font-medium tw-text-muted-foreground">
                {{ selectedAction.targetUser.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ selectedAction.targetUser.username }}</div>
              <div class="tw-text-sm tw-text-muted-foreground">{{ selectedAction.targetUser.primaryEmail }}</div>
            </div>
          </div>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Moderator</label>
          <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedAction.moderator.username }}</p>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Reason</label>
          <div class="tw-mt-1 tw-p-3 tw-bg-muted tw-rounded-md">
            <p class="tw-text-sm tw-text-foreground">{{ selectedAction.reason || 'No reason provided' }}</p>
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Created</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDate(selectedAction.createdAt) }}</p>
          </div>
          <div v-if="selectedAction.expiresAt">
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Expires</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDate(selectedAction.expiresAt) }}</p>
          </div>
        </div>

        <div v-if="selectedAction.duration">
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Duration</label>
          <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDuration(selectedAction.duration) }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>
