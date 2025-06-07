<script setup lang="ts">
import { GigCard } from '@/components/ui/gigcard';
import type { UserController } from '@/lib/store';

const props = defineProps<{
    user: UserController | User;
    listing: Listing
}>();

</script>

<template>
    <GigCard :name="`${user.profile.firstName} ${user.profile.lastName}`" :description="listing.shortDescription || 'No Description'"
        :thumbnail-url="listing.thumbnailUrl" :user-id="user.userId" />
</template>

<style scoped></style>