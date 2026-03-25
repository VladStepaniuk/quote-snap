import { useEffect, useMemo, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  getQuoteDashboardData,
  handleQuoteDashboardAction,
} from "../models/quotes.server";
import styles from "../styles/quotesnap.module.css";
import { defaultPreviewInput } from "../utils/quote-preview";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const data = await getQuoteDashboardData({ shop: session.shop, admin });
  return Response.json(data);
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const result = await handleQuoteDashboardAction({ shop: session.shop, formData });
  return Response.json(result);
};

export default function Index() {
  const { shop, rules, requests, products, supportEmail } = useLoaderData();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const [previewInput, setPreviewInput] = useState(defaultPreviewInput);
  const [selectedProductId, setSelectedProductId] = useState(defaultPreviewInput.productId);
  const [statusMessage, setStatusMessage] = useState("QuoteSnap is ready.");

  useEffect(() => {
    if (fetcher.data?.message) {
      setStatusMessage(fetcher.data.message);
      revalidate();
    }

    if (fetcher.data?.error) {
      setStatusMessage(fetcher.data.error);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (products.length > 0) {
      const fallbackProductId = products[0].id;
      setSelectedProductId((current) => current || fallbackProductId);
      setPreviewInput((current) => ({
        ...current,
        productId: current.productId === defaultPreviewInput.productId ? fallbackProductId : current.productId,
      }));
    }
  }, [products]);

  const matchedRuleName = useMemo(() => {
    if (!fetcher.data?.preview?.matchingRuleId) {
      return "No rule matched";
    }

    return (
      rules.find((rule) => rule.id === fetcher.data.preview.matchingRuleId)?.name ||
      "Matched rule"
    );
  }, [fetcher.data?.preview?.matchingRuleId, rules]);

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.title,
    collections: product.collections.nodes,
  }));

  const saveRule = (event, rule) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("intent", "save-rule");
    formData.set("id", rule.id);
    fetcher.submit(formData, { method: "POST" });
  };

  const deleteRule = (ruleId) => {
    const formData = new FormData();
    formData.set("intent", "delete-rule");
    formData.set("id", ruleId);
    fetcher.submit(formData, { method: "POST" });
  };

  const runPreview = () => {
    const formData = new FormData();
    formData.set("intent", "preview");
    formData.set("productId", previewInput.productId);
    formData.set("collectionIds", previewInput.collectionIds);
    formData.set("tags", previewInput.tags);
    if (previewInput.loggedIn) {
      formData.set("loggedIn", "on");
    }
    fetcher.submit(formData, { method: "POST" });
  };

  const seedRequest = () => {
    const formData = new FormData();
    formData.set("intent", "seed-request");
    formData.set("productId", previewInput.productId);
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-page heading="QuoteSnap" inlineSize="base">
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Quote request control</p>
            <h1 className={styles.heroTitle}>Hide pricing, gate access, and test storefront rules before merchants touch their theme.</h1>
            <p className={styles.heroCopy}>
              QuoteSnap is connected to <strong>{shop}</strong>. Configure B2B visibility rules, simulate customer states,
              and review captured quote intent in one place.
            </p>
          </div>
          <div className={styles.heroActions}>
            <div className={styles.statusPill}>{statusMessage}</div>
            <button className={styles.primaryButton} type="button" onClick={seedRequest}>
              Seed sample quote request
            </button>
          </div>
        </section>

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Products loaded</span>
            <strong className={styles.statValue}>{products.length}</strong>
            <p className={styles.statHint}>Live product snapshot from the connected Shopify store.</p>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Saved rules</span>
            <strong className={styles.statValue}>{rules.length}</strong>
            <p className={styles.statHint}>Shop-scoped QuoteSnap rules stored in Prisma.</p>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Quote requests</span>
            <strong className={styles.statValue}>{requests.length}</strong>
            <p className={styles.statHint}>Lead capture records available for review.</p>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Support</span>
            <strong className={styles.statValueSmall}>{supportEmail}</strong>
            <p className={styles.statHint}>Current merchant-facing support contact.</p>
          </article>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionLabel}>Rules</p>
                <h2 className={styles.sectionTitle}>Quote visibility rules</h2>
              </div>
              <p className={styles.sectionCopy}>
                Define when pricing disappears, when Add to Cart is replaced, and which audience should see a quote CTA.
              </p>
            </div>

            {rules.length === 0 ? <div className={styles.emptyBanner}>No rules yet. Add one below to start testing QuoteSnap.</div> : null}

            <div className={styles.ruleStack}>
              {rules.map((rule) => (
                <form key={rule.id} className={styles.ruleCard} onSubmit={(event) => saveRule(event, rule)}>
                  <input type="hidden" name="id" value={rule.id} />
                  <div className={styles.formGridTwo}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Rule name</span>
                      <input className={styles.input} name="name" defaultValue={rule.name} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Quote button label</span>
                      <input className={styles.input} name="quoteButtonLabel" defaultValue={rule.quoteButtonLabel} />
                    </label>
                  </div>

                  <div className={styles.formGridThree}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Scope</span>
                      <select className={styles.input} name="scope" defaultValue={rule.scope}>
                        <option value="all_products">All products</option>
                        <option value="product">Specific product</option>
                        <option value="collection">Collection</option>
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Scope value</span>
                      <input className={styles.input} name="scopeValue" defaultValue={rule.scopeValue} placeholder="gid://shopify/Product/..." />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Audience</span>
                      <select className={styles.input} name="visibility" defaultValue={rule.visibility}>
                        <option value="all_visitors">All visitors</option>
                        <option value="guests_only">Guests only</option>
                        <option value="tagged_customers">Tagged customers</option>
                      </select>
                    </label>
                  </div>

                  <div className={styles.optionRow}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Customer tag</span>
                      <input className={styles.input} name="customerTag" defaultValue={rule.customerTag} placeholder="wholesale" />
                    </label>
                    <label className={styles.checkboxField}>
                      <input type="checkbox" name="hidePrice" defaultChecked={rule.hidePrice} />
                      <span>Hide price</span>
                    </label>
                    <label className={styles.checkboxField}>
                      <input type="checkbox" name="replaceAddToCart" defaultChecked={rule.replaceAddToCart} />
                      <span>Replace Add to Cart</span>
                    </label>
                    <label className={styles.checkboxField}>
                      <input type="checkbox" name="enabled" defaultChecked={rule.enabled} />
                      <span>Enabled</span>
                    </label>
                  </div>

                  <div className={styles.actionsRow}>
                    <button className={styles.secondaryButton} type="submit">Save rule</button>
                    <button className={styles.ghostDangerButton} type="button" onClick={() => deleteRule(rule.id)}>Delete</button>
                  </div>
                </form>
              ))}

              <form className={styles.newRuleCard} onSubmit={(event) => saveRule(event, { id: "" })}>
                <div className={styles.newRuleHeader}>
                  <div>
                    <p className={styles.sectionLabel}>New rule</p>
                    <h3 className={styles.subsectionTitle}>Add rule</h3>
                  </div>
                  <span className={styles.helperText}>Start with guest-only quote gating, then expand to tags and collections.</span>
                </div>

                <div className={styles.formGridTwo}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Rule name</span>
                    <input className={styles.input} name="name" placeholder="Guests request quote" />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Quote button label</span>
                    <input className={styles.input} name="quoteButtonLabel" defaultValue="Request a Quote" />
                  </label>
                </div>

                <div className={styles.formGridThree}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Scope</span>
                    <select className={styles.input} name="scope" defaultValue="all_products">
                      <option value="all_products">All products</option>
                      <option value="product">Specific product</option>
                      <option value="collection">Collection</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Scope value</span>
                    <input className={styles.input} name="scopeValue" placeholder="gid://shopify/Collection/..." />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Audience</span>
                    <select className={styles.input} name="visibility" defaultValue="guests_only">
                      <option value="all_visitors">All visitors</option>
                      <option value="guests_only">Guests only</option>
                      <option value="tagged_customers">Tagged customers</option>
                    </select>
                  </label>
                </div>

                <div className={styles.optionRow}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Customer tag</span>
                    <input className={styles.input} name="customerTag" placeholder="wholesale" />
                  </label>
                  <label className={styles.checkboxField}>
                    <input type="checkbox" name="hidePrice" defaultChecked />
                    <span>Hide price</span>
                  </label>
                  <label className={styles.checkboxField}>
                    <input type="checkbox" name="replaceAddToCart" defaultChecked />
                    <span>Replace Add to Cart</span>
                  </label>
                  <label className={styles.checkboxField}>
                    <input type="checkbox" name="enabled" defaultChecked />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className={styles.actionsRow}>
                  <button className={styles.primaryButton} type="submit">Create rule</button>
                </div>
              </form>
            </div>
          </section>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Preview</p>
                  <h2 className={styles.sectionTitle}>Storefront simulator</h2>
                </div>
                <p className={styles.sectionCopy}>Choose a live product, set the buyer state, and preview how QuoteSnap will behave.</p>
              </div>

              <div className={styles.previewControls}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Product</span>
                  <select
                    className={styles.input}
                    value={selectedProductId}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      const nextProduct = productOptions.find((product) => product.value === nextValue);
                      setSelectedProductId(nextValue);
                      setPreviewInput((current) => ({
                        ...current,
                        productId: nextValue,
                        collectionIds: (nextProduct?.collections || []).map((collection) => collection.id).join(", "),
                      }));
                    }}
                  >
                    {productOptions.length === 0 ? <option value="">No products found</option> : null}
                    {productOptions.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Collection IDs</span>
                  <input
                    className={styles.input}
                    value={previewInput.collectionIds}
                    onChange={(event) => setPreviewInput((current) => ({ ...current, collectionIds: event.target.value }))}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Customer tags</span>
                  <input
                    className={styles.input}
                    value={previewInput.tags}
                    onChange={(event) => setPreviewInput((current) => ({ ...current, tags: event.target.value }))}
                  />
                </label>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    checked={previewInput.loggedIn}
                    onChange={(event) => setPreviewInput((current) => ({ ...current, loggedIn: event.target.checked }))}
                  />
                  <span>Shopper is logged in</span>
                </label>

                <button className={styles.primaryButton} type="button" onClick={runPreview}>Run preview</button>
              </div>

              <div className={styles.previewResult}>
                <p className={styles.previewTitle}>{fetcher.data?.preview?.message || "Run a preview to see storefront behavior."}</p>
                <div className={styles.previewGrid}>
                  <div>
                    <span className={styles.previewLabel}>Matched rule</span>
                    <strong className={styles.previewValue}>{matchedRuleName}</strong>
                  </div>
                  <div>
                    <span className={styles.previewLabel}>Price visible</span>
                    <strong className={styles.previewValue}>{fetcher.data?.preview ? (fetcher.data.preview.priceVisible ? "Yes" : "No") : "-"}</strong>
                  </div>
                  <div>
                    <span className={styles.previewLabel}>Add to Cart</span>
                    <strong className={styles.previewValue}>{fetcher.data?.preview ? (fetcher.data.preview.addToCartVisible ? "Yes" : "No") : "-"}</strong>
                  </div>
                  <div>
                    <span className={styles.previewLabel}>Quote CTA</span>
                    <strong className={styles.previewValue}>{fetcher.data?.preview?.quoteButtonLabel || "No quote button"}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Leads</p>
                  <h2 className={styles.sectionTitle}>Recent quote requests</h2>
                </div>
              </div>

              {requests.length === 0 ? (
                <div className={styles.emptyState}>No quote requests stored yet.</div>
              ) : (
                <div className={styles.requestList}>
                  {requests.map((request) => (
                    <article key={request.id} className={styles.requestCard}>
                      <div className={styles.requestHeader}>
                        <strong>{request.customerName}</strong>
                        <span>{request.company || "No company"}</span>
                      </div>
                      <div className={styles.requestMeta}>{request.customerEmail}</div>
                      <div className={styles.requestMeta}>{request.productId}</div>
                      <p className={styles.requestMessage}>{request.message || "No message provided"}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
