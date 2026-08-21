import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

type Props = {
  imageUrl: string | null;
  onChange: (imageUrl: string | null) => void;
};

type FilePickerResponse = {
  code: string;
  message?: string;
  data?: { ids?: string[] };
};

/**
 * Opens Shopify's native Files picker so merchants can select or upload an
 * image for an image-swatch choice (replaces a plain Image URL text field).
 */
export function ChoiceImageField({ imageUrl, onChange }: Props) {
  const shopify = useAppBridge();
  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    setBusy(true);
    try {
      const intents = (
        shopify as typeof shopify & {
          intents?: {
            invoke: (
              name: string,
              options?: { data?: Record<string, unknown> },
            ) => Promise<{ complete: Promise<FilePickerResponse> }>;
          };
        }
      ).intents;

      if (!intents?.invoke) {
        shopify.toast.show("Image picker is unavailable in this admin session", {
          isError: true,
        });
        return;
      }

      const activity = await intents.invoke("pick:shopify/File", {
        data: { mediaTypes: ["MediaImage"], multiSelect: false },
      });
      const response = await activity.complete;

      if (response.code === "closed") return;
      if (response.code !== "ok") {
        shopify.toast.show(response.message || "Could not select image", {
          isError: true,
        });
        return;
      }

      const ids = response.data?.ids ?? [];
      if (!ids.length) return;

      const headers: HeadersInit = { Accept: "application/json" };
      if (typeof shopify.idToken === "function") {
        headers.Authorization = `Bearer ${await shopify.idToken()}`;
      }

      const result = await fetch(
        `/app/api/files?ids=${encodeURIComponent(ids.join(","))}`,
        { headers },
      );
      if (!result.ok) {
        shopify.toast.show("Could not load the selected image", { isError: true });
        return;
      }

      const payload = (await result.json()) as {
        files?: Array<{ url: string }>;
      };
      const url = payload.files?.[0]?.url;
      if (!url) {
        shopify.toast.show("Selected file has no image URL", { isError: true });
        return;
      }

      onChange(url);
    } catch (error) {
      console.error("Image picker failed:", error);
      shopify.toast.show("Could not open the image picker", { isError: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <s-stack direction="block" gap="small-200">
      <s-text type="strong">Image</s-text>
      <s-stack direction="inline" gap="small-200" alignItems="center">
        {imageUrl ? (
          <s-thumbnail src={imageUrl} alt="Swatch image" size="large" />
        ) : (
          <s-box
            padding="base"
            background="subdued"
            borderRadius="base"
            borderWidth="base"
          >
            <s-text color="subdued">No image</s-text>
          </s-box>
        )}
        <s-stack direction="block" gap="small-500">
          <s-button
            type="button"
            variant="secondary"
            onClick={pickImage}
            {...(busy ? { loading: true } : {})}
          >
            {imageUrl ? "Change image" : "Select or upload image"}
          </s-button>
          {imageUrl ? (
            <s-button
              type="button"
              variant="tertiary"
              tone="critical"
              onClick={() => onChange(null)}
            >
              Remove
            </s-button>
          ) : null}
        </s-stack>
      </s-stack>
      <s-text color="subdued">
        Opens your Shopify Files library — you can pick an existing image or upload a new one.
      </s-text>
    </s-stack>
  );
}
