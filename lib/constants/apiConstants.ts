export const API_ENDPOINTS = {
  TODO: '/api/todos',
  USER: '/api/users',
  AUTH: '/api/auth',
  CHAT: '/api/chats',
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;
