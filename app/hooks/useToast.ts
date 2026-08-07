import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";

/**
 * Shows an App Bridge toast when `message` changes to a non-empty value.
 */
export function useToast(message?: string | null) {
  const shopify = useAppBridge();

  useEffect(() => {
    if (message) {
      shopify.toast.show(message);
    }
  }, [message, shopify]);
}
