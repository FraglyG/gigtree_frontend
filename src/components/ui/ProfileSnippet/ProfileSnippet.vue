<script setup lang="ts">
import { useGetUser } from '@/composables/getUser';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const { user, isLoading, isOffline } = useGetUser();

</script>

<template>
    <div class="tw-flex tw-flex-row tw-flex-wrap tw-gap-2 sm:tw-gap-4">
        <Avatar :size-px="56" :src="user?.profile.profilePicture" />

        <div class="tw-w-fit tw-flex tw-flex-col tw-justify-start">
            <div v-if="isLoading" class="tw-flex tw-flex-row tw-gap-2">
                <Skeleton class="tw-w-24 tw-h-5 tw-rounded-md" />
                <Skeleton class="tw-w-24 tw-h-5 tw-rounded-md" />
            </div>
            <p v-else-if="isOffline" class="tw-text-lg tw-font-semibold">Offline User</p>
            <p v-else-if="!isLoading && !isOffline" class="tw-text-lg tw-font-semibold">{{ user ?
                `${user.profile.firstName}
                ${user.profile.lastName}` : `Guest User` }}</p>

            <Skeleton v-if="isLoading" class="tw-w-20 tw-h-4 tw-rounded-md tw-mt-2" />
            <p v-else-if="isOffline" class="tw-text-sm tw-text-secondary">@unknown</p>
            <p v-else-if="!isLoading && !isOffline" class="tw-text-sm tw-text-secondary">{{ user ?
                `@${user.username}` : "@guest" }}</p>
        </div>
    </div>
</template>

<style scoped></style>