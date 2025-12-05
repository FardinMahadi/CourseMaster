import type { AxiosResponse } from 'axios';

import { api } from './axios';

export interface SendEmailInput {
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export interface SendEmailResponse {
  message: string;
  data: {
    to: string;
    subject: string;
  };
}

/**
 * Send email to the currently logged-in user
 */
export async function sendEmailToUser(data: SendEmailInput): Promise<SendEmailResponse> {
  const response: AxiosResponse<SendEmailResponse> = await api.post('/email/send', data);
  return response.data;
}
