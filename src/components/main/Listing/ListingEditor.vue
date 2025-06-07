<script setup lang="ts">
import { Card, CardHeader, CardBody, CardThumbnail, CardFooter } from '@/components/ui/Card';
import { Button } from "@/components/ui/Button";
import { useGetUser } from '@/composables/getUser';
import { computed, onMounted, ref, watch } from 'vue';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextArea } from '@/components/ui/TextArea';
import { ImagePlus } from 'lucide-vue-next';
import { GigCard } from '@/components/ui/GigCard';
import UserListing from './UserListing.vue';
import { api } from '@/lib/api';
import Photo from '@/components/ui/Photo/Photo.vue';
import { PhotoLoading, PhotoOverlay } from '@/components/ui/Photo';
import { useFileStorage } from '@/composables/fileStorage';

const { triggerUpload } = useFileStorage();
const { user, isLoading, isOffline } = useGetUser();

const listing = ref<Listing | null>(null);
onMounted(async () => {
    // get user's listing

    try {
        const response = await api.request("/api/user/listing");
        const result = await response.json();

        if (!result.success) {
            console.error("Failed to fetch listing:", result.message);
            return;
        }

        listing.value = result.listing as Listing;
    } catch (error) {
        console.error("Error fetching listing:", error);
    }
})

const cardTitle = computed(() => {
    if (isOffline.value) return 'Unknown User';
    return user.value ? `${user.value.profile.firstName} ${user.value.profile.lastName}` : `Unknown User`;
})

const errorMessage = ref<string | null>(null);
const isEditing = ref(false);
const isEditable = computed(() => !isLoading.value && !isOffline.value && user.value && !isEditing.value);

function displayErrorMessage(message: string, duration: number = 5000) {
    const displayMessage = `⚠ ${message}`;
    errorMessage.value = displayMessage;
    setTimeout(() => {
        if (errorMessage.value === displayMessage) errorMessage.value = null;
    }, duration);
}

function getEditableListing() {
    return {
        shortDescription: listing.value?.shortDescription,
        thumbnailUrl: listing.value?.thumbnailUrl,
    };
}

const editableListing = ref<ReturnType<typeof getEditableListing> | null>(getEditableListing());
const preEditEditableListing = ref<typeof editableListing | null>(null);

function revertEditableListing() {
    if (preEditEditableListing.value) {
        editableListing.value = { ...preEditEditableListing.value };
        preEditEditableListing.value = null;
    }
}

function handleEditStart() {
    preEditEditableListing.value = { ...editableListing.value } as any;
    isEditing.value = true;
}

function handleEditCancel() {
    revertEditableListing();
    isEditing.value = false;
}

async function handleEditSave() {
    try {
        // saving data
        const response = await api.request("/api/user/listing/update", {
            method: "POST",
            body: JSON.stringify(editableListing.value)
        });

        const result = await response.json();

        if (!result.success) {
            const displayError = result.validationErrors ? result.validationErrors.map((t: string) => t.split(":")[1]!).join(', ') : result.message;
            displayErrorMessage(displayError, 10_000);
            return;
        }

        console.log('Listing updated successfully');
        listing.value = result.data as Listing;
        isEditing.value = false;
    } catch (error) {
        console.error("Error updating listing:", error);
        displayErrorMessage("Failed to update listing. Please try again later.");
    }
}

watch(listing, (newListing) => {
    if (listing.value) editableListing.value = getEditableListing()
    else editableListing.value = null;
}, { immediate: true });

async function handleImageButtonClick() {
    if (!editableListing.value) {
        displayErrorMessage('Please log in to update your profile picture.');
        return;
    }

    triggerUpload((res, err) => {
        if (err) {
            console.error('Error uploading profile picture:', err);
            displayErrorMessage(`Failed to upload profile picture: ${err.error}`);
            return;
        }
        if (!res) return;

        editableListing.value!.thumbnailUrl = res.url;
    });
}

</script>

<template>
    <div style="min-width: 240px; max-width: 240px;">
        <!-- Error Display -->
        <div v-if="errorMessage" class="tw-text-red-500 tw-text-sm tw-p-2">
            <p id="listing_error_message">{{ errorMessage }}</p>
        </div>

        <!-- actoion row -->
        <Card class="tw-my-2">
            <CardBody class="tw-w-full tw-flex tw-flex-row tw-justify-end tw-gap-2 tw-p-2">
                <div v-if="isEditing" class="tw-flex tw-flex-row tw-items-center tw-gap-2">
                    <Button size="sm" variant="secondary" @click="handleEditCancel">Cancel</Button>
                    <Button size="sm" variant="primary" @click="handleEditSave">Save</Button>
                </div>
                <div v-if="isEditable && !isEditing" class="tw-flex tw-flex-row tw-items-center tw-gap-2">
                    <Button size="sm" variant="secondary" @click="handleEditStart">Edit</Button>
                </div>
                <div v-else-if="!isEditable && isLoading">
                    <Skeleton class="tw-w-20 tw-h-8 tw-rounded" />
                </div>
            </CardBody>
        </Card>

        <!-- card -->
        <Card v-if="isEditing" class="tw-p-1">
            <CardThumbnail>
                <Photo v-if="editableListing" :src="editableListing.thumbnailUrl" alt="Profile Thumbnail"
                    class="tw-w-full tw-h-20 tw-rounded">
                    <PhotoLoading>
                        <Skeleton class="tw-w-full tw-h-[100px]" />
                    </PhotoLoading>

                    <PhotoOverlay>
                        <Button @click="handleImageButtonClick"
                            class="tw-w-full tw-h-full tw-flex tw-flex-row tw-items-center tw-justify-center tw-opacity-75 tw-rounded-none"
                            variant="input">
                            <div class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-2">
                                <ImagePlus class="tw-text-muted-foreground" />
                                <span class="tw-text-muted-foreground">Set Profile Picture</span>
                            </div>
                        </Button>
                    </PhotoOverlay>
                </Photo>


                <!-- <Photo skeleton :src="'https://picsum.photos/500/300.webp?random=1'" alt="Profile Thumbnail">
                    <PhotoLoading>
                        <Skeleton class="tw-w-full tw-h-[100px]" />
                    </PhotoLoading>
                </Photo> -->
            </CardThumbnail>

            <CardHeader class="tw-m-2">
                <!-- Name -->
                <h2 v-if="user" class="tw-font-semibold">{{ cardTitle }}</h2>
                <div v-else-if="isLoading" class="tw-flex tw-flex-row tw-gap-2">
                    <Skeleton class="tw-w-[33%] tw-h-6 tw-rounded" />
                    <Skeleton class="tw-w-[33%] tw-h-6 tw-rounded" />
                </div>
                <div v-else class="tw-text-muted-foreground">Unknown User</div>

                <!-- Short Description -->
                <TextArea v-if="user && editableListing" v-model="editableListing.shortDescription" maxlength="100"
                    :resizable="false" class="tw-mt-2" placeholder="Your profession, selling points, etc."
                    :rows="3"></TextArea>
                <TextArea v-else-if="!editableListing" class="tw-mt-2" readonly
                    placeholder="Please login to edit this" />

            </CardHeader>

            <CardBody>

            </CardBody>

            <CardFooter>

            </CardFooter>
        </Card>
        <UserListing v-else-if="user && listing && !isEditing" :user="user" :listing="listing" />
        <Card v-else-if="user && !listing && !isEditing">
            <CardBody class="tw-p-4">
                <p class="tw-text-muted-foreground tw-font-semibold tw-text-md">No Job Listing.. Yet</p>
                <p class="tw-text-muted-foreground tw-text-sm">Create one by clicking 'Edit' above.</p>
            </CardBody>
        </Card>
        <Card v-else-if="isLoading">
            <CardThumbnail class="tw-pb-2">
                <Skeleton class="tw-w-full tw-h-20 tw-rounded" />
            </CardThumbnail>
            <CardHeader class="tw-p-4 tw-py-2">
                <Skeleton class="tw-w-full tw-h-6 tw-rounded" />
            </CardHeader>
            <CardBody class="tw-p-4 tw-py-2">
                <Skeleton class="tw-w-full tw-h-20 tw-rounded" />
            </CardBody>
        </Card>
    </div>
</template>

<style scoped></style>