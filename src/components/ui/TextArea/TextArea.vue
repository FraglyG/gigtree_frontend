<script setup lang="ts">
import { toRefs } from 'vue';

const props = withDefaults(defineProps<{
    modelValue?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    readonly?: boolean;
}>(), {
    modelValue: '',
    placeholder: 'Type here...',
    rows: 3,
    disabled: false,
    readonly: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const refs = toRefs(props);

const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
}

</script>

<template>
    <textarea :value="modelValue" @input="handleInput" :placeholder="placeholder" :rows="rows" :disabled="disabled"
        :readonly="readonly"
        class="tw-w-full tw-p-2 tw-text-sm tw-transition-colors focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2" />
</template>

<style scoped>
textarea {
    background-color: hsl(var(--input));
    color: hsl(var(--input-foreground));
    border: 1px solid hsl(var(--input-border));
    border-radius: 0.375rem;
}

textarea:focus {
    box-shadow: 0 0 0 2px hsl(var(--ring));
}
</style>