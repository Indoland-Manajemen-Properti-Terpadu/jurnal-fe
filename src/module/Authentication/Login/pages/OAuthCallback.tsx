import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { useOAuthExchange } from "../service/OAuth.service";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { mutate: exchangeCode, isPending } = useOAuthExchange();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    if (code && !exchangeAttempted.current) {
      exchangeAttempted.current = true;
      exchangeCode(code);
    }
  }, [code, exchangeCode]);

  return (
    <Center h="100vh" bg="gray.0">
      <Stack align="center" gap="md">
        <Loader size="xl" variant="dots" />
        <Text size="lg" fw={500} c="dimmed">
          {!code ? "Invalid OAuth Code" : "Authenticating, please wait..."}
        </Text>
      </Stack>
    </Center>
  );
}
