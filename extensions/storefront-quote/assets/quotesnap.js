/**
 * QuoteSnap storefront script
 * - Fetches rules from the app proxy endpoint
 * - Hides price elements when a rule matches
 * - Replaces "Add to Cart" with a "Request a Quote" CTA
 * - Handles the quote request form submission
 */

(function () {
  "use strict";

  // ─── Selectors ────────────────────────────────────────────────────────────

  /** Selectors that cover the most common Shopify themes for price elements. */
  const PRICE_SELECTORS = [
    ".price",
    ".product__price",
    ".product-single__price",
    ".price-item",
    "[data-product-price]",
    ".price__regular",
    ".price__sale",
    ".price-group",
  ].join(", ");

  /** Selectors that cover the most common Shopify themes for Add to Cart. */
  const ADD_TO_CART_SELECTORS = [
    "[data-add-to-cart]",
    "[name='add']",
    ".product-form__submit",
    ".btn--add-to-cart",
    ".add-to-cart",
    ".product__submit__add",
  ].join(", ");

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  const root = document.getElementById("quotesnap-block");
  if (!root) return;

  const productId = JSON.parse(root.dataset.productId || "null");
  const collectionIds = JSON.parse(root.dataset.collectionIds || "[]");
  const shop = root.dataset.shop || "";
  const apiUrl = root.dataset.apiUrl || "";
  // Customer context from Liquid (accurate, no API needed)
  const customerLoggedIn = root.dataset.customerLoggedIn === "true";
  const customerTags = (root.dataset.customerTags || "")
    .split(",").map(t => t.trim()).filter(Boolean);

  if (!productId || !apiUrl) return;

  // ─── Rule evaluation ──────────────────────────────────────────────────────

  /** @param {import("./types").QuoteRule} rule */
  function matchesScope(rule) {
    if (rule.scope === "all_products") return true;
    if (rule.scope === "product") return String(rule.scopeValue).trim() === String(productId);
    if (rule.scope === "collection") return collectionIds.map(String).includes(String(rule.scopeValue).trim());
    return false;
  }

  /** @param {import("./types").QuoteRule} rule */
  function matchesVisibility(rule) {
    // Use Liquid-rendered values — accurate, no API required, no Protected Data approval needed
    if (rule.visibility === "all_visitors") return true;
    if (rule.visibility === "guests_only") return !customerLoggedIn;
    if (rule.visibility === "tagged_customers") {
      const tag = (rule.customerTag || "").trim().toLowerCase();
      return tag ? customerTags.includes(tag) : false;
    }
    return false;
  }

  function scopePriority(rule) {
    if (rule.scope === "product") return 3;
    if (rule.scope === "collection") return 2;
    return 1;
  }

  /**
   * @param {import("./types").QuoteRule[]} rules
   * @returns {import("./types").QuoteRule | null}
   */
  function findMatchingRule(rules) {
    return (
      [...rules]
        .filter((r) => r.enabled)
        .sort((a, b) => scopePriority(b) - scopePriority(a))
        .find((r) => matchesScope(r) && matchesVisibility(r)) || null
    );
  }

  // ─── DOM manipulation ─────────────────────────────────────────────────────

  function hidePrices() {
    document.querySelectorAll(PRICE_SELECTORS).forEach((el) => {
      el.style.visibility = "hidden";
      el.setAttribute("aria-hidden", "true");
      el.dataset.quotesnapHidden = "1";
    });
  }

  /** @param {string} label */
  function injectQuoteButton(label, customization = {}, replaceAddToCart = true) {
    document.querySelectorAll(ADD_TO_CART_SELECTORS).forEach((btn) => {
      if (btn.dataset.quotesnapReplaced) return;

      if (replaceAddToCart) {
        btn.style.display = "none";
        btn.setAttribute("aria-hidden", "true");
      }
      btn.dataset.quotesnapReplaced = "1";

      const cta = document.createElement("button");
      cta.type = "button";
      cta.className = "quotesnap-cta";
      cta.setAttribute("data-quotesnap-cta", "1");
      cta.textContent = label;
      cta.addEventListener("click", openModal);

      btn.insertAdjacentElement("afterend", cta);
    });
  }

  function applyCustomizationVars(customization = {}) {
    const root = document.documentElement;
    const { buttonBgColor, buttonTextColor, buttonBorderRadius,
            submitBgColor, submitTextColor,
            modalBgColor, modalTextColor, inputBgColor, inputTextColor,
            fontFamily, fontSize, buttonFontSize, formFontSize } = customization;

    if (buttonBgColor) root.style.setProperty("--qs-btn-bg", buttonBgColor);
    if (buttonTextColor) root.style.setProperty("--qs-btn-color", buttonTextColor);
    if (buttonBorderRadius !== undefined) root.style.setProperty("--qs-btn-radius", buttonBorderRadius + "px");
    root.style.setProperty("--qs-submit-bg", submitBgColor || buttonBgColor || "#008060");
    root.style.setProperty("--qs-submit-color", submitTextColor || buttonTextColor || "#ffffff");
    if (modalBgColor) root.style.setProperty("--qs-modal-bg", modalBgColor);
    if (modalTextColor) {
      root.style.setProperty("--qs-modal-color", modalTextColor);
      root.style.setProperty("--qs-label-color", modalTextColor);
    }
    if (inputBgColor) root.style.setProperty("--qs-input-bg", inputBgColor);
    if (inputTextColor) root.style.setProperty("--qs-input-color", inputTextColor);
    if (fontFamily && fontFamily !== "inherit") root.style.setProperty("--qs-font-family", fontFamily);
    // Separate font sizes for button vs form; fall back to legacy `fontSize` if specific ones not set
    const resolvedBtnSize = buttonFontSize || fontSize;
    const resolvedFormSize = formFontSize || fontSize;
    if (resolvedBtnSize) root.style.setProperty("--qs-btn-font-size", resolvedBtnSize + "px");
    if (resolvedFormSize) root.style.setProperty("--qs-form-font-size", resolvedFormSize + "px");
  }

  function applyModalCustomization(customization = {}) {
    if (!modal) return;
    const { formTitle, formSubmitLabel, formSuccessMsg, formShowCompany } = customization;

    if (formTitle) {
      const titleEl = modal.querySelector(".quotesnap-modal__title");
      if (titleEl) titleEl.textContent = formTitle;
    }
    if (formSubmitLabel) {
      const submitText = modal.querySelector(".quotesnap-form__submit-text");
      if (submitText) submitText.textContent = formSubmitLabel;
    }
    if (formSuccessMsg) {
      const successText = modal.querySelector(".quotesnap-success__message");
      if (successText) successText.textContent = formSuccessMsg;
    }
    if (formShowCompany === false) {
      const companyField = modal.querySelector(".quotesnap-field--company");
      if (companyField) companyField.style.display = "none";
    }
  }

  // ─── Modal ────────────────────────────────────────────────────────────────

  const modal = document.getElementById("quotesnap-modal");
  const form = document.getElementById("quotesnap-form");
  const successEl = document.getElementById("quotesnap-success");
  const errorEl = document.getElementById("quotesnap-error");

  function openModal() {
    if (!modal) return;
    const productName =
      document.querySelector(".product__title, h1.title, .product-single__title")?.textContent?.trim() || "";
    const nameEl = modal.querySelector(".quotesnap-modal__product-name");
    if (nameEl) nameEl.textContent = productName;

    const pidInput = document.getElementById("quotesnap-product-id");
    const shopInput = document.getElementById("quotesnap-shop");
    if (pidInput) pidInput.value = String(productId);
    if (shopInput) shopInput.value = shop;

    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    modal.querySelector("input[name='customerName']")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (successEl) successEl.setAttribute("hidden", "");
    if (form) { form.reset(); form.removeAttribute("hidden"); }
  }

  modal?.querySelector(".quotesnap-modal__backdrop")?.addEventListener("click", closeModal);
  modal?.querySelector(".quotesnap-modal__close")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // ─── Form submission ──────────────────────────────────────────────────────

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const submitBtn = form.querySelector(".quotesnap-form__submit");
    const submitText = form.querySelector(".quotesnap-form__submit-text");
    const submitSpinner = form.querySelector(".quotesnap-form__submit-spinner");

    if (submitText) submitText.setAttribute("hidden", "");
    if (submitSpinner) submitSpinner.removeAttribute("hidden");
    if (submitBtn) submitBtn.disabled = true;
    if (errorEl) errorEl.setAttribute("hidden", "");

    const body = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/apps/quotesnap/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Request failed");

      form.setAttribute("hidden", "");
      if (successEl) successEl.removeAttribute("hidden");
    } catch {
      if (errorEl) {
        errorEl.textContent = "Something went wrong. Please try again.";
        errorEl.removeAttribute("hidden");
      }
    } finally {
      if (submitText) submitText.removeAttribute("hidden");
      if (submitSpinner) submitSpinner.setAttribute("hidden", "");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // ─── Main ─────────────────────────────────────────────────────────────────

  async function init() {
    let rules, customization = {};

    try {
      const res = await fetch(apiUrl, { credentials: "include" });
      if (!res.ok) return;
      const payload = await res.json();
      if (Array.isArray(payload)) {
        rules = payload;
      } else {
        rules = payload.rules || [];
        customization = payload.customization || {};
      }
    } catch {
      return;
    }

    if (!Array.isArray(rules) || rules.length === 0) return;

    const match = findMatchingRule(rules);
    if (!match) return;

    if (match.hidePrice) hidePrices();

    // Use per-rule customization if available, fall back to store defaults
    const ruleCustomization = match.customization || customization;

    // Apply button customization
    const btnLabel = ruleCustomization.buttonLabel || match.quoteButtonLabel || "Request a Quote";
    injectQuoteButton(btnLabel, ruleCustomization, match.replaceAddToCart);

    // Apply CSS variable customization (colours, fonts, sizes)
    applyCustomizationVars(ruleCustomization);
    // Apply modal text overrides
    applyModalCustomization(ruleCustomization);

    root.style.display = "";
  }

  // Wait for DOM and Shopify analytics to settle
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void init());
  } else {
    void init();
  }
})();
