export const CHAT_EVENTS = {
  PING: 'ping',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_ROOM_MESSAGE: 'send_room_message',
  GET_HISTORY: 'get_history',
  SUBSCRIBE_NOTIFICATIONS: 'subscribe_notifications',

  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  NEW_ROOM_MESSAGE: 'new_room_message',
  NEW_NOTIFICATION: 'new_notification',
} as const;

export const CHAT_ROOM = {
  CONVERSATION_PREFIX: 'conversation:',
  USER_PREFIX: 'user:',
} as const;
