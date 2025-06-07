<script lang="ts" setup>
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetUser } from '@/composables/getUser';
import { User } from 'lucide-vue-next';

const { user, isLoading, isOffline } = useGetUser();

</script>

<template>
    <Button v-if="isOffline" disabled variant="secondary" outline size="md">
        <User class="tw-inline tw-mr-2" />
        Offline
    </Button>
    <Skeleton v-else-if="isLoading" class="tw-w-14 tw-h-14 tw-rounded-full" />
    <Button v-else-if="!user && !isLoading && !isOffline" variant="information" outline size="md" href="/login">
        <User class="tw-inline tw-mr-2" />
        Login
    </Button>
    <Avatar v-else-if="user" :src="user?.profile?.profilePicture" alt="User Profile Picture" />
</template>