<script setup lang="ts">
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { ProfileSnippet } from '@/components/ui/ProfileSnippet';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import { useGetUser } from '@/composables/getUser';
import { computed, ref, toRefs, watch } from 'vue';
import { Button } from '@/components/ui/Button';
import { BriefcaseBusiness, ImageMinus, ImagePlus, Mail } from 'lucide-vue-next';
import { TextArea } from '@/components/ui/TextArea';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import StorageApi, { StorageApiError, useFileStorage } from '@/composables/fileStorage';
import { useMessenger } from '@/composables/messanger';


const props = withDefaults(defineProps<{
    canEdit?: boolean;
    class?: string;
    userId?: string;
}>(), {
    canEdit: false
});

const refs = toRefs(props);

const { user: currentUser, isLoading: isCurrentUserLoading, isOffline } = useGetUser();
const { triggerUpload } = useFileStorage();

// State for public profile
const publicUser = ref<User | null>(null);
const isLoadingPublicUser = ref(false);
const publicUserError = ref<string | null>(null);

// Check URL parameters for userId
const urlUserId = ref<string | null>(null);
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    urlUserId.value = urlParams.get('user');
}

// Determine which user to display
const targetUserId = computed(() => props.userId || urlUserId.value);
const isViewingOtherUser = computed(() => !!targetUserId.value);
const user = computed(() => isViewingOtherUser.value ? publicUser.value : currentUser.value);
const isLoading = computed(() => {
    if (isViewingOtherUser.value) {
        return isLoadingPublicUser.value;
    }
    return isCurrentUserLoading.value;
});

// Fetch public user if needed
async function fetchPublicUser(userId: string) {
    if (!userId) return;

    isLoadingPublicUser.value = true;
    publicUserError.value = null;

    try {
        const response = await api.request(`/api/public/user?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch user profile');
        }

        publicUser.value = result.user;
    } catch (error) {
        console.error('Error fetching public user:', error);
        publicUserError.value = error instanceof Error ? error.message : 'Failed to load user profile';
    } finally {
        isLoadingPublicUser.value = false;
    }
}

// Watch for userId changes and fetch accordingly
watch(targetUserId, (newUserId) => {
    if (newUserId) {
        fetchPublicUser(newUserId);
    } else {
        publicUser.value = null;
        publicUserError.value = null;
    }
}, { immediate: true });

const isEditable = computed(() => {
    return !isLoading.value && !isOffline.value && user.value && refs.canEdit.value && !isViewingOtherUser.value
        ? true : false;
});

const isEditing = ref(false);

function displayMessage(message: string, duration: number = 5000) {
    const errorMessageElement = document.getElementById('edit_error_message');
    if (errorMessageElement) errorMessageElement.textContent = message;
    setTimeout(() => {
        if (errorMessageElement && errorMessageElement.textContent == message) errorMessageElement.textContent = '';
    }, duration);
}

function displayErrorMessage(message: string, duration: number = 5000) {
    displayMessage(`⚠ ${message}`);
}

function displayInfoMessage(message: string, duration: number = 5000) {
    displayMessage(`❕ ${message}`);
}

function getEditableProfile() {
    return {
        bio: user.value?.profile.bio,
        firstName: user.value?.profile.firstName || '',
        lastName: user.value?.profile.lastName || '',
        profilePicture: user.value?.profile.profilePicture as string || null,
    };
}
const editableProfile = ref<ReturnType<typeof getEditableProfile> | null>(getEditableProfile());
const preEditEditableProfile = ref<typeof editableProfile | null>(null);

function revertEditableProfile() {
    if (preEditEditableProfile.value) {
        editableProfile.value = { ...preEditEditableProfile.value };
        preEditEditableProfile.value = null;
    }
}

function handleStartEdit() {
    preEditEditableProfile.value = { ...editableProfile.value } as any;
    isEditing.value = true;
}

function handleCancelEdit() {
    revertEditableProfile();
    isEditing.value = false;
}

async function handleSaveEdit() {
    // saving data
    try {
        const response = await api.request("/api/user/update", {
            method: "POST",
            body: JSON.stringify({
                profile: editableProfile.value
            })
        })

        console.log('Profile updated successfully');

        const result = await response.json();

        if (!result.success) {
            const displayError = result.validationErrors ? result.validationErrors.map((t: string) => t.split(":")[1]!).join(', ') : result.message
            displayErrorMessage(displayError, 10_000);
            return;
        }

        // Update user only if it's the current user (has update method)
        if (!isViewingOtherUser.value && currentUser.value?.update) {
            currentUser.value.update(result.user);
        }
    } catch (e) {
        console.error('Failed to update profile:', e);
        revertEditableProfile();
        displayErrorMessage((e as any).message || 'Failed to update profile. Please try again later.');
    }

    // Disable Editing
    isEditing.value = false;
}

// async function handleFileUpload(file: File) {
//     try {
//         const result = await storageApi.upload(file);
//         console.log('Upload successful:', result.url);
//         return result;
//     } catch (error) {
//         if (error instanceof StorageApiError) {
//             console.error('Upload failed:', error.message, error.statusCode);
//         }
//         throw error;
//     }
// }

async function handleProfilePictureUpdateClick() {
    if (!editableProfile.value) {
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

        editableProfile.value!.profilePicture = res.url;
    });
}

watch(user, () => {
    console.log('User changed:', user.value);
    if (user.value) editableProfile.value = getEditableProfile();
    else editableProfile.value = null;

    // recommend profile picture update if no profile picture is set (only for current user)
    if (user.value && !user.value.profile.profilePicture && !isViewingOtherUser.value) {
        displayInfoMessage('Setting a profile picture is recommended', 10_000);
    }
})

const { createChannel } = useMessenger();

async function handleTalkClick() {
    if (!currentUser.value) {
        displayErrorMessage('Please log in to chat with users.');
        return;
    }

    const userId = isViewingOtherUser.value ? targetUserId.value : undefined;
    if (!userId) {
        displayErrorMessage('No user to chat with.');
        return;
    }

    const result = await createChannel(userId);
    if (result && result.channel) {
        window.location.href = `${window.location.origin}/inbox?channel=${result.channel.channelId}`;
    } else {
        console.error('Failed to create or navigate to channel');
        displayErrorMessage('Failed to create chat channel. ' + (result.error || 'Please try again later.'));
    }
}

</script>

<template>
    <div :class="[refs.class]">
        <div>
            <div class="tw-flex tw-flex-row tw-justify-between tw-gap-2">
                <div>
                    <p class="tw-text-sm tw-text-muted-foreground" id="edit_error_message"></p>
                </div>
                <div v-if="isEditable || (canEdit && isLoading)" class="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                    <Button variant="secondary" size="sm" @click="isEditing ? handleCancelEdit() : handleStartEdit()">
                        {{ isEditing ? 'Cancel' : 'Edit' }}
                    </Button>
                    <Button v-if="isEditing" variant="primary" size="sm" @click="handleSaveEdit()">
                        Save
                    </Button>
                </div>
            </div>

            <hr v-if="isEditable || (refs.canEdit.value && isLoading)" class="tw-my-4" />
        </div>

        <!-- Error display for public user fetch -->
        <div v-if="publicUserError"
            class="tw-bg-destructive/10 tw-border tw-border-destructive tw-rounded-md tw-p-4 tw-mb-4">
            <p class="tw-text-destructive tw-text-sm">{{ publicUserError }}</p>
        </div>

        <!-- PROFILE -->
        <div>
            <!-- FIRST ROW -->
            <div class="tw-flex tw-flex-row tw-justify-between tw-flex-wrap tw-flex-gap-8">
                <ProfileSnippet :overwrite-username="user?.username"
                    :overwrite-avatar="(isEditing ? (editableProfile?.profilePicture || null) : (user?.profile.profilePicture || null))"
                    :overwrite-name="isEditing ? `${editableProfile?.firstName} ${editableProfile?.lastName}` : `${user?.profile.firstName} ${user?.profile.lastName}`"
                    class="tw-my-4" />
                <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center tw-mb-4">
                    <!-- CTAs -->
                    <Button variant="information" outline size="lg" @click="handleTalkClick">
                        <Mail class="tw-w-6 tw-h-6 tw-mr-2 tw-mt-0.5" />
                        Contact
                    </Button>
                </div>
            </div>

            <!-- EDITABLE SECOND ROW -->
            <div v-if="isEditable && isEditing" class="tw-w-full">
                <div
                    class="tw-relative tw-flex tw-flex-row tw-justify-between tw-flex-wrap tw-gap-2 tw-items-center tw-max-w-96 tw-mb-4">
                    <!-- First Name -->
                    <Input v-if="editableProfile" v-model="editableProfile.firstName" class="tw-w-[45%]"
                        placeholder="Enter your name" :disabled="!isEditable" />
                    <Input v-else-if="!editableProfile" class="tw-w-[45%]" readonly disabled
                        placeholder="Not Logged In" />

                    <!-- Last Name -->
                    <Input v-if="editableProfile" v-model="editableProfile.lastName" class="tw-w-[45%]"
                        placeholder="Enter your last name" :disabled="!isEditable" />
                    <Input v-else-if="!editableProfile" class="tw-w-[45%]" readonly disabled
                        placeholder="Not Logged In" />
                </div>

                <div class="tw-relative tw-flex tw-flex-row tw-flex-wrap tw-gap-2 tw-items-center tw-max-w-96 tw-mb-4">
                    <!-- Update Profile Picture -->
                    <Button v-if="editableProfile" variant="success" outline size="sm"
                        @click="handleProfilePictureUpdateClick">
                        <div class="tw-flex tw-flex-row tw-items-center">
                            <ImagePlus class="tw-w-4 tw-h-4 tw-mr-2" />
                            Update Avatar
                        </div>
                    </Button>
                    <Button v-else-if="!editableProfile" variant="success" outline size="sm" disabled>
                        Update Avatar
                    </Button>

                    <!-- Remove profile picture -->
                    <Button v-if="editableProfile?.profilePicture" variant="destructive" outline size="sm"
                        @click="editableProfile.profilePicture = null">
                        <div class="tw-flex tw-flex-row tw-items-center">
                            <ImageMinus class="tw-w-4 tw-h-4 tw-mr-2" />
                            Remove Avatar
                        </div>
                    </Button>
                </div>
            </div>

            <br />

            <!-- SECOND ROW -->
            <div>
                <!-- About User -->
                <div>
                    <h2 class="tw-text-lg tw-font-semibold">About</h2>
                    <Skeleton v-if="isLoading" v-for="i in 3" :key="i" class="tw-h-6 tw-mt-2 tw-rounded"
                        :style="{ width: `${Math.random() * 300 + 100}px` }" />
                    <TextArea v-else-if="isOffline" class="tw-max-w-96 tw-mt-1" readonly
                        placeholder="Unable to fetch user's bio due to connection issues..." :rows="3"
                        :disabled="!isEditable" />
                    <TextArea v-else-if="isEditing && editableProfile" v-model="editableProfile.bio"
                        class="tw-max-w-96 tw-mt-1" /> <TextArea v-else-if="isEditing && !editableProfile"
                        class="tw-max-w-96 tw-mt-1" readonly
                        placeholder="Please make sure you're logged in to edit your profile" :rows="3"
                        :disabled="!isEditable" />
                    <p v-else class="tw-text-muted-foreground tw-mt-1 tw-max-w-[60ch]">
                        {{ (isEditing ? editableProfile?.bio : user?.profile.bio) || "No bio available" }}
                    </p>
                </div>
            </div>
        </div>

        <!-- POST EDITING -->

    </div>
</template>

<style scoped></style>