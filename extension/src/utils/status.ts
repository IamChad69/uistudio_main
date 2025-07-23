import * as authActions from "../actions/auth";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  hasProAccess?: boolean;
  subscription?: {
    plan: {
      name: string;
      extractionLimit: number;
    };
  };
}

interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
  isPro: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Check authentication status and pro user status
 * @returns Promise<AuthStatus>
 */
export const checkAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await authActions.getCurrentUser();

    if (response.status === 200 && response.user) {
      const user = response.user;
      const isPro =
        user.hasProAccess ||
        user.subscription?.plan?.name === "pro" ||
        user.subscription?.plan?.name === "premium" ||
        user.plan === "pro" ||
        user.plan === "premium";

      return {
        isAuthenticated: true,
        user,
        isPro,
        loading: false,
        error: null,
      };
    } else {
      return {
        isAuthenticated: false,
        user: null,
        isPro: false,
        loading: false,
        error: response.error || "Authentication failed",
      };
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      isPro: false,
      loading: false,
      error: "Failed to check authentication",
    };
  }
};

/**
 * Quick check if user is authenticated (without full user data)
 * @returns Promise<boolean>
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return await authActions.isAuthenticated();
};

/**
 * Check if user has pro access
 * @param user - User object to check
 * @returns boolean
 */
export const isProUser = (user: User | null): boolean => {
  if (!user) return false;

  return (
    user.hasProAccess ||
    user.subscription?.plan?.name === "pro" ||
    user.subscription?.plan?.name === "premium" ||
    user.plan === "pro" ||
    user.plan === "premium"
  );
};
