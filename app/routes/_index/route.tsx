import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Embedded / OAuth entry: always go into the authenticated app shell.
  if (
    url.searchParams.has("shop") ||
    url.searchParams.has("host") ||
    url.searchParams.has("embedded") ||
    url.searchParams.has("id_token")
  ) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

/**
 * Shown only for bare visits to the app URL outside Shopify Admin.
 * Merchants opening the app from Admin never see this page.
 */
export default function Index() {
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Products Options Extras</h1>
        <p className={styles.text}>
          Open this app from your Shopify admin: Apps → Products Options Extras.
        </p>
      </div>
    </div>
  );
}
