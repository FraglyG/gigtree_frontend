<script setup lang="ts">
interface Props {
  show: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
});

const emit = defineEmits<{
  close: [];
}>();

function closeModal() {
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

const sizeClasses = {
  sm: 'tw-max-w-md',
  md: 'tw-max-w-lg',
  lg: 'tw-max-w-2xl',
  xl: 'tw-max-w-4xl'
};
</script>

<template>
  <Teleport to="body">
    <div v-if="show"
      class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-muted/60 tw-transition-opacity"
      aria-labelledby="modal-title" role="dialog" aria-modal="true" @click="handleBackdropClick">
      <!-- Modal panel -->
      <div :class="[
        'tw-relative tw-bg-card tw-rounded-2xl tw-shadow-2xl tw-border tw-border-muted-foreground/10 tw-px-6 tw-py-6 tw-flex tw-flex-col tw-items-center tw-gap-2',
        sizeClasses[size],
        'tw-max-w-full sm:tw-max-w-md md:tw-max-w-lg lg:tw-max-w-2xl xl:tw-max-w-4xl'
      ]" style="min-width: 320px;" @click.stop>
        <button type="button"
          class="tw-absolute tw-top-4 tw-right-4 tw-bg-transparent tw-rounded-full tw-p-2 tw-text-muted-foreground hover:tw-text-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-primary"
          @click="closeModal">
          <span class="tw-sr-only">Close</span>
          <svg class="tw-h-6 tw-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="tw-text-xl tw-font-semibold tw-text-foreground tw-mb-2 tw-w-full tw-text-center" id="modal-title">
          {{ title }}
        </h3>
        <div class="tw-w-full tw-py-2">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="tw-mt-4 tw-w-full">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
