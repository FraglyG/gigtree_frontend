<script setup lang="ts">
import Logo from '../../brand/logo.vue';
import Navigation from "./navigation.vue";
import UserIcon from "./userIcon.vue";


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

</script>

<template>
    <div :class="layoutClasses.container">
        <!-- ===== MOBILE LAYOUT ===== -->
        <div :class="layoutClasses.mobile.wrapper">
            <div :class="layoutClasses.mobile.header">
                <Logo />
                <UserIcon />
            </div>
            <div :class="layoutClasses.mobile.navigation">
                <Navigation />
            </div>
        </div>

        <!-- ===== DESKTOP LAYOUT ===== -->
        <div :class="layoutClasses.desktop.wrapper">
            <Logo />
            <div :class="layoutClasses.desktop.navigation">
                <Navigation />
            </div>
            <div :class="layoutClasses.desktop.avatar">
                <UserIcon />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
