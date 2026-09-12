import { getGoogleAccessToken } from './firebase';

export interface ChatSpace {
  name: string;
  displayName: string;
  spaceType: string;
}

export interface ChatMessage {
  name: string;
  sender: {
    displayName: string;
    type: string;
  };
  text: string;
  createTime: string;
}

export async function listSpaces(): Promise<ChatSpace[]> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Google Chat: No access token available');

  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Chat Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.spaces || [];
}

export async function listMessages(spaceName: string): Promise<ChatMessage[]> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Google Chat: No access token available');

  const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Chat Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.messages || [];
}

export async function sendMessage(spaceName: string, text: string): Promise<ChatMessage> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Google Chat: No access token available');

  const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Chat Error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}
