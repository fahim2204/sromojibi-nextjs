import { NextResponse } from "next/server";

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
};

export const apiSuccess = <T>(
  data: T,
  init?: ResponseInit & { meta?: Record<string, unknown> }
) => {
  const body: ApiResponse<T> = {
    data,
    error: null,
    ...(init?.meta ? { meta: init.meta } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
};

export const apiError = (
  code: string,
  message: string,
  init?: ResponseInit
) => {
  const body: ApiResponse<null> = {
    data: null,
    error: {
      code,
      message,
    },
  };

  return NextResponse.json(body, {
    status: init?.status ?? 500,
    headers: init?.headers,
  });
};
