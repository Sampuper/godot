export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID ?? '',
  },
});
