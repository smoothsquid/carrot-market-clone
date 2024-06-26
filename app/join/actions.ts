"use server";

import {
  EMAIL_ERROR,
  EMAIL_REQUIRED_ERROR,
  EMAIL_TYPE_ERROR,
  EMAIL_UNIQUE_ERROR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_NOT_MATCH_ERROR,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
  PASSWORD_REQUIRED_ERROR,
  PASSWORD_TYPE_ERROR,
  USERNAME_CHECK_ERROR,
  USERNAME_LENGTH_ERROR,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REQUIRED_ERROR,
  USERNAME_TYPE_ERROR,
  USERNAME_UNIQUE_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";
import { z } from "zod";

const checkUsernameValidated = (username: string) => {
  return !username.includes(" ");
};

const checkUsernameUnique = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  return !user;
};

const checkEmailUnique = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return !user;
};

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => {
  return password === confirm_password;
};

const createAccountSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: USERNAME_TYPE_ERROR,
        required_error: USERNAME_REQUIRED_ERROR,
      })
      .toLowerCase()
      .trim()
      .min(USERNAME_MIN_LENGTH, USERNAME_LENGTH_ERROR)
      .max(USERNAME_MAX_LENGTH, USERNAME_LENGTH_ERROR)
      .refine(checkUsernameValidated, USERNAME_CHECK_ERROR)
      .refine(checkUsernameUnique, USERNAME_UNIQUE_ERROR),
    email: z
      .string({
        invalid_type_error: EMAIL_TYPE_ERROR,
        required_error: EMAIL_REQUIRED_ERROR,
      })
      .email(EMAIL_ERROR)
      .refine(checkEmailUnique, EMAIL_UNIQUE_ERROR),
    password: z
      .string({
        invalid_type_error: PASSWORD_TYPE_ERROR,
        required_error: PASSWORD_REQUIRED_ERROR,
      })
      .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z
      .string({
        invalid_type_error: PASSWORD_TYPE_ERROR,
        required_error: PASSWORD_REQUIRED_ERROR,
      })
      .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR),
  })
  .refine(checkPasswords, {
    message: PASSWORD_NOT_MATCH_ERROR,
    path: ["confirm_password"],
  });

export const createAccountAction = async (_: any, formData: FormData) => {
  const formDataObject = Object.fromEntries(formData.entries());

  const parsedData = await createAccountSchema.safeParseAsync(formDataObject);

  if (!parsedData.success) {
    return parsedData.error.flatten();
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 12);

  const user = await db.user.create({
    data: {
      username: parsedData.data.username,
      email: parsedData.data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
    },
  });

  const ironSession = await getSession();

  ironSession.userId = user.id;
  ironSession.save();
};
