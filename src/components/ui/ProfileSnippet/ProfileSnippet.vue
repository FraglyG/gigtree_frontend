<script setup lang="ts">
import { useGetUser } from '@/composables/getUser';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { computed } from 'vue';

const { user, isLoading, isOffline } = useGetUser();

const props = defineProps<{
    overwriteAvatar?: string;
    overwriteName?: string;
    overwriteUsername?: string;
}>();

const name = computed(() => {
    if (props.overwriteName) return props.overwriteName;
    return user.value ? `${user.value.profile.firstName} ${user.value.profile.lastName}` : 'Guest User';
});

const username = computed(() => {
    if (props.overwriteUsername) return `@${props.overwriteUsername}`;
    return user.value ? `@${user.value.username}` : '@guest';
});

const profilePicture = computed(() => {
    if (props.overwriteAvatar) return props.overwriteAvatar;
    return user.value?.profile.profilePicture || '';
});

</script>

<template>
    <div class="tw-flex tw-flex-row tw-flex-wrap tw-gap-2 sm:tw-gap-4">
        <Avatar :size-px="56" :src="profilePicture" />

        <div class="tw-w-fit tw-flex tw-flex-col tw-justify-start">
            <div v-if="isLoading" class="tw-flex tw-flex-row tw-gap-2">
                <Skeleton class="tw-w-24 tw-h-5 tw-rounded-md" />
                <Skeleton class="tw-w-24 tw-h-5 tw-rounded-md" />
            </div>
            <p v-else-if="isOffline" class="tw-text-lg tw-font-semibold">Offline User</p>
            <p v-else-if="!isLoading && !isOffline" class="tw-text-lg tw-font-semibold">{{ name }}</p>

            <Skeleton v-if="isLoading" class="tw-w-20 tw-h-4 tw-rounded-md tw-mt-2" />
            <p v-else-if="isOffline" class="tw-text-sm tw-text-secondary">@unknown</p>
            <p v-else-if="!isLoading && !isOffline" class="tw-text-sm tw-text-secondary">{{ username }}</p>
        </div>
    </div>
</template>

<style scoped></style>