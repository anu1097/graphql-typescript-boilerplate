import { PASSWORD_NOT_LONG_ENOUGH, INVALID_EMAIL } from './commonErrors';
import * as yup from 'yup';

export const registerEmailSchema = yup
  .string()
  .min(3)
  .max(255)
  .email(INVALID_EMAIL);

export const registerPasswordSchema = yup
  .string()
  .min(3, PASSWORD_NOT_LONG_ENOUGH)
  .max(255);