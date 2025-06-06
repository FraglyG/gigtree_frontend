<script setup lang="ts">
import { toRefs } from 'vue';

const props = withDefaults(defineProps<{
    modelValue?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    readonly?: boolean;
}>(), {
    modelValue: '',
    placeholder: 'Type here...',
    type: 'text',
    disabled: false,
    readonly: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const refs = toRefs(props);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

</script>

<template>
    <input :value="modelValue" @input="handleInput" :placeholder="placeholder" :type="type" :disabled="disabled"
        :readonly="readonly"
        class="tw-w-full tw-p-2 tw-text-sm tw-transition-colors focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2" />
</template>

<style scoped>
input {
    background-color: hsl(var(--input));
    color: hsl(var(--input-foreground));
    border: 1px solid hsl(var(--input-border));
    border-radius: 0.375rem;
}

input:focus {
    box-shadow: 0 0 0 2px hsl(var(--ring));
}
</style>