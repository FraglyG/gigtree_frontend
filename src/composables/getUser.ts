import { getUserCallback } from "@/lib/store";
import { onMounted, ref } from "vue";

export function useGetUser() {
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

    return {
        user,
        isLoading,
        isOffline
    }
}