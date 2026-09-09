import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'preprod', 'prod')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  GLOBAL_PREFIX: Joi.string().default('api'),
  VERSION_API: Joi.string().default('1'),
  VERSION_PREFIX: Joi.string().default('v'),
});
