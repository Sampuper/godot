import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  constructor(private readonly configService: ConfigService) {}

  private get apiUrl() {
    const token = this.configService.get<string>('telegram.token');
    return `https://api.telegram.org/bot${token}/sendMessage`;
  }

  async sendClientMessage(chatId: string, text: string) {
    return axios.post(this.apiUrl, { chat_id: chatId, text });
  }

  async sendChannelPost(channelId: string, text: string) {
    return axios.post(this.apiUrl, { chat_id: channelId, text });
  }

  async notify(text: string) {
    const chatId = this.configService.get<string>('telegram.defaultChatId');
    if (!chatId) {
      return;
    }

    await this.sendChannelPost(chatId, text);
  }
}
