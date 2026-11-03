/**
 * UPS Creator Studio — browser payment adapter.
 * This file contains no gateway secrets. All payment creation, verification,
 * manual-payment submission and admin review are performed by Supabase Edge Functions.
 */

const EDGE = Object.freeze({
  createOrder: "create-razorpay-order",
  verifyPayment: "verify-razorpay-payment",
  submitManual: "submit-manual-payment",
  reviewManual: "admin-review-manual-payment",
  configurePackage: "configure-package"
});

function readableError(error, fallback) {
  if (!error) return new Error(fallback);
  const message = error.message || error.error_description || fallback;
  return new Error(String(message));
}

async function invokeFunction(supabase, name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw readableError(error, `${name} request failed`);
  if (data?.error) throw new Error(String(data.error));
  return data;
}

async function ensureRazorpayScript() {
  if (window.Razorpay) return;
  const existing = document.querySelector('script[data-ups-razorpay="true"]');
  if (existing) {
    await new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay Checkout script लोड नहीं हुआ।")), { once: true });
    });
    if (window.Razorpay) return;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.upsRazorpay = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay Checkout script लोड नहीं हुआ। इंटरनेट कनेक्शन जाँचें।"));
    document.head.appendChild(script);
  });
  if (!window.Razorpay) throw new Error("Razorpay Checkout उपलब्ध नहीं है।");
}

export function openRazorpayCheckout(order, onSuccess, onFailure) {
  return ensureRazorpayScript().then(() => {
    if (!order || !order.key_id || !order.order_id || !order.amount) {
      throw new Error("Server से अधूरा Razorpay order मिला। Edge Function configuration जाँचें।");
    }
    const checkout = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: Number(order.amount),
      currency: order.currency || "INR",
      name: order.name || "UPS Creator Studio",
      description: order.description || "Subscription payment",
      prefill: order.prefill || {},
      notes: order.notes || {},
      theme: { color: "#6d5dfc" },
      handler: response => Promise.resolve(onSuccess?.(response)).catch(error => onFailure?.(error)),
      modal: { ondismiss: () => onFailure?.(new Error("Payment checkout बंद कर दिया गया।")) }
    });
    checkout.on("payment.failed", event => {
      onFailure?.(new Error(event?.error?.description || "Payment असफल हुआ।"));
    });
    checkout.open();
    return checkout;
  }).catch(error => {
    onFailure?.(error);
    throw error;
  });
}

export function createUPSPaymentClient(supabase) {
  if (!supabase?.functions || !supabase?.rpc) {
    throw new Error("Supabase client payment adapter के लिए उपलब्ध नहीं है।");
  }

  return Object.freeze({
    async loadPackages(audience = "learning_hub") {
      const { data, error } = await supabase
        .from("subscription_packages")
        .select("package_code,audience,display_name,description,amount_paise,currency,duration_days,enabled,selectable,features,limits,sort_order")
        .eq("audience", audience)
        .eq("enabled", true)
        .eq("selectable", true)
        .order("sort_order", { ascending: true });
      if (error) throw readableError(error, "Package catalogue लोड नहीं हुआ।");
      return data || [];
    },

    async createRazorpayOrder(packageCode, selectedStudy = null) {
      if (!packageCode) throw new Error("पहले Package चुनें।");
      const data = await invokeFunction(supabase, EDGE.createOrder, {
        package_code: packageCode,
        selected_study: selectedStudy || null
      });
      const order = data?.order || data;
      if (!order?.order_id || !order?.key_id || !order?.amount) {
        throw new Error("Order response में order_id, key_id या amount नहीं मिला। Supabase Edge Function response जाँचें।");
      }
      return order;
    },

    async verifyRazorpayPayment(response) {
      if (!response?.razorpay_order_id || !response?.razorpay_payment_id || !response?.razorpay_signature) {
        throw new Error("Razorpay verification response अधूरा है।");
      }
      return invokeFunction(supabase, EDGE.verifyPayment, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
    },

    async submitManualUPI(packageCode, utrOrReference, selectedStudy = null) {
      const reference = String(utrOrReference || "").trim();
      if (!packageCode) throw new Error("कृपया Package चुनें।");
      if (reference.length < 6 || reference.length > 80) throw new Error("सही UTR/UPI Reference दर्ज करें।");
      return invokeFunction(supabase, EDGE.submitManual, {
        package_code: packageCode,
        utr_or_upi_ref: reference,
        selected_study: selectedStudy || null
      });
    },

    async reviewManualPayment(transactionId, action, reason = "") {
      if (!transactionId || !["approve", "reject"].includes(action)) throw new Error("Payment review request सही नहीं है।");
      return invokeFunction(supabase, EDGE.reviewManual, {
        transaction_id: transactionId,
        action,
        rejection_reason: action === "reject" ? String(reason).slice(0, 500) : null
      });
    },

    async configurePackage(settings) {
      if (!settings?.package_code) throw new Error("Package code नहीं मिला।");
      return invokeFunction(supabase, EDGE.configurePackage, {
        package_code: settings.package_code,
        amount_paise: Number(settings.amount_paise),
        duration_days: Number(settings.duration_days),
        enabled: settings.enabled !== false
      });
    },

    async getMyActiveSubscriptions() {
      const { data, error } = await supabase.rpc("ups_my_active_subscriptions");
      if (error) throw readableError(error, "Active subscription status नहीं मिल पाया।");
      return data || [];
    }
  });
}
