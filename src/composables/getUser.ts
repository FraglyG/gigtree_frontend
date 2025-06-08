import { getUserCallback, type UserController } from "@/lib/store";
import { onMounted, ref, onUnmounted } from "vue";

export function useGetUser() {
    const user = ref<UserController | undefined>(undefined);
    const isLoading = ref(true);
    const isOffline = ref(false);

    const updateUser = (_user: UserController | undefined, err?: string) => {
        isLoading.value = false;
        user.value = _user;

        if (err && err == "offline") isOffline.value = true;
        else if (err) console.error(err);
        else isOffline.value = false; // Reset offline state on succ
    };

    onMounted(() => {
        getUserCallback(updateUser, { minified: false, keepAlive: true });
    });

    return {
        user,
        isLoading,
        isOffline
    }
}