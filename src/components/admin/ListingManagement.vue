<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi, type AdminListing, type PaginatedResponse } from '@/lib/adminApi';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RefreshCcw, Search } from 'lucide-vue-next';

const listings = ref<AdminListing[]>([]);
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
const showListingModal = ref(false);
const selectedListing = ref<AdminListing | null>(null);
const modalMode = ref<'view' | 'edit'>('view');

// Edit form data
const editForm = ref({
  thumbnailUrl: '',
  shortDescription: ''
});

const columns = [
  {
    key: 'shortDescription',
    title: 'Description',
    sortable: true,
    render: (value: string) => value || 'No description'
  },
  {
    key: 'owner.username',
    title: 'Owner',
    render: (value: any, row: AdminListing) =>
      row.owner?.username || 'Unknown'
  },
  {
    key: 'owner.primaryEmail',
    title: 'Owner Email',
    render: (value: any, row: AdminListing) =>
      row.owner?.primaryEmail || 'No email'
  },
  {
    key: 'thumbnailUrl',
    title: 'Thumbnail',
    render: (value: string) => value
      ? '<span class="tw-text-green-600">Yes</span>'
      : '<span class="tw-text-gray-400">No</span>'
  },
  {
    key: 'createdAt',
    title: 'Created',
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString()
  }
];

async function loadListings() {
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

    // When fetching listings:
    const result = await adminApi.getListings(params);
    listings.value = result.data;
    pagination.value = result.pagination;
  } catch (err) {
    console.error('Failed to load listings:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load listings';
  } finally {
    loading.value = false;
  }
}

function handleSort(column: string, order: 'asc' | 'desc') {
  sortBy.value = column;
  sortOrder.value = order;
  pagination.value.currentPage = 1;
  loadListings();
}

function handlePageChange(page: number) {
  pagination.value.currentPage = page;
  loadListings();
}

function handleSearch() {
  pagination.value.currentPage = 1;
  loadListings();
}

function handleRowClick(listing: AdminListing) {
  selectedListing.value = listing;
  modalMode.value = 'view';
  showListingModal.value = true;
}

function openEditModal(listing: AdminListing) {
  selectedListing.value = listing;
  modalMode.value = 'edit';

  // Populate edit form
  editForm.value = {
    thumbnailUrl: listing.thumbnailUrl || '',
    shortDescription: listing.shortDescription || ''
  };

  showListingModal.value = true;
}

async function saveListing() {
  if (!selectedListing.value) return;

  try {
    const updates = {
      thumbnailUrl: editForm.value.thumbnailUrl || undefined,
      shortDescription: editForm.value.shortDescription || undefined
    };

    await adminApi.updateListing(selectedListing.value.listingId, updates);
    showListingModal.value = false;
    loadListings(); // Refresh the list
  } catch (err) {
    console.error('Failed to update listing:', err);
    error.value = err instanceof Error ? err.message : 'Failed to update listing';
  }
}

async function deleteListing() {
  if (!selectedListing.value) return;

  if (!confirm(`Are you sure you want to delete this listing? This action cannot be undone.`)) {
    return;
  }

  try {
    await adminApi.deleteListing(selectedListing.value.listingId);
    showListingModal.value = false;
    loadListings(); // Refresh the list
  } catch (err) {
    console.error('Failed to delete listing:', err);
    error.value = err instanceof Error ? err.message : 'Failed to delete listing';
  }
}

async function viewUserListings(userId: string) {
  try {
    const response = await adminApi.getUserListings(userId);
    console.log('User listings:', response);
    // You could open another modal or navigate to a detailed view
    alert(`User has ${response.listings.length} listings`);
  } catch (err) {
    console.error('Failed to load user listings:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load user listings';
  }
}

function closeModal() {
  showListingModal.value = false;
  selectedListing.value = null;
  modalMode.value = 'view';
}

onMounted(() => {
  loadListings();
});
</script>

<template>
  <div class="tw-space-y-6">
    <!-- Header -->
    <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between">
      <h2 class="tw-text-2xl tw-font-bold tw-text-foreground">Listing Management</h2>
      <div class="tw-flex tw-items-center tw-space-x-4">
        <div class="tw-flex tw-items-center tw-space-x-1">
          <Input v-model="searchQuery" placeholder="Search users..." @keyup.enter="handleSearch"
            class="tw-w-40 tw-h-7" />
          <Button @click="handleSearch" size="sm">
            <Search class="tw-h-4 tw-w-4" />
          </Button>
        </div>
        <Button @click="loadListings" variant="secondary" size="sm">
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

    <!-- Listings Table -->
    <DataTable :columns="columns" :data="listings" :loading="loading" :sort-by="sortBy" :sort-order="sortOrder"
      @sort="handleSort" @row-click="handleRowClick" />

    <!-- Pagination -->
    <Pagination v-if="pagination.totalPages > 1" :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages" :total-items="pagination.totalCount"
      :items-per-page="pagination.itemsPerPage" :loading="loading" @page-change="handlePageChange" />

    <!-- Listing Modal -->
    <Modal :show="showListingModal" :title="modalMode === 'edit' ? 'Edit Listing' : 'Listing Details'" size="lg"
      @close="closeModal">
      <div v-if="selectedListing" class="tw-space-y-6">
        <!-- View Mode -->
        <div v-if="modalMode === 'view'" class="tw-space-y-4">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Listing ID</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground tw-font-mono">{{ selectedListing.listingId }}</p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Owner ID</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground tw-font-mono">{{ selectedListing.ownerUserId }}</p>
            </div>
          </div>

          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Description</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedListing.shortDescription || 'No description' }}
            </p>
          </div>

          <div v-if="selectedListing.thumbnailUrl">
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Thumbnail</label>
            <div class="tw-mt-2">
              <img :src="selectedListing.thumbnailUrl" alt="Listing thumbnail"
                class="tw-max-w-xs tw-h-auto tw-rounded tw-border"
                @error="(event) => { if (event.target) (event.target as HTMLImageElement).style.display = 'none' }" />
              <p class="tw-mt-1 tw-text-xs tw-text-muted-foreground tw-break-all">{{ selectedListing.thumbnailUrl }}</p>
            </div>
          </div>

          <div v-if="selectedListing.owner" class="tw-border-t tw-pt-4">
            <h4 class="tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-2">Owner Information</h4>
            <div class="tw-grid tw-grid-cols-2 tw-gap-4">
              <div>
                <label class="tw-block tw-text-xs tw-text-muted-foreground">Username</label>
                <p class="tw-text-sm tw-text-foreground">{{ selectedListing.owner.username }}</p>
              </div>
              <div>
                <label class="tw-block tw-text-xs tw-text-muted-foreground">Email</label>
                <p class="tw-text-sm tw-text-foreground">{{ selectedListing.owner.primaryEmail || 'No email' }}</p>
              </div>
              <div>
                <label class="tw-block tw-text-xs tw-text-muted-foreground">Name</label>
                <p class="tw-text-sm tw-text-foreground">
                  {{ `${selectedListing.owner.profile.firstName} ${selectedListing.owner.profile.lastName}`.trim() }}
                </p>
              </div>
              <div>
                <Button @click="viewUserListings(selectedListing.ownerUserId)" size="sm" variant="secondary">
                  View All User Listings
                </Button>
              </div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Created</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ new Date(selectedListing.createdAt).toLocaleString()
              }}
              </p>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Updated</label>
              <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ new Date(selectedListing.updatedAt).toLocaleString()
              }}
              </p>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="tw-space-y-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Description</label>
            <Input v-model="editForm.shortDescription" placeholder="Enter listing description" class="tw-mt-1"
              maxlength="200" />
            <p class="tw-mt-1 tw-text-xs tw-text-muted-foreground">
              {{ editForm.shortDescription.length }}/200 characters
            </p>
          </div>

          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Thumbnail URL</label>
            <Input v-model="editForm.thumbnailUrl" placeholder="Enter thumbnail URL" class="tw-mt-1" />
            <div v-if="editForm.thumbnailUrl" class="tw-mt-2">
              <img :src="editForm.thumbnailUrl" alt="Thumbnail preview"
                class="tw-max-w-xs tw-h-auto tw-rounded tw-border"
                @error="(event) => { if (event.target) (event.target as HTMLImageElement).style.display = 'none' }" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="tw-flex tw-space-x-3">
          <Button v-if="modalMode === 'view'" @click="openEditModal(selectedListing!)" variant="secondary">
            Edit
          </Button>
          <Button v-if="modalMode === 'view'" @click="deleteListing" variant="destructive">
            Delete
          </Button>
          <Button v-if="modalMode === 'edit'" @click="saveListing">
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
