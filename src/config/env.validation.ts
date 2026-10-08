import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'preprod', 'prod')
    .default('development'),
  PORT: Joi.number().default(3000),
  APP_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  GLOBAL_PREFIX: Joi.string().default('api'),
  VERSION_API: Joi.string().default('1'),
  VERSION_PREFIX: Joi.string().default('v'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),
  MAIL_TRANSPORT: Joi.string().valid('file', 'smtp').default('file'),
  MAIL_DIRECTORY: Joi.string().default('var/mail'),
  MAIL_FROM: Joi.string().default(
    'Social Chat App <noreply@socialchat.example.com>',
  ),
  SMTP_URL: Joi.string().when('MAIL_TRANSPORT', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
