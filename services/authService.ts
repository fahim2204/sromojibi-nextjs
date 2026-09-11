import type {
  RegisterUserInput,
  ResetPasswordInput,
  SignInInput,
  VerifyEmailOtpInput,
} from "@/modules/auth/auth.validator";

export interface AuthUser {
  id: number;
  fullName: string | null;
  username: string;
  email: string;
  emailVerified: boolean;
  role?: "USER" | "WORKER" | "ADMIN";
  image?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta?: {
    message?: string;
    expiresAt?: string;
  };
}

export interface RegisterUserResponse {
  data: {
    user: AuthUser;
    verification: {
      expiresAt: string;
    };
  };
  error: null;
  meta?: {
    message?: string;
  };
}

export interface SignInResponse {
  data: {
    user: AuthUser;
    token: string;
  };
  error: null;
  meta?: {
    message?: string;
  };
}

export const registerUser = async (payload: RegisterUserInput): Promise<RegisterUserResponse> => {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to register user");
  }

  return data;
};

export const signInUser = async (payload: SignInInput): Promise<SignInResponse> => {
  const response = await fetch("/api/v1/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message ?? "Unable to sign in");
    (error as any).code = data.error?.code;
    throw error;
  }

  return data;
};

export const verifyEmailOtp = async (payload: VerifyEmailOtpInput): Promise<SignInResponse> => {
  const response = await fetch("/api/v1/auth/verify-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to verify email");
  }

  return data;
};

export const resendVerificationOtp = async (email: string) => {
  const response = await fetch("/api/v1/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to resend verification code");
  }

  return data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch("/api/v1/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to request password reset");
  }

  return data;
};

export const verifyResetOtp = async (payload: VerifyEmailOtpInput) => {
  const response = await fetch("/api/v1/auth/verify-reset-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to verify reset code");
  }

  return data;
};

export const resetPassword = async (payload: ResetPasswordInput): Promise<SignInResponse> => {
  const response = await fetch("/api/v1/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to reset password");
  }

  return data;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("@sromojibi_token") : null;
  if (!token) return null;

  try {
    const response = await fetch("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("@sromojibi_token");
        }
      }
      return null;
    }

    const data = await response.json();
    return data.data?.user ?? null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("@sromojibi_token") : null;

  try {
    if (token) {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("@sromojibi_token");
    }
  }
};
