<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminApi, type AdminUser, type PaginatedResponse } from '@/lib/adminApi';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RefreshCcw, Search } from 'lucide-vue-next';
import { TextArea } from '@/components/ui/TextArea';

const users = ref<AdminUser[]>([]);
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  itemsPerPage: 20
});

const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Modal states
const showUserModal = ref(false);
const selectedUser = ref<AdminUser | null>(null);
const modalMode = ref<'view' | 'edit'>('view');

// Edit form data
const editForm = ref({
  username: '',
  primaryEmail: '',
  emailVerified: false,
  profile: {
    bio: '',
    firstName: '',
    lastName: '',
    profilePicture: ''
  }
});

const columns = [
  {
    key: 'username',
    title: 'Username',
    sortable: true
  },
  {
    key: 'primaryEmail',
    title: 'Email',
    sortable: true,
    render: (value: string) => value || 'No email'
  },
  {
    key: 'profile.firstName',
    title: 'Name',
    render: (value: any, row: AdminUser) =>
      `${row.profile.firstName} ${row.profile.lastName}`.trim() || 'No name'
  },
  {
    key: 'emailVerified',
    title: 'Verified',
    render: (value: boolean) => value
      ? '<span class="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-800 tw-rounded-full tw-text-xs">Verified</span>'
      : '<span class="tw-px-2 tw-py-1 tw-bg-red-100 tw-text-red-800 tw-rounded-full tw-text-xs">Unverified</span>'
  },
  {
    key: 'createdAt',
    title: 'Created',
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString()
  }
];

async function loadUsers() {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.itemsPerPage,
      search: searchQuery.value || undefined,
      sort: sortOrder.value,
      sortBy: sortBy.value as any
    };

    const { data: usersData, pagination: paginationData } = await adminApi.getUsers(params);
    users.value = usersData;
    pagination.value = paginationData;
  } catch (err) {
    console.error('Failed to load users:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load users';
  } finally {
    loading.value = false;
  }
}

function handleSort(column: string, order: 'asc' | 'desc') {
  sortBy.value = column;
  sortOrder.value = order;
  pagination.value.currentPage = 1;
  loadUsers();
}

function handlePageChange(page: number) {
  pagination.value.currentPage = page;
  loadUsers();
}

function handleSearch() {
  pagination.value.currentPage = 1;
  loadUsers();
}

function handleRowClick(user: AdminUser) {
  selectedUser.value = user;
  modalMode.value = 'view';
  showUserModal.value = true;
}

function openEditModal(user: AdminUser) {
  selectedUser.value = user;
  modalMode.value = 'edit';

  // Populate edit form
  editForm.value = {
    username: user.username,
    primaryEmail: user.primaryEmail || '',
    emailVerified: user.emailVerified || false,
    profile: {
      bio: user.profile.bio || '',
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      profilePicture: user.profile.profilePicture || ''
    }
  };

  showUserModal.value = true;
}

async function saveUser() {
  if (!selectedUser.value) return;

  try {
    const updates = {
      username: editForm.value.username,
      primaryEmail: editForm.value.primaryEmail,
      emailVerified: editForm.value.emailVerified,
      profile: editForm.value.profile
    };

    await adminApi.updateUser(selectedUser.value.userId, updates);
    showUserModal.value = false;
    loadUsers(); // Refresh the list
  } catch (err) {
    console.error('Failed to update user:', err);
    error.value = err instanceof Error ? err.message : 'Failed to update user';
  }
}

async function deleteUser() {
  if (!selectedUser.value) return;

  if (!confirm(`Are you sure you want to delete user "${selectedUser.value.username}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await adminApi.deleteUser(selectedUser.value.userId);
    showUserModal.value = false;
    loadUsers(); // Refresh the list
  } catch (err) {
    console.error('Failed to delete user:', err);
    error.value = err instanceof Error ? err.message : 'Failed to delete user';
  }
}

function closeModal() {
  showUserModal.value = false;
  selectedUser.value = null;
  modalMode.value = 'view';
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="tw-space-y-6">
    <!-- Header -->
    <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between">
      <h2 class="tw-text-2xl tw-font-bold tw-text-foreground">User Management</h2>
      <div class="tw-flex tw-items-center tw-space-x-4">
        <div class="tw-flex tw-items-center tw-space-x-1">
          <Input v-model="searchQuery" placeholder="Search users..." @keyup.enter="handleSearch"
            class="tw-w-40 tw-h-7" />
          <Button @click="handleSearch" size="sm">
            <Search class="tw-h-4 tw-w-4" />
          </Button>
        </div>
        <Button @click="loadUsers" variant="secondary" size="sm">
          <RefreshCcw class="tw-h-4 tw-w-4" />
        </Button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="tw-bg-destructive/10 tw-border tw-border-destructive tw-rounded-md tw-p-4">
      <div class="tw-flex">
        <div class="tw-ml-3">
          <h3 class="tw-text-sm tw-font-medium tw-text-destructive">Error</h3>
          <p class="tw-mt-2 tw-text-sm tw-text-destructive">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <DataTable :columns="columns" :data="users" :loading="loading" :sort-by="sortBy" :sort-order="sortOrder"
      @sort="handleSort" @row-click="handleRowClick" />

    <!-- Pagination -->
    <Pagination v-if="pagination.totalPages > 1" :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages" :total-items="pagination.totalCount"
      :items-per-page="pagination.itemsPerPage" :loading="loading" @page-change="handlePageChange" />

    <!-- User Modal -->
    <Modal :show="showUserModal" :title="modalMode === 'edit' ? 'Edit User' : 'User Details'" size="lg"
      @close="closeModal">
      <div v-if="selectedUser" class="tw-space-y-6">
        <!-- View Mode -->
        <div v-if="modalMode === 'view'" class="tw-space-y-4">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Username</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.username }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Email</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.primaryEmail || 'No email' }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">First Name</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.profile.firstName }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Last Name</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.profile.lastName }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Email Verified</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.emailVerified ? 'Yes' : 'No' }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">User ID</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground tw-font-mono">{{ selectedUser.userId }}</p>
            </div>
          </div>

          <div v-if="selectedUser.profile.bio">
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Bio</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedUser.profile.bio }}</p>
          </div>

          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Created</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ new Date(selectedUser.createdAt).toLocaleString() }}
              </p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Updated</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ new Date(selectedUser.updatedAt).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="tw-space-y-4">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Username</label>
              <Input v-model="editForm.username" class="tw-mt-1" />
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Email</label>
              <Input v-model="editForm.primaryEmail" type="email" class="tw-mt-1" />
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">First Name</label>
              <Input v-model="editForm.profile.firstName" class="tw-mt-1" />
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Last Name</label>
              <Input v-model="editForm.profile.lastName" class="tw-mt-1" />
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Profile Picture URL</label>
              <Input v-model="editForm.profile.profilePicture" class="tw-mt-1" />
            </div>
            <div class="tw-flex tw-items-center">
              <input v-model="editForm.emailVerified" type="checkbox" id="emailVerified"
                class="tw-h-4 tw-w-4 tw-text-primary tw-focus:ring-primary tw-border-border tw-rounded" />
              <label for="emailVerified" class="tw-ml-2 tw-block tw-text-sm tw-text-foreground">
                Email Verified
              </label>
            </div>
          </div>

          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Bio</label>
            <TextArea v-model="editForm.profile.bio" :rows="3"
              class="tw-mt-1 tw-block tw-w-full tw-border tw-border-border tw-rounded-md tw-shadow-sm tw-focus:ring-primary tw-focus:border-primary"></textarea>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="tw-flex tw-space-x-3">
          <Button v-if="modalMode === 'view'" @click="openEditModal(selectedUser!)" variant="secondary">
            Edit
          </Button>
          <Button v-if="modalMode === 'view'" @click="deleteUser" variant="destructive">
            Delete
          </Button>
          <Button v-if="modalMode === 'edit'" @click="saveUser">
            Save Changes
          </Button>
          <Button @click="closeModal" variant="secondary">
            {{ modalMode === 'edit' ? 'Cancel' : 'Close' }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
