<script setup lang="ts">
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { ProfileSnippet } from '@/components/ui/ProfileSnippet';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import { useGetUser } from '@/composables/getUser';
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/Button';
import { BriefcaseBusiness } from 'lucide-vue-next';

const { user, isLoading, isOffline } = useGetUser();

watch(user, () => {
    console.log('User data updated:', user.value);
})

const isEditable = ref(true);

</script>

<template>
    <div>
        <!-- PROFILE -->
        <div>
            <div class="tw-flex tw-flex-row tw-justify-between tw-flex-wrap">
                <ProfileSnippet />
                <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                    <!-- CTAs -->
                    <Button variant="primary" size="lg">
                        <BriefcaseBusiness class="tw-w-6 tw-h-6 tw-mr-2 tw-mt-0.5" />
                        Hire
                    </Button>
                </div>
            </div>
        </div>

        <!-- POST EDITING -->
        <div>
            
        </div>
    </div>
</template>

<style scoped></style>