# Messenger API Documentation

## Overview
The Messenger API provides functionality for sending messages, fetching messages, and managing channels between users. All endpoints require JWT authentication.

## Base URL
All endpoints are prefixed with `/api/message`

**Authentication:** Required (JWT), just use the api library to handle this authentication automatically

## Endpoints

### 1. Send Message
**Endpoint:** `POST /api/message/send`

**Description:** Sends a message to a channel or creates a new channel if messaging a user directly.

**Request Body:**
```json
{
  "content": "string",     // Required: Message content (1-500 characters)
  "channelId": "string",   // Optional: Specific channel ID (max 50 characters)
  "targetUserId": "string" // Optional: Target user ID for direct messaging (max 50 characters)
}
```

**Validation Rules:**
- Either `channelId` OR `targetUserId` must be provided (not both, not neither)
- `content`: Required, 1-500 characters, cannot be empty
- `channelId`: Optional, max 50 characters
- `targetUserId`: Optional, max 50 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully.",
  "data": {
    "messageId": "string",
    "channelId": "string",
    "senderUserId": "string",
    "content": "string",
    "createdAt": "ISO Date",
    "updatedAt": "ISO Date"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid request (missing channelId/targetUserId)
- **404 Not Found:** Channel not found or user not a member
- **500 Internal Server Error:** Failed to send message

---

### 2. Fetch Messages
**Endpoint:** `GET /api/message/:channelId/messages`

**Description:** Retrieves messages from a specific channel, sorted by creation date (newest first).

**URL Parameters:**
- `channelId` (string): The ID of the channel to fetch messages from

**Query Parameters:**
```json
{
  "limit": "number" // Optional: Number of messages to fetch (1-100, default: 20)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "string",
      "channelId": "string",
      "senderUserId": "string",
      "content": "string",
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    }
  ]
}
```

**Error Responses:**
- **400 Bad Request:** Channel ID is required
- **404 Not Found:** Channel not found or user not a member
- **500 Internal Server Error:** Failed to fetch messages

---

### 3. Fetch Channels
**Endpoint:** `GET /api/message/channels`

**Description:** Retrieves all channels that the authenticated user is a member of, including latest message and other participants' information.

**Query Parameters:**
```json
{
  "limit": "number" // Optional: Number of channels to fetch (1-100, default: 20)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "channelId": "string",
      "ownerUserIds": ["string"],
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date",
      "latestMessage": {
        "messageId": "string",
        "channelId": "string",
        "senderUserId": "string",
        "content": "string",
        "createdAt": "ISO Date",
        "updatedAt": "ISO Date"
      } | null,
      "otherUsers": [
        {
          "userId": "string",
          "username": "string"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- **500 Internal Server Error:** Failed to fetch channels

---

## Data Models

### Message Interface
```typescript
interface MessageInterface {
  messageId: string;      // Unique message identifier
  channelId: string;      // Channel this message belongs to
  senderUserId: string;   // User who sent the message
  content: string;        // Message content
  createdAt: Date;        // When the message was created
  updatedAt: Date;        // When the message was last updated
}
```

### Channel Interface
```typescript
interface ChannelInterface {
  channelId: string;      // Unique channel identifier
  ownerUserIds: string[]; // Array of user IDs participating in the channel
  createdAt: Date;        // When the channel was created
  updatedAt: Date;        // When the channel was last updated
}
```

## Utility Functions

### findChannelByEitherChannelIdOrTargetId
**Internal utility function used by the send message endpoint**

**Parameters:**
- `user`: UserInterface - The authenticated user
- `channelId?`: string - Optional channel ID to search for
- `targetUserId?`: string - Optional target user ID for direct messaging

**Behavior:**
- If `channelId` is provided: Searches for existing channel by ID
- If `targetUserId` is provided: Searches for existing channel between current user and target user
- If no channel exists for direct messaging, creates a new channel automatically
- Returns channel ID if found/created, or error if channel doesn't exist when searching by ID

## Error Handling
All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error description"
}
```

Common error types:
- `Invalid Request`: Bad request parameters
- `Channel Not Found`: Requested channel doesn't exist or user lacks access
- `Internal Server Error`: Server-side processing errors

## Notes
- Messages are limited to 500 characters
- Channels are automatically created when messaging a user directly
- All responses include timestamps in ISO format
- Messages are sorted by creation date (newest first)
- Users can only access channels they are members of
- The API supports both direct messaging (user-to-user) and group channels