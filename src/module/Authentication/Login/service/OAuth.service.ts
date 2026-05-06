import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { post } from "@/services/apiClient";
import { API_AUTH } from "@/services/endpoint";
import { routes } from "@/router";
import { useAuthStore } from "@/store/useAuthentications";
import { LoginModelResponse } from "../types/LoginModelResponse";

export const useOAuthExchange = () => {
  const navigate = useNavigate();
  const { setTokens, setUserName } = useAuthStore();

  return useMutation({
    mutationFn: async (code: string) => {
      const result = await post(API_AUTH.POST_OAUTH_EXCHANGE, { code });
      return result as LoginModelResponse;
    },
    onSuccess: (data) => {
      const { tokens, user } = data;
      localStorage.setItem("accessToken", tokens.access.token);
      localStorage.setItem("refreshToken", tokens.refresh.token);
      localStorage.setItem("userName", user.name);
      setTokens(tokens.access.token, tokens.refresh.token);
      setUserName(user.name);
      notifications.show({
        color: "cyan",
        autoClose: 3000,
        title: "Login Successful!",
        message: "Welcome to Journal Proapps. Let’s get started!",
      });
      navigate(routes.dashboard);
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        autoClose: 3000,
        title: "Authentication Failed",
        message: "Unable to authenticate with Jurnal. Please try again.",
      });
      navigate(routes.login);
    },
  });
};
