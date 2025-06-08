<script setup lang="ts">
interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  pageChange: [page: number];
}>();

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('pageChange', page);
  }
}

function getVisiblePages() {
  const pages = [];
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.totalPages, props.currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}
</script>

<template>
  <div class="tw-flex tw-items-center tw-justify-between tw-bg-card tw-px-4 tw-py-3 tw-sm:px-6">
    <div class="tw-flex tw-flex-1 tw-justify-between tw-sm:hidden">
      <button :disabled="currentPage <= 1 || loading" @click="goToPage(currentPage - 1)"
        class="tw-relative tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-foreground hover:tw-bg-muted disabled:tw-opacity-50 disabled:tw-cursor-not-allowed">
        Previous
      </button>
      <button :disabled="currentPage >= totalPages || loading" @click="goToPage(currentPage + 1)"
        class="tw-relative tw-ml-3 tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-foreground hover:tw-bg-muted disabled:tw-opacity-50 disabled:tw-cursor-not-allowed">
        Next
      </button>
    </div>
    <div class="tw-hidden tw-sm:flex tw-sm:flex-1 tw-sm:items-center tw-sm:justify-between">
      <div>
        <p class="tw-text-sm tw-text-muted-foreground">
          Showing
          <span class="tw-font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          to
          <span class="tw-font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
          of
          <span class="tw-font-medium">{{ totalItems }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="tw-isolate tw-inline-flex tw--space-x-px tw-rounded-md tw-shadow-sm" aria-label="Pagination">
          <button :disabled="currentPage <= 1 || loading" @click="goToPage(currentPage - 1)"
            class="tw-relative tw-inline-flex tw-items-center tw-rounded-l-md tw-px-2 tw-py-2 tw-text-muted-foreground tw-ring-1 tw-ring-inset tw-ring-border hover:tw-bg-muted focus:tw-z-20 focus:tw-outline-offset-0 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed">
            <span class="tw-sr-only">Previous</span>
            <svg class="tw-h-5 tw-w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <button v-if="getVisiblePages()[0] > 1" @click="goToPage(1)"
            class="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-foreground tw-ring-1 tw-ring-inset tw-ring-border hover:tw-bg-muted focus:tw-z-20 focus:tw-outline-offset-0">
            1
          </button>

          <span v-if="getVisiblePages()[0] > 2"
            class="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-muted-foreground tw-ring-1 tw-ring-inset tw-ring-border focus:tw-outline-offset-0">
            ...
          </span>

          <button v-for="page in getVisiblePages()" :key="page" @click="goToPage(page)" :class="[
            'tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-ring-1 tw-ring-inset tw-ring-border focus:tw-z-20 focus:tw-outline-offset-0',
            page === currentPage
              ? 'tw-z-10 tw-bg-primary tw-text-primary-foreground focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-primary'
              : 'tw-text-foreground hover:tw-bg-muted'
          ]">
            {{ page }}
          </button>

          <span v-if="getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1"
            class="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-muted-foreground tw-ring-1 tw-ring-inset tw-ring-border focus:tw-outline-offset-0">
            ...
          </span>

          <button v-if="getVisiblePages()[getVisiblePages().length - 1] < totalPages" @click="goToPage(totalPages)"
            class="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-foreground tw-ring-1 tw-ring-inset tw-ring-border hover:tw-bg-muted focus:tw-z-20 focus:tw-outline-offset-0">
            {{ totalPages }}
          </button>

          <button :disabled="currentPage >= totalPages || loading" @click="goToPage(currentPage + 1)"
            class="tw-relative tw-inline-flex tw-items-center tw-rounded-r-md tw-px-2 tw-py-2 tw-text-muted-foreground tw-ring-1 tw-ring-inset tw-ring-border hover:tw-bg-muted focus:tw-z-20 focus:tw-outline-offset-0 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed">
            <span class="tw-sr-only">Next</span>
            <svg class="tw-h-5 tw-w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
