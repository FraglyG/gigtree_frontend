<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { api } from '@/lib/api';
import UserListing from './UserListing.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardBody } from '@/components/ui/card';
import { Search, Filter, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface ListingWithOwner extends Listing {
    owner?: User;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
}

interface ApiResponse {
    success: boolean;
    data: {
        listings: ListingWithOwner[];
        pagination: PaginationData;
    };
    error?: string;
    message?: string;
}

const props = withDefaults(defineProps<{
    /** Whether to show pagination controls */
    enablePagination?: boolean;
    /** Whether to show pagination information */
    enablePaginationInfo?: boolean;
    /** Number of items per page */
    pageSize?: number;
    /** Default sort order */
    defaultSort?: 'asc' | 'desc';
    /** Default sort field */
    defaultSortBy?: 'createdAt' | 'updatedAt' | 'price';
    /** Whether to show search functionality */
    enableSearch?: boolean;
    /** Whether to show filter functionality */
    enableFilters?: boolean;
    /** Custom class for styling */
    class?: string;
}>(), {
    enablePagination: true,
    pageSize: 10,
    defaultSort: 'desc',
    defaultSortBy: 'createdAt',
    enableSearch: true,
    enableFilters: true,
    enablePaginationInfo: true,
});

// State
const listings = ref<ListingWithOwner[]>([]);
const pagination = ref<PaginationData | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const lastSearchInput = ref<number | null>(null);

// Search and Filter State
const searchQuery = ref('');
const selectedCategory = ref('');
const sortOrder = ref(props.defaultSort);
const sortBy = ref(props.defaultSortBy);
const currentPage = ref(1);

// Computed
const hasListings = computed(() => listings.value.length > 0);
const showPaginationControls = computed(() =>
    props.enablePagination && pagination.value && pagination.value.totalPages > 1
);

// Methods
async function fetchListings() {
    isLoading.value = true;
    error.value = null;

    try {
        const queryParams = new URLSearchParams({
            page: currentPage.value.toString(),
            limit: props.pageSize.toString(),
            sort: sortOrder.value,
            sortBy: sortBy.value,
        });

        if (searchQuery.value.trim()) {
            queryParams.append('search', searchQuery.value.trim());
        }

        if (selectedCategory.value) {
            queryParams.append('category', selectedCategory.value);
        }

        const response = await api.request(`/api/listings/get?${queryParams.toString()}`);
        const result: ApiResponse = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch listings');
        }

        const listingsWithOwners = result.data.listings.map(listing => ({
            ...listing,
            owner: listing.owner || {
                userId: listing.ownerUserId,
                username: 'unknown',
                passwordHash: '',
                profile: {
                    firstName: 'Unknown',
                    lastName: 'User',
                    bio: 'User information not available'
                }
            } as User
        }));

        listings.value = listingsWithOwners;
        pagination.value = result.data.pagination;
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred while fetching listings';
        console.error('Error fetching listings:', err);
    } finally {
        isLoading.value = false;
    }
}

function handleSearch() {
    currentPage.value = 1; // Reset to first page when searching
    fetchListings();
}

function handleSearchInput() {
    // Auto search if input stops for a bit
    const now = Date.now();

    setTimeout(() => {
        if (lastSearchInput.value == now) handleSearch();
    }, 1000);

    lastSearchInput.value = now;
}

function handleSort(newSortBy: typeof sortBy.value) {
    if (sortBy.value === newSortBy) {
        // Toggle sort order if same field
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new field and default to desc
        sortBy.value = newSortBy;
        sortOrder.value = 'desc';
    }
    currentPage.value = 1;
    fetchListings();
}

function goToPage(page: number) {
    if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
        currentPage.value = page;
        fetchListings();
    }
}

function nextPage() {
    if (pagination.value?.hasNextPage) {
        goToPage(currentPage.value + 1);
    }
}

function prevPage() {
    if (pagination.value?.hasPrevPage) {
        goToPage(currentPage.value - 1);
    }
}

// Watch for prop changes
watch(() => props.pageSize, () => {
    currentPage.value = 1;
    fetchListings();
});

// Initial load
onMounted(() => {
    fetchListings();
});
</script>

<template>
    <div :class="props.class">
        <!-- Search and Filter Controls -->
        <div v-if="props.enableSearch || props.enableFilters" class="tw-mb-6 tw-space-y-4">
            <!-- Search Bar -->
            <div v-if="props.enableSearch" class="tw-flex tw-gap-2">
                <div class="tw-w-fit tw-relative">
                    <Search
                        class="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-muted-foreground" />
                    <Input v-model="searchQuery" placeholder="Search listings..." class="tw-pl-10"
                        @keydown.enter="handleSearch" @input="handleSearchInput" />
                </div>
                <!-- <Button variant="primary" @click="handleSearch">
                    <Search class="tw-w-4 tw-h-4" />
                </Button> -->
            </div>

            <!-- Sort and Filter Controls -->
            <div v-if="props.enableFilters" class="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                <div class="tw-flex tw-items-center tw-gap-2">
                    <Filter class="tw-w-4 tw-h-4 tw-text-muted-foreground" />
                    <span class="tw-text-sm tw-text-muted-foreground">Sort by:</span>
                </div>
                <Button variant="secondary" size="sm" @click="handleSort('createdAt')"
                    :class="sortBy === 'createdAt' ? 'tw-bg-primary tw-text-primary-foreground' : ''">
                    Date {{ sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                </Button>

                <Button variant="secondary" size="sm" @click="handleSort('updatedAt')"
                    :class="sortBy === 'updatedAt' ? 'tw-bg-primary tw-text-primary-foreground' : ''">
                    Updated {{ sortBy === 'updatedAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                </Button>

                <Button variant="secondary" size="sm" @click="handleSort('price')"
                    :class="sortBy === 'price' ? 'tw-bg-primary tw-text-primary-foreground' : ''">
                    Price {{ sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                </Button>
            </div>
        </div>        <!-- Loading State -->
        <div v-if="isLoading"
            class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4">
            <Card v-for="i in props.pageSize" :key="i" class="tw-w-[240px]">
                <div class="tw-p-4 tw-space-y-3">
                    <Skeleton class="tw-w-full tw-h-[100px] tw-rounded" />
                    <Skeleton class="tw-w-3/4 tw-h-4 tw-rounded" />
                    <Skeleton class="tw-w-1/2 tw-h-3 tw-rounded" />
                </div>
            </Card>
        </div>

        <!-- Error State -->
        <Card v-else-if="error" class="tw-p-6">
            <CardBody>
                <div class="tw-text-center tw-text-red-500">
                    <p class="tw-font-semibold">Error loading listings</p>
                    <p class="tw-text-sm tw-mt-2">{{ error }}</p>
                    <Button variant="primary" class="tw-mt-4" @click="fetchListings">
                        Try Again
                    </Button>
                </div>
            </CardBody>
        </Card>

        <!-- Empty State -->
        <Card v-else-if="!hasListings" class="tw-p-6">
            <CardBody>
                <div class="tw-text-center tw-text-muted-foreground">
                    <p class="tw-font-semibold">No listings found</p>
                    <p class="tw-text-sm tw-mt-2">
                        {{ searchQuery ? 'Try adjusting your search terms.' : 'No listings are available at the moment.'
                        }}
                    </p>
                </div>
            </CardBody>
        </Card>

        <!-- Listings Grid -->
        <div v-else class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4">
            <div class="tw-flex tw-flex-row tw-justify-center tw-align-middle">
                <UserListing v-for="listing in listings" :key="listing.listingId" :user="listing.owner!"
                    :listing="listing" />
            </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="showPaginationControls" class="tw-flex tw-items-center tw-justify-center tw-mt-8 tw-space-x-2">
            <!-- Previous Page Button -->
            <Button variant="secondary" size="sm" :disabled="!pagination?.hasPrevPage" @click="prevPage">
                <ChevronLeft class="tw-w-4 tw-h-4" />
                Previous
            </Button>

            <!-- Page Numbers -->
            <div class="tw-flex tw-space-x-1">
                <!-- First page if not visible -->
                <Button v-if="pagination && currentPage > 3" variant="secondary" size="sm" @click="goToPage(1)">
                    1
                </Button>

                <!-- Ellipsis -->
                <span v-if="pagination && currentPage > 4" class="tw-px-2 tw-py-1 tw-text-muted-foreground">...</span>

                <!-- Visible page numbers -->
                <Button v-for="page in Array.from({ length: Math.min(5, pagination?.totalPages || 0) }, (_, i) => {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(pagination?.totalPages || 0, start + 4);
                    const adjustedStart = Math.max(1, end - 4);
                    return adjustedStart + i;
                }).filter(page => page <= (pagination?.totalPages || 0))" :key="page"
                    :variant="page === currentPage ? 'primary' : 'secondary'" size="sm" @click="goToPage(page)">
                    {{ page }}
                </Button>

                <!-- Ellipsis -->
                <span v-if="pagination && currentPage < pagination.totalPages - 3"
                    class="tw-px-2 tw-py-1 tw-text-muted-foreground">...</span>

                <!-- Last page if not visible -->
                <Button v-if="pagination && currentPage < pagination.totalPages - 2" variant="secondary" size="sm"
                    @click="goToPage(pagination.totalPages)">
                    {{ pagination.totalPages }}
                </Button>
            </div>

            <!-- Next Page Button -->
            <Button variant="secondary" size="sm" :disabled="!pagination?.hasNextPage" @click="nextPage">
                Next
                <ChevronRight class="tw-w-4 tw-h-4" />
            </Button>
        </div>

        <!-- Pagination Info -->
        <div v-if="pagination && props.enablePaginationInfo"
            class="tw-text-center tw-text-sm tw-text-muted-foreground tw-mt-4">
            Showing {{ Math.min((currentPage - 1) * props.pageSize + 1, pagination.totalCount) }} to
            {{ Math.min(currentPage * props.pageSize, pagination.totalCount) }} of
            {{ pagination.totalCount }} results
        </div>
    </div>
</template>

<style scoped></style>