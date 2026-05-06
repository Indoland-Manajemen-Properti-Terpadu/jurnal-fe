import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiClient";
import { API_USERS } from "@/services/endpoint";
import { User } from "../../Authentication/Login/types/LoginModelResponse";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const result = await get(API_USERS.GET_USER_DETAIL);
      return result as User;
    },
  });
};

