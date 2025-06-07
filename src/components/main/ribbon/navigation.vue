<script setup lang="ts">
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetUser } from '@/composables/getUser';
import { computed } from 'vue';


const { user, isLoading, isOffline } = useGetUser();

const navs = computed(() => [
    { name: 'Home', path: '/' },
    (user.value && { name: 'Dashboard', path: '/dashboard' } || { name: 'Register', path: '/register' }),
    (user.value && { name: 'Inbox', path: '/inbox' } || { name: 'Login', path: '/login' }),
].filter(nav => nav !== undefined));

</script>

<template>
    <nav v-if="isLoading" class="tw-flex tw-justify-center tw-py-4">
        <ul class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <li v-for="i in 3" :key="i">
                <Skeleton class="tw-w-16 tw-h-6 tw-rounded-md" />
            </li>
        </ul>
    </nav>
    <nav v-else-if="!isLoading" class="tw-flex tw-justify-center tw-py-4">
        <ul class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <li v-for="nav in navs" :key="nav.name">
                <a :href="nav.path" class="tw-text-lg tw-text-primary hover:tw-text-secondary">{{ nav.name }}</a>
            </li>
        </ul>
    </nav>
</template>

<style scoped></style>