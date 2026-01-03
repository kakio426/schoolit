
export const ChatEvents = {
    // Server to Client
    NEW_MESSAGE: 'newMessage',
    ERROR: 'chatError',
    NOTIFICATION: 'newNotification',

    // Client to Server
    SEND_MESSAGE: 'sendMessage',
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
} as const;
