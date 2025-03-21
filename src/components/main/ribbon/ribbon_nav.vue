<script setup lang="ts">
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

type NavSection = {
    type: "card";
    title: string;
    card: {
        title: string;
        description: string;
        href: string;
    }
    entries: NavEntry[];
} | {
    type: "link";
    title: string;
    href: string;
}

type NavEntry = {
    type: "item"
    title: string
    href: string
    description: string
}

const navSections: NavSection[] = [
    {
        type: "card",
        title: "Start Hiring",
        card: {
            title: "GigTree",
            description: "Get gigs done with ease, connecting talent with those who need it.",
            href: "/",
        },
        entries: [
            {
                type: "item",
                title: "Hiring Quickstart",
                href: "/docs/hiring/quickstart",
                description: "Learn how to find the help you need.",
            },
            {
                type: "item",
                title: "Safety Guide",
                href: "/docs/hiring/safety",
                description: "How to stay safe when hiring talent.",
            },
            {
                type: "item",
                title: "Hiring Process",
                href: "/docs/hiring/process",
                description: "Read about the process involved with hiring.",
            },
        ]
    },
    {
        type: "card",
        title: "Start Working",
        card: {
            title: "GigTree",
            description: "Get gigs done with ease, connecting talent with those who need it.",
            href: "/",
        },
        entries: [
            {
                type: "item",
                title: "Working Quickstart",
                href: "/docs/working/quickstart",
                description: "Learn how to get started with your first gig.",
            },
            {
                type: "item",
                title: "Safety Guide",
                href: "/docs/working/safety",
                description: "How to stay safe when working for others.",
            },
            {
                type: "item",
                title: "Working Process",
                href: "/docs/working/process",
                description: "Read about the process involved with working.",
            },
        ]
    },
    {
        type: "link",
        title: "About Us",
        href: "/about",
    },
]

</script>

<template>
    <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem v-for="section in navSections" :key="section.title">
                <template v-if="section.type == 'card'">
                    <NavigationMenuTrigger>{{ section.title }}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul
                            class="tw-grid tw-gap-3 tw-p-6 md:tw-w-[400px] lg:tw-w-[500px] lg:tw-grid-cols-[minmax(0,.75fr)_minmax(0,1fr)]">
                            <li class="tw-row-span-3">
                                <NavigationMenuLink as-child>
                                    <a class="tw-flex tw-h-full tw-w-full tw-select-none tw-flex-col tw-justify-end tw-rounded-md tw-bg-gradient-to-b tw-from-muted/50 tw-to-muted tw-p-6 tw-no-underline tw-outline-none focus:tw-shadow-md"
                                        :href="section.card.href">
                                        <img src="/logo.svg" class="tw-h-6 tw-w-6">
                                        <div class="tw-mb-2 tw-mt-4 tw-text-lg tw-font-medium">
                                            {{ section.card.title }}
                                        </div>
                                        <p class="tw-text-sm tw-leading-tight tw-text-muted-foreground">
                                            {{ section.card.description }}
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>

                            <li v-for="entry in section.entries" :key="entry.title">
                                <NavigationMenuLink as-child>
                                    <a :href="entry.href"
                                        class="tw-block tw-select-none tw-space-y-1 tw-rounded-md tw-p-3 tw-leading-none tw-no-underline tw-outline-none tw-transition-colors hover:tw-bg-accent hover:tw-text-accent-foreground focus:tw-bg-accent focus:tw-text-accent-foreground">
                                        <div class="tw-text-sm tw-font-medium tw-leading-none">{{ entry.title }}</div>
                                        <p class="tw-line-clamp-2 tw-text-sm tw-leading-snug tw-text-muted-foreground">
                                            {{ entry.description }}
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </template>
                <template v-else-if="section.type == 'link'">
                    <NavigationMenuLink href="/about" :class="navigationMenuTriggerStyle()">
                        {{ section.title }}
                    </NavigationMenuLink>
                </template>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
</template>

<style scoped lang="postcss">
/* kinda scuffed but it works */

.ribbon_entry {
    @apply tw-p-6;
}

:deep([data-menu-item]>a),
:deep([data-menu-item]>button) {
    @apply ribbon_entry;
}

@media screen and (max-width: 1000px) {
    .ribbon_entry {
        @apply tw-p-2;
    }
}

@media screen and (max-width: 600px) {
    .ribbon_entry {
        @apply tw-p-1;
    }
}
</style>