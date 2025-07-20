import { useState, useEffect } from "react";
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

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  subscriptionPlan?: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    subscriptionPlan: undefined,
  });

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes from ContentScript
    const handleAuthStateChange = (event: CustomEvent) => {
      const { isAuthenticated: newAuthState, token } = event.detail;

      if (newAuthState && token) {
        // User is authenticated
        setState({
          isAuthenticated: true,
          user: null, // Will be populated by checkAuth
          loading: false,
          error: null,
          subscriptionPlan: undefined,
        });
        // Re-check auth to get user details
        checkAuth();
      } else {
        // User is not authenticated
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
          subscriptionPlan: undefined,
        });
      }
    };

    // Add event listener
    document.addEventListener(
      "authStateChanged",
      handleAuthStateChange as EventListener
    );

    return () => {
      document.removeEventListener(
        "authStateChanged",
        handleAuthStateChange as EventListener
      );
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authActions.getCurrentUser();
      if (response.status === 200 && response.user) {
        setState({
          isAuthenticated: true,
          user: response.user,
          loading: false,
          error: null,
          subscriptionPlan: response.user.subscription?.plan?.name || "free",
        });
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.error || "Authentication failed",
          subscriptionPlan: undefined,
        });
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Failed to check authentication",
        subscriptionPlan: undefined,
      });
    }
  };

  const handleWebAppAuth = async (token: string) => {
    try {
      const response = await authActions.handleWebAppAuth(token);
      if (response.status === 200 && response.user) {
        setState({
          isAuthenticated: true,
          user: response.user,
          loading: false,
          error: null,
          subscriptionPlan: response.user.subscription?.plan?.name || "free",
        });
        return true;
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.error || "Authentication failed",
          subscriptionPlan: undefined,
        });
        return false;
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Failed to handle web app authentication",
        subscriptionPlan: undefined,
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authActions.removeAuthToken();
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        subscriptionPlan: undefined,
      });
    } catch (error) {
      setState({
        ...state,
        error: "Failed to logout",
      });
    }
  };

  return {
    ...state,
    checkAuth,
    handleWebAppAuth,
    logout,
  };
};
