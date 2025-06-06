<script setup lang="ts">
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { ProfileSnippet } from '@/components/ui/ProfileSnippet';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import { useGetUser } from '@/composables/getUser';
import { computed, ref, toRefs, watch } from 'vue';
import { Button } from '@/components/ui/Button';
import { BriefcaseBusiness } from 'lucide-vue-next';
import { TextArea } from '@/components/ui/TextArea';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';

const props = withDefaults(defineProps<{
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const refs = toRefs(props);

const { user, isLoading, isOffline } = useGetUser();

const isEditable = computed(() => !isLoading.value && !isOffline.value && user.value && refs.canEdit.value);
const isEditing = ref(false);

function displayErrorMessage(message: string, duration: number = 5000) {
    const displayMessage = `⚠ ${message}`;
    const errorMessageElement = document.getElementById('edit_error_message');
    if (errorMessageElement) errorMessageElement.textContent = displayMessage;
    setTimeout(() => {
        if (errorMessageElement && errorMessageElement.textContent == displayMessage) errorMessageElement.textContent = '';
    }, duration);
}

function getEditableProfile() {
    return {
        bio: user.value?.profile.bio,
        firstName: user.value?.profile.firstName || '',
        lastName: user.value?.profile.lastName || '',
        profilePicture: user.value?.profile.profilePicture,
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

        user.value?.update(result.user);
    } catch (e) {
        console.error('Failed to update profile:', e);
        revertEditableProfile();
        displayErrorMessage((e as any).message || 'Failed to update profile. Please try again later.');
    }

    // Disable Editing
    isEditing.value = false;
}

watch(user, () => {
    console.log('User changed:', user.value);
    if (user.value) editableProfile.value = getEditableProfile();
    else editableProfile.value = null;
})

</script>

<template>
    <div>
        <div v-if="isEditable || (refs.canEdit.value && isLoading)">
            <div class="tw-flex tw-flex-row tw-justify-between tw-gap-2">
                <div>
                    <p id="edit_error_message"></p>
                </div>
                <div class="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                    <Button variant="secondary" size="sm" @click="isEditing ? handleCancelEdit() : handleStartEdit()">
                        {{ isEditing ? 'Cancel' : 'Edit' }}
                    </Button>
                    <Button v-if="isEditing" variant="primary" size="sm" @click="handleSaveEdit()">
                        Save
                    </Button>
                </div>
            </div>

            <hr class="tw-my-4" />
        </div>

        <!-- PROFILE -->
        <div>
            <!-- FIRST ROW -->
            <div class="tw-flex tw-flex-row tw-justify-between tw-flex-wrap tw-flex-gap-8">
                <ProfileSnippet class="tw-my-4" />
                <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                    <!-- CTAs -->
                    <Button variant="primary" size="lg">
                        <BriefcaseBusiness class="tw-w-6 tw-h-6 tw-mr-2 tw-mt-0.5" />
                        Hire
                    </Button>
                </div>
            </div>

            <!-- EDITABLE SECOND ROW -->
            <div v-if="isEditable && isEditing"
                class="tw-flex tw-flex-row tw-justify-between tw-flex-wrap tw-gap-2 tw-items-center tw-max-w-96">
                <!-- First Name -->
                <Input v-if="editableProfile" v-model="editableProfile.firstName" class="tw-w-[45%]"
                    placeholder="Enter your name" :disabled="!isEditable" />
                <Input v-else-if="!editableProfile" class="tw-w-[45%]" readonly disabled placeholder="Not Logged In" />

                <!-- Last Name -->
                <Input v-if="editableProfile" v-model="editableProfile.lastName" class="tw-w-[45%]"
                    placeholder="Enter your last name" :disabled="!isEditable" />
                <Input v-else-if="!editableProfile" class="tw-w-[45%]" readonly disabled placeholder="Not Logged In" />
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
                        class="tw-max-w-96 tw-mt-1" />
                    <TextArea v-else-if="isEditing && !editableProfile" class="tw-max-w-96 tw-mt-1" readonly
                        placeholder="Please make sure you're logged in to edit your profile" :rows="3"
                        :disabled="!isEditable" />
                    <p v-else class="tw-text-muted-foreground tw-mt-1 tw-max-w-[60ch]">
                        {{ editableProfile?.bio || "No bio available" }}
                    </p>
                </div>
            </div>
        </div>

        <!-- POST EDITING -->

    </div>
</template>

<style scoped></style>