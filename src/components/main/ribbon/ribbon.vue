<script setup lang="ts">
import { Photo, PhotoFallback, PhotoLoading } from '@/components/ui/Photo';
import Logo from '../../brand/logo.vue';
import { User } from 'lucide-vue-next';
import { Skeleton } from '@/components/ui/Skeleton';
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { Avatar } from '@/components/ui/Avatar';
import { getUserCallback } from '@/lib/store';
import { Button } from '@/components/ui/Button';

const user = ref<User | undefined>(undefined);
const isLoading = ref(true);
const isOffline = ref(false);

onMounted(() => {
    // fetch user
    getUserCallback((_user, err) => {
        isLoading.value = false;
        user.value = _user;

        if (err && err == "offline") isOffline.value = true;
        else if (err) console.error(err);
    }, { minified: false });
})

// ===== CONSTANTS =====
const USER_AVATAR_URL = "https://isdev.co/pfp.png";
const AVATAR_SIZE = "tw-w-14 tw-h-14";
const PLACEHOLDER_TEXT = "Soon™";

// ===== COMPUTED PROPERTIES =====
const userAvatarProps = computed(() => ({
    src: USER_AVATAR_URL,
    alt: "User Avatar",
    class: `${AVATAR_SIZE} tw-rounded-full`
}));

// ===== LAYOUT CLASSES =====
const layoutClasses = {
    container: "tw-w-full tw-p-5",
    mobile: {
        wrapper: "md:tw-hidden",
        header: "tw-flex tw-justify-between",
        navigation: "tw-col-span-2 tw-flex tw-justify-center tw-mt-3"
    },
    desktop: {
        wrapper: "tw-hidden md:tw-grid md:tw-grid-cols-3 tw-items-center",
        navigation: "tw-flex tw-justify-center",
        avatar: "tw-flex tw-justify-end"
    },
    placeholder: "tw-text-muted-foreground tw-text-sm"
};

// ===== REUSABLE COMPONENTS =====
const UserAvatar = defineComponent({
    name: 'UserAvatar',
    setup() { return () => h(Avatar, userAvatarProps.value) }
});

const PlaceholderNav = defineComponent({
    name: 'PlaceholderNav',
    setup() {
        return () => h('div', { class: layoutClasses.placeholder }, PLACEHOLDER_TEXT);
    }
});

</script>

<template>
    <div :class="layoutClasses.container">
        <!-- ===== MOBILE LAYOUT ===== -->
        <div :class="layoutClasses.mobile.wrapper">
            <div :class="layoutClasses.mobile.header">
                <Logo />

                <p> IMPLEMENT MEEE </p>
            </div>
            <div :class="layoutClasses.mobile.navigation">
                <PlaceholderNav />
            </div>
        </div>

        <!-- ===== DESKTOP LAYOUT ===== -->
        <div :class="layoutClasses.desktop.wrapper">
            <Logo />
            <div :class="layoutClasses.desktop.navigation">
                <PlaceholderNav />
            </div>
            <div :class="layoutClasses.desktop.avatar">
                <Button v-if="isOffline" disabled variant="secondary" outline size="md">
                    <User class="tw-inline tw-mr-2" />
                    Offline
                </Button>
                <Skeleton v-else-if="isLoading" class="tw-w-14 tw-h-14 tw-rounded-full" />
                <Button v-else-if="!user && !isLoading && !isOffline" variant="information" outline size="md">
                    <User class="tw-inline tw-mr-2" />
                    Login
                </Button>
                <UserAvatar v-else-if="user" />

            </div>
        </div>
    </div>
</template>

<style scoped></style>
