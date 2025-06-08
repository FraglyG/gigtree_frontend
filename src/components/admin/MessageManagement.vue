<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { adminApi, type AdminMessage, type AdminChannel } from '@/lib/adminApi';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';

const channels = ref<AdminChannel[]>([]);
const messages = ref<AdminMessage[]>([]);
const selectedChannel = ref<AdminChannel | null>(null);
const selectedMessage = ref<AdminMessage | null>(null);
const showMessageModal = ref(false);
const showChannelModal = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// Pagination
const currentPage = ref(1);
const channelsPage = ref(1);
const messagesPage = ref(1);
const pageSize = ref(20);
const totalMessages = ref(0);
const totalChannels = ref(0);

// Search and filters
const searchTerm = ref('');
const selectedChannelId = ref<string | null>(null);
const sortBy = ref<string>('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');
const isSearching = ref(false);

const channelColumns = [
  { key: 'channelId', title: 'Channel ID', label: 'Channel ID', sortable: false },
  { key: 'participants', title: 'Participants', label: 'Participants', sortable: false },
  { key: 'messageCount', title: 'Messages', label: 'Messages', sortable: false },
  { key: 'createdAt', title: 'Created', label: 'Created', sortable: true },
  { key: 'actions', title: 'Actions', label: 'Actions', sortable: false }
];

const messageColumns = [
  { key: 'content', title: 'Message', label: 'Message', sortable: false },
  { key: 'sender', title: 'Sender', label: 'Sender', sortable: false },
  { key: 'channel', title: 'Channel', label: 'Channel', sortable: false },
  { key: 'createdAt', title: 'Sent', label: 'Sent', sortable: true },
  { key: 'isEdited', title: 'Edited', label: 'Edited', sortable: false },
  { key: 'actions', title: 'Actions', label: 'Actions', sortable: false }
];

const filteredChannels = computed(() => {
  return channels.value; // Moved to server-side filtering
});

const filteredMessages = computed(() => {
  return messages.value; // Moved to server-side filtering
});

async function loadChannels() {
  loading.value = true;
  error.value = null;
  try {
    const response = await adminApi.getChannels({
      page: channelsPage.value,
      limit: pageSize.value,
      sort: sortOrder.value,
    });
    channels.value = response.channels;
    totalChannels.value = response.total;
  } catch (err) {
    error.value = 'Failed to load channels';
    console.error('Error loading channels:', err);
  } finally {
    loading.value = false;
  }
}

async function loadMessages() {
  loading.value = true;
  error.value = null;
  try {
    if (searchTerm.value.trim()) {
      // Use search endpoint when there's a search term
      isSearching.value = true;
      const response = await adminApi.searchMessages({
        query: searchTerm.value.trim(),
        page: messagesPage.value,
        limit: pageSize.value,
        sort: sortOrder.value,
      });
      messages.value = response.data;
      totalMessages.value = response.pagination.totalCount;
    } else if (selectedChannelId.value) {
      // Load messages for specific channel
      const response = await adminApi.getMessages({
        page: messagesPage.value,
        limit: pageSize.value,
        channelId: selectedChannelId.value,
        sort: sortOrder.value,
      });
      messages.value = response.messages.data;
      totalMessages.value = response.messages.pagination.totalCount;
    } else {
      // Load all messages if no specific channel is selected
      const response = await adminApi.getMessages({
        page: messagesPage.value,
        limit: pageSize.value,
        sort: sortOrder.value,
      });
      messages.value = response.messages.data;
      totalMessages.value = response.messages.pagination.totalCount;
    }
  } catch (err) {
    error.value = 'Failed to load messages';
    console.error('Error loading messages:', err);
  } finally {
    loading.value = false;
    isSearching.value = false;
  }
}

async function deleteMessage(messageId: string) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    await adminApi.deleteMessage(messageId);
    await loadMessages();
  } catch (err) {
    error.value = 'Failed to delete message';
    console.error('Error deleting message:', err);
  }
}

// async function deleteChannel(channelId: string) {
//   if (!confirm('Are you sure you want to delete this channel? This will delete all messages in the channel.')) return;

//   try {
//     await adminApi.deleteChannel(channelId);
//     await loadChannels();
//     // Reset selected channel if it was deleted
//     if (selectedChannelId.value === channelId) {
//       selectedChannelId.value = null;
//       messages.value = [];
//     }
//   } catch (err) {
//     error.value = 'Failed to delete channel';
//     console.error('Error deleting channel:', err);
//   }
// }

function viewMessage(message: AdminMessage) {
  selectedMessage.value = message;
  showMessageModal.value = true;
}

function viewChannel(channel: AdminChannel) {
  selectedChannel.value = channel;
  showChannelModal.value = true;
}

function selectChannel(channelId: string | null) {
  selectedChannelId.value = channelId;
  messagesPage.value = 1;
  loadMessages();
}

function handleChannelPageChange(page: number) {
  channelsPage.value = page;
  loadChannels();
}

function handleMessagePageChange(page: number) {
  messagesPage.value = page;
  loadMessages();
}

function handleSearch() {
  messagesPage.value = 1;
  loadMessages();
}

function clearSearch() {
  searchTerm.value = '';
  messagesPage.value = 1;
  loadMessages();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function truncateContent(content: string, maxLength: number = 50) {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
}

function getSenderName(sender: any) {
  if (typeof sender === 'string') return sender;
  if (sender && typeof sender === 'object') {
    return sender.username || sender.name || 'Unknown User';
  }
  return 'Unknown User';
}

function getSenderEmail(sender: any) {
  if (sender && typeof sender === 'object') {
    return sender.primaryEmail || sender.email || '';
  }
  return '';
}

function getSenderInitial(sender: any) {
  const name = getSenderName(sender);
  return name.charAt(0).toUpperCase();
}

function getChannelName(channel: any) {
  if (typeof channel === 'string') return channel;
  if (channel && typeof channel === 'object') {
    return channel.name || channel.channelId || 'Unknown Channel';
  }
  return 'Unknown Channel';
}

onMounted(() => {
  loadChannels();
  loadMessages();
});

function handleChannelSort(column: string, order: 'asc' | 'desc') {
  // Only allow sorting by createdAt
  if (column !== 'createdAt') return;
  
  sortBy.value = column;
  sortOrder.value = order;
  channelsPage.value = 1;
  loadChannels();
}

function handleMessageSort(column: string, order: 'asc' | 'desc') {
  // Only allow sorting by createdAt
  if (column !== 'createdAt') return;
  
  sortBy.value = column;
  sortOrder.value = order;
  messagesPage.value = 1;
  loadMessages();
}

function handleSortChange() {
  // Reset pages and reload data when sort order changes
  // Keep sortBy as 'createdAt' since that's the only thing I've added up until now
  sortBy.value = 'createdAt';
  channelsPage.value = 1;
  messagesPage.value = 1;
  loadChannels();
  loadMessages();
}
</script>

<template>
  <div class="tw-space-y-6">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center">
      <h2 class="tw-text-2xl tw-font-bold tw-text-foreground">Message Management</h2>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="tw-bg-destructive/10 tw-border tw-border-destructive tw-rounded-md tw-p-4">
      <div class="tw-flex">
        <div class="tw-text-sm tw-text-destructive">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="tw-bg-card tw-p-4 tw-rounded-lg tw-shadow tw-space-y-4">
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Search Messages
          </label>
          <div class="tw-flex tw-gap-2">
            <input v-model="searchTerm" @keyup.enter="handleSearch" type="text"
              placeholder="Search messages or users..."
              class="tw-flex-1 tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
            <button @click="handleSearch" :disabled="isSearching"
              class="tw-px-4 tw-py-2 tw-bg-primary tw-text-primary-foreground tw-rounded-md hover:tw-bg-primary/90 disabled:tw-opacity-50">
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
            <button v-if="searchTerm" @click="clearSearch"
              class="tw-px-4 tw-py-2 tw-bg-secondary tw-text-secondary-foreground tw-rounded-md hover:tw-bg-secondary/90">
              Clear
            </button>
          </div>
        </div>
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Channel ID Search
          </label>
          <input v-model="selectedChannelId" @input="selectChannel(selectedChannelId)" type="text"
            placeholder="Enter channel ID to filter..."
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary" />
        </div>
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground tw-mb-1">
            Sort Order
          </label>
          <select v-model="sortOrder" @change="handleSortChange"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-md tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-primary">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Channels Section -->
    <div class="tw-bg-card tw-rounded-lg tw-shadow">
      <div class="tw-px-6 tw-py-4 tw-border-b tw-border-border">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">Channels</h3>
      </div>
      
      <DataTable :columns="channelColumns" :data="filteredChannels" :loading="loading" :sort-by="sortBy" :sort-order="sortOrder" @sort="handleChannelSort">
        <template #cell-channelId="{ row }">
          <div class="tw-font-medium tw-text-foreground">{{ row.channelId }}</div>
          <div class="tw-text-sm tw-text-muted-foreground">Created {{ formatDate(row.createdAt) }}</div>
        </template> <template #cell-participants="{ row }">
          <div class="tw-space-y-1">
            <div v-if="row.participantDetails && row.participantDetails.length > 0">
              <div v-for="participant in row.participantDetails.slice(0, 3)" :key="participant.userId"
                class="tw-flex tw-items-center tw-space-x-2">
                <div class="tw-w-6 tw-h-6 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <span class="tw-text-xs tw-font-medium tw-text-muted-foreground">
                    {{ participant.profile?.firstName?.charAt(0) || participant.username.charAt(0) }}
                  </span>
                </div>
                <span class="tw-text-sm tw-text-foreground">
                  {{ participant.profile?.firstName && participant.profile?.lastName
                    ? `${participant.profile.firstName} ${participant.profile.lastName}`
                    : participant.username }}
                </span>
              </div>
              <div v-if="row.participantDetails.length > 3" class="tw-text-xs tw-text-muted-foreground">
                +{{ row.participantDetails.length - 3 }} more
              </div>
            </div>
            <div v-else class="tw-text-sm tw-text-muted-foreground">
              {{ row.memberCount || row.participants?.length || 0 }} participants
            </div>
          </div>
        </template>

        <template #cell-messageCount="{ row }">
          <span class="tw-text-sm tw-text-foreground">{{ row.messageCount || 0 }}</span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="tw-text-sm tw-text-muted-foreground">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="tw-flex tw-space-x-2">
            <button @click="viewChannel(row)" class="tw-text-primary hover:tw-underline tw-text-sm tw-font-medium">
              View
            </button>
            <button @click="selectChannel(row.channelId)"
              class="tw-text-success hover:tw-underline tw-text-sm tw-font-medium">
              Messages
            </button>
          </div>
        </template>
      </DataTable>

      <div class="tw-px-6 tw-py-4 tw-border-t tw-border-border">
        <Pagination :current-page="channelsPage" :total-pages="Math.ceil(totalChannels / pageSize)"
          :total-items="totalChannels" :items-per-page="pageSize" @pageChange="handleChannelPageChange" />
      </div>
    </div>

    <!-- Messages Section -->
    <div class="tw-bg-card tw-rounded-lg tw-shadow">
      <div class="tw-px-6 tw-py-4 tw-border-b tw-border-border">
        <h3 class="tw-text-lg tw-font-medium tw-text-foreground">
          Messages
          <span v-if="selectedChannelId" class="tw-text-sm tw-text-muted-foreground">
            (Channel: {{ selectedChannelId }})
          </span>
          <span v-if="searchTerm" class="tw-text-sm tw-text-muted-foreground">
            (Search: "{{ searchTerm }}")
          </span>
        </h3>
      </div>

      <DataTable :columns="messageColumns" :data="filteredMessages" :loading="loading" :sort-by="sortBy" :sort-order="sortOrder" @sort="handleMessageSort">
        <template #cell-content="{ row }">
          <div class="tw-max-w-md">
            <p class="tw-text-sm tw-text-foreground">{{ truncateContent(row.content) }}</p>
            <div v-if="row.attachments && row.attachments.length > 0" class="tw-mt-1">
              <span
                class="tw-inline-flex tw-items-center tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-bg-muted tw-text-muted-foreground">
                {{ row.attachments.length }} attachment(s)
              </span>
            </div>
          </div>
        </template>
        <template #cell-sender="{ row }">
          <div class="tw-flex tw-items-center">
            <div class="tw-w-8 tw-h-8 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-xs tw-font-medium tw-text-muted-foreground">
                {{ getSenderInitial(row.sender) }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ getSenderName(row.sender) }}</div>
              <div class="tw-text-sm tw-text-muted-foreground">{{ getSenderEmail(row.sender) }}</div>
            </div>
          </div>
        </template>

        <template #cell-channel="{ row }">
          <span class="tw-text-sm tw-text-foreground">{{ getChannelName(row.channel) }}</span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="tw-text-sm tw-text-muted-foreground">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #cell-isEdited="{ row }">
          <span v-if="row.isEdited"
            class="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-warning/10 tw-text-warning">
            Edited
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="tw-flex tw-space-x-2">
            <button @click="viewMessage(row)" class="tw-text-primary hover:tw-underline tw-text-sm tw-font-medium">
              View
            </button>
            <button @click="deleteMessage(row.messageId)"
              class="tw-text-destructive hover:tw-underline tw-text-sm tw-font-medium">
              Delete
            </button>
          </div>
        </template>
      </DataTable>

      <div class="tw-px-6 tw-py-4 tw-border-t tw-border-border">
        <Pagination :current-page="messagesPage" :total-pages="Math.ceil(totalMessages / pageSize)"
          :total-items="totalMessages" :items-per-page="pageSize" @pageChange="handleMessagePageChange" />
      </div>
    </div>

    <!-- Message Details Modal -->
    <Modal :show="showMessageModal" @close="showMessageModal = false" title="Message Details">
      <div v-if="selectedMessage" class="tw-space-y-4">
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Sender</label>
          <div class="tw-flex tw-items-center tw-mt-1">
            <div class="tw-w-10 tw-h-10 tw-bg-muted tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3">
              <span class="tw-text-sm tw-font-medium tw-text-muted-foreground">
                {{ selectedMessage.sender.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ selectedMessage.sender.username }}</div>
              <div class="tw-text-sm tw-text-muted-foreground">{{ selectedMessage.sender.primaryEmail }}</div>
            </div>
          </div>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Channel</label>
          <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedMessage.channel.name }}</p>
        </div>

        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Content</label>
          <div class="tw-mt-1 tw-p-3 tw-bg-muted tw-rounded-md">
            <p class="tw-text-sm tw-text-foreground tw-whitespace-pre-wrap">{{ selectedMessage.content }}</p>
          </div>
        </div>

        <div v-if="selectedMessage.attachments && selectedMessage.attachments.length > 0">
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Attachments</label>
          <div class="tw-mt-1 tw-space-y-2">
            <div v-for="attachment in selectedMessage.attachments" :key="attachment.id"
              class="tw-flex tw-items-center tw-p-2 tw-bg-muted tw-rounded">
              <span class="tw-text-sm tw-text-foreground">{{ attachment.filename }}</span>
              <span class="tw-ml-auto tw-text-xs tw-text-muted-foreground">{{ attachment.fileSize }}</span>
            </div>
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Created</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDate(selectedMessage.createdAt) }}</p>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Last Updated</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDate(selectedMessage.updatedAt) }}</p>
          </div>
        </div>

        <div v-if="selectedMessage.isEdited" class="tw-p-3 tw-bg-warning/10 tw-rounded-md">
          <p class="tw-text-sm tw-text-warning">This message has been edited.</p>
        </div>
      </div>
    </Modal> 
    
    <!-- Channel Details Modal -->
    <Modal :show="showChannelModal" @close="showChannelModal = false" title="Channel Details">
      <div v-if="selectedChannel" class="tw-space-y-4">
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Channel ID</label>
          <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedChannel.channelId }}</p>
        </div>
        <div>
          <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Participants</label>
          <div class="tw-mt-1 tw-space-y-2">
            <div v-if="selectedChannel.participantDetails && selectedChannel.participantDetails.length > 0">
              <div v-for="participant in selectedChannel.participantDetails" :key="participant.userId"
                class="tw-flex tw-items-center tw-space-x-3 tw-p-2 tw-bg-muted tw-rounded">
                <div class="tw-w-8 tw-h-8 tw-bg-primary/10 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <span class="tw-text-sm tw-font-medium tw-text-primary">
                    {{ participant.profile?.firstName?.charAt(0) || participant.username.charAt(0) }}
                  </span>
                </div>
                <div>
                  <div class="tw-text-sm tw-font-medium tw-text-foreground">
                    {{ participant.profile?.firstName && participant.profile?.lastName
                      ? `${participant.profile.firstName} ${participant.profile.lastName}`
                      : participant.username }}
                  </div>
                  <div class="tw-text-xs tw-text-muted-foreground">{{ participant.userId }}</div>
                </div>
              </div>
            </div>
            <div v-else class="tw-text-sm tw-text-muted-foreground">
              {{ selectedChannel.memberCount || selectedChannel.participants?.length || 0 }} participants
            </div>
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Messages</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedChannel.messageCount || 0 }}</p>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Participants</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedChannel.participants?.length || 0 }}</p>
          </div>
        </div>
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Created</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ formatDate(selectedChannel.createdAt) }}</p>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-medium tw-text-muted-foreground">Status</label>
            <p class="tw-mt-1 tw-text-sm tw-text-foreground">{{ selectedChannel.isActive ? 'Active' : 'Inactive' }}</p>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
