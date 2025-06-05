type TokenPayload = {
    /** The user's ID */
    userId: string;
    /** The refresh token string */
    token: string;
    /** The date when the refresh token expires */
    expiresAt: Date;
    /** The date when the refresh token was issued */
    issuedAt?: Date;
    /** Whether the refresh token has been revoked */
    isRevoked?: boolean;
}
