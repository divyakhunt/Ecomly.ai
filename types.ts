export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
}