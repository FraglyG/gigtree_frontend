import { api } from "./api";

const debug = false; // Enable to see refresh and activity logs
const useCache = false; // whether to store user data in local storage

// Types

export type UserController = User<{
    /** Entry to clarify that this is a user controller */
    isUserController: true;
    /** Update the user with new data */
    update: (newUser: User) => void;
    /** Get an API key from the user, reliably */
    getApiKey: () => Promise<string | undefined>;
}>

export type GetUserOptions = {
    /** Specified if it's only necassery to fetch minified content, results in faster processing */
    minified?: boolean;
    /** Whether to keep this callback function alive for future user update events */
    keepAlive?: boolean;
}
type GetUserCallback = (user?: UserController, err?: string) => Promise<void> | void;

// Objects
const defaultGetUserOptions: GetUserOptions = {
    minified: false
}

const CACHE = {
    currentlyFetching: new Map<string, GetUserCallback[]>(),
    listeners: new Map<string, GetUserCallback[]>(),
}

// HELPER FUNCTIONS


// MAIN FUNCTIONS

/** LocalStorage handler */
export const storage = {
    /** Fetches an item from local storage */
    get: (key: string) => {
        const item = localStorage.getItem(key);
        if (!item) return undefined;

        try {
            return JSON.parse(item);
        } catch (error) {
            console.warn("Failed to parse item from storage: ", error);
            return undefined;
        }
    },
    /** Sets a value in local storage */
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn("Failed to set item to storage: ", error);
            return false;
        }
    },
    /** Deletes a value in local storage */
    delete: (key: string) => {
        localStorage.removeItem(key);
    }
}

/** Fetch user using callback function, if callback returns undefined then error happened */
export function getUserCallback(cb: GetUserCallback, options?: GetUserOptions) {
    // Format Options
    if (!options) options = defaultGetUserOptions;
    else options = { ...defaultGetUserOptions, ...options };

    // Process Options
    const storagePath = options.minified ? 'user_min' : 'user';

    // Attach to listeners if keep-alive
    if (options.keepAlive) {
        const listeners = CACHE.listeners.get(storagePath) || [];
        listeners.push(cb);
        CACHE.listeners.set(storagePath, listeners);
    }

    // Check for currently fetching
    if (CACHE.currentlyFetching.has(storagePath)) {
        if (debug) console.log("[STORE] Already fetching user, attach to queue");
        CACHE.currentlyFetching.get(storagePath)!.push(cb);
        return;
    }

    // Check Cache
    const cachedUser = localStorage.getItem(storagePath);
    if (cachedUser && useCache) {
        try {
            cb(JSON.parse(cachedUser));
        } catch (error) {
            console.warn("Skipping cache fetch: Failed to parse cached user -> ", error);
        }
    } else if (!useCache) {
        // delete cache if it exists
        localStorage.removeItem(storagePath);
    }

    // Add to currently fetching
    CACHE.currentlyFetching.set(storagePath, [cb]); function callCallbackFuncs(user?: User, err?: string) {
        console.log("[STORE] User fetched", user, "Error:", err);

        // embed helper functions
        if (user && !("update" in user)) {
            const userController = {
                ...user,
                isUserController: true,
                update: (newUser: User) => {
                    if (useCache) localStorage.setItem(storagePath, JSON.stringify(newUser));
                    callCallbackFuncs(newUser);
                }
            } as UserController;
            user = userController;
        }

        // run callbacks
        const callbackFunctions = [CACHE.currentlyFetching.get(storagePath), CACHE.listeners.get(storagePath)].flat().filter(e => e !== undefined);
        if (!callbackFunctions || callbackFunctions.length <= 0) return console.warn("No callback functions specified for getUserCallback");
        Promise.all(callbackFunctions.map(cb => cb(user as (UserController | undefined), err))).finally(() => CACHE.currentlyFetching.delete(storagePath));
    }

    // Fetch User
    api.request("/api/user/from/jwt").then(res => {
        if (res.status == 200) {
            res.json().then((user: User) => {
                localStorage.setItem(storagePath, JSON.stringify(user));
                callCallbackFuncs(user);
            });
        } else if (res.status == 401) {
            // Likely not logged in
            localStorage.removeItem(storagePath);
            callCallbackFuncs(undefined, "unauthorized");
        } else if (res.status == 503) {
            // Likely server offline
            callCallbackFuncs(undefined, "offline");
        } else {
            console.error("Unknown failure reason for fetching user: ", res);
            callCallbackFuncs(undefined, "unknown");
        }
    }).catch((err: Error) => {
        if (err.message == "Failed to fetch") {
            // Likely offline
            callCallbackFuncs(undefined, "offline");
            return;
        }

        console.error(`Failed to fetch user: ${err.message}`);
        localStorage.removeItem(storagePath);
        callCallbackFuncs(undefined, "unknown_error");
    });
}