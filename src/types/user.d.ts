type User<T = {}> = T & {
    /** User's UUID */
    userId: string;
    /** The user's username */
    username: string;
    /** User's hashed password */
    passwordHash: string;
    /** User's primary configured email, may not be configured depending on server-configuration */
    primaryEmail?: string;

    /** Whether this user's email has been verified */
    emailVerified?: boolean,
    /** Related to user's email verification */
    emailVerification?: {
        /** Whether the user is currently waiting for their email to be verified */
        isPending: boolean;
        /** Store the user's email verification hash */
        verificationCode: string;
        /** When the email verification was sent */
        sendDate: Date;
        /** When the email verification expires */
        expiresAt: Date;
    },

    /** Information relating to the user's profile */
    profile: {
        /** User's bio */
        bio?: string;
        /** User's profile picture */
        profilePicture?: string;
        /** User's first name */
        firstName: string;
        /** User's last name */
        lastName: string;
    }
}