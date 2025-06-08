type Listing = {
    /** UUID for this listing */
    listingId: string;
    /** The user who created this listing */
    ownerUserId: string;

    /** Listing thumbnail */
    thumbnailUrl?: string;
    /** Listing slogan */
    shortDescription?: string;
}