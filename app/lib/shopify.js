// app/lib/shopify.js
// Add this function to app/lib/shopify.js

// lib/shopify.js - SIMPLIFIED VERSION
// Only for Storefront API (safe for browser)
// Add to lib/shopify.js

// Function to login customer and get access token
// Add to lib/shopify.js
// lib/shopify.js

// 1. Define these ONCE at the top of the file
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_API_TOKEN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

// 2. Add a quick helper to prevent 401s
const storefrontHeaders = {
  "Content-Type": "application/json",
  "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
};

const adminHeaders = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
};

export async function fetchShopifyProducts(
  limit = 12,
  collectionHandle = null
) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    return [];
  }

  let query;
  let variables = { first: limit };

  if (collectionHandle) {
    query = `
      query GetCollectionProducts($handle: String!, $first: Int) {
        collectionByHandle(handle: $handle) {
          id
          title
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                featuredImage {
                  url
                  altText
                }
                images(first: 10) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
                tags
                totalInventory
              }
            }
          }
        }
      }
    `;
    variables.handle = collectionHandle;
  } else {
    query = `
      query GetProducts($first: Int) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
                altText
              }
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
              tags
              totalInventory
            }
          }
        }
      }
    `;
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables }),
        // Cache for 5 minutes to reduce API calls and improve performance
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return [];
    }

    // Handle both cases (collection products or all products)
    let productsData;
    if (collectionHandle) {
      productsData = result.data.collectionByHandle?.products?.edges || [];
    } else {
      productsData = result.data.products.edges;
    }

    // Transform the data to match your expected format
    const products = productsData.map((edge) => {
      const variantId = edge.node.variants?.edges?.[0]?.node?.id || null;
      const galleryUrls = (edge.node.images?.edges || [])
        .map((e) => e.node?.url)
        .filter(Boolean);
      const featuredUrl = edge.node.featuredImage?.url || null;
      const primaryImage = featuredUrl || galleryUrls[0] || null;
      const hoverImage =
        galleryUrls.find((u) => u !== primaryImage) || null;

      return {
        id: edge.node.id,
        variantId, // for Shopify order creation (GID, e.g. gid://shopify/ProductVariant/123)
        Heading: edge.node.title, // Your app expects "Heading"
        description: edge.node.description,
        price: edge.node.priceRange?.minVariantPrice?.amount || "0",
        currency: edge.node.priceRange?.minVariantPrice?.currencyCode || "PKR",
        tags: edge.node.tags || [],
        inStock: edge.node.totalInventory > 0,
        image: primaryImage,
        hoverImage,
        altText: edge.node.featuredImage?.altText || edge.node.title,
        handle: edge.node.handle,
      };
    });
    
    console.log("Shopify Products Response:", products);
    return products;
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return [];
  }
}
/** Extract numeric variant ID from Shopify GID (e.g. gid://shopify/ProductVariant/123 -> 123) */
function variantGidToNumericId(gid) {
  if (!gid || typeof gid !== "string") return null;
  const parts = gid.split("/");
  const last = parts[parts.length - 1];
  const num = parseInt(last, 10);
  return Number.isNaN(num) ? null : num;
}

export async function createOrder(orderData) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error("Shopify API credentials not configured");
  }

  try {
    // Prepare line items: use variant_id when available (so orders show in Shopify), else custom line item
    const lineItems = orderData.items.map((item) => {
      const variantNumericId = item.variantId ? variantGidToNumericId(item.variantId) : null;
      if (variantNumericId) {
        return {
          variant_id: variantNumericId,
          quantity: item.quantity,
        };
      }
      return {
        title: item.name,
        price: item.price.toString(),
        quantity: item.quantity,
        properties: [
          { name: "product_id", value: String(item.id) },
          { name: "product_name", value: item.name },
          ...(item.image ? [{ name: "image_url", value: item.image }] : []),
        ],
      };
    });

    // Prepare shipping address
    const shippingAddress = {
      first_name: orderData.contact.firstName,
      last_name: orderData.contact.lastName || "",
      address1: orderData.shipping.address,
      city: orderData.shipping.city,
      province: orderData.shipping.province,
      country: "Pakistan",
      country_code: "PK",
      phone: orderData.contact.phone,
      zip: orderData.shipping.zipCode || "",
    };

    // Create order payload
    const orderPayload = {
      order: {
        email:
          orderData.contact.email || `order-${Date.now()}@tarakids.com.pk`,
        phone: orderData.contact.phone,
        line_items: lineItems,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        financial_status: "pending",
        currency: "PKR",
        note: orderData.notes || "",
        tags:
          orderData.payment.method === "cod"
            ? "Cash on Delivery"
            : "Bank Transfer",
        note_attributes: [
          {
            name: "payment_method",
            value: orderData.payment.method,
          },
          {
            name: "payment_reference",
            value: orderData.payment.reference || "COD",
          },
          {
            name: "delivery_notes",
            value: orderData.notes || "",
          },
        ],
      },
    };

    console.log("Calling Shopify API...", {
      domain: SHOPIFY_STORE_DOMAIN,
      url: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json`,
    });

    // Make API call to create order
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(orderPayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Shopify API error response:", {
        status: response.status,
        statusText: response.statusText,
        result,
      });
      throw new Error(
        result.errors
          ? JSON.stringify(result.errors)
          : `Shopify API error: ${response.status}`
      );
    }

    if (result.errors) {
      console.error("Shopify order errors:", result.errors);
      throw new Error(JSON.stringify(result.errors));
    }

    console.log("Order created successfully:", result.order);
    return result.order;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
}

/**
 * Simple version for testing
 */
export async function createSimpleOrder(
  items,
  customerInfo,
  shippingInfo,
  paymentInfo
) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error("Missing Shopify credentials");
  }

  const orderData = {
    order: {
      line_items: items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        price: item.price.toString(),
        properties: [{ name: "custom_id", value: item.id }],
      })),
      customer: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName || "",
        email:
          customerInfo.email || `customer-${Date.now()}@tarakids.com.pk`,
        phone: customerInfo.phone,
      },
      shipping_address: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName || "",
        address1: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        country: "Pakistan",
        phone: customerInfo.phone,
      },
      billing_address: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName || "",
        address1: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        country: "Pakistan",
        phone: customerInfo.phone,
      },
      financial_status: "pending",
      note: `Payment Method: ${paymentInfo.method}. Reference: ${
        paymentInfo.reference || "COD"
      }`,
      tags: paymentInfo.method === "cod" ? "COD" : "Bank Transfer",
    },
  };

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json`,
    {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(orderData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.errors ? JSON.stringify(result.errors) : "API error"
    );
  }

  return result;
}
export async function getCustomerOrders(accessToken) {
  const query = `
    query getCustomerOrders($customerAccessToken: String!, $first: Int = 10) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: $first, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 3) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
    first: 10,
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.customer?.orders?.edges || [];
  } catch (error) {
    console.error("Get customer orders error:", error);
    throw error;
  }
}
export async function loginCustomer(email, password) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: { email, password },
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    if (result.data.customerAccessTokenCreate.customerUserErrors.length > 0) {
      const errors = result.data.customerAccessTokenCreate.customerUserErrors;
      throw new Error(errors.map((err) => err.message).join(", "));
    }

    return result.data.customerAccessTokenCreate.customerAccessToken;
  } catch (error) {
    console.error("Shopify login error:", error);
    throw error;
  }
}

// Function to get customer data using access token
export async function getCustomerData(accessToken) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
        createdAt
      }
    }
  `;

  const variables = { customerAccessToken: accessToken };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.customer;
  } catch (error) {
    console.error("Get customer data error:", error);
    throw error;
  }
}
export async function createCustomerInShopify(customerData) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.error("Missing Shopify environment variables for createCustomerInShopify");
    throw new Error("Shopify API credentials not configured");
  }
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  // FIX: Format phone for Pakistan OR send null if empty
  let phoneValue = null;

  if (customerData.phone && customerData.phone.trim() !== "") {
    const phone = customerData.phone.trim();

    // Format for Pakistan: +92XXXXXXXXXX
    // Remove all non-digits
    let digits = phone.replace(/\D/g, "");

    // Remove leading 0 if present
    if (digits.startsWith("0")) {
      digits = digits.substring(1);
    }

    // Ensure it starts with Pakistan code (92)
    if (!digits.startsWith("92") && digits.length <= 10) {
      digits = "92" + digits;
    }

    // Add + prefix
    phoneValue = "+" + digits;

    // Basic validation: must be between 12-14 characters total
    // +92 (3 digits) = 12 chars minimum for Pakistan
    if (phoneValue.length < 12 || phoneValue.length > 14) {
      throw new Error(
        "Please enter a valid Pakistani phone number (e.g., 0300 1234567)"
      );
    }
  }

  const variables = {
    input: {
      email: customerData.email,
      password: customerData.password,
      firstName: customerData.firstName,
      lastName: customerData.lastName || null,
      phone: phoneValue, // Formatted phone or null
      acceptsMarketing: customerData.acceptsMarketing || false,
    },
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const createResult = result.data?.customerCreate;
    const userErrors = createResult?.customerUserErrors || [];
    const customer = createResult?.customer;

    if (customer && userErrors.length > 0) {
      const isVerificationOnly = userErrors.every((e) => e.message?.includes("sent an email"));
      if (isVerificationOnly) return customer;
    }
    if (userErrors.length > 0) {
      throw new Error(userErrors.map((e) => e.message).join(", "));
    }
    if (customer) return customer;
    throw new Error("Customer creation failed");
  } catch (error) {
    console.error("Shopify customer creation error:", error);
    throw error;
  }
}

/**
 * Create a customer with email only (no password) via Admin API, then send account invite.
 * Customer receives an email to set their password and activate – use for "email-only" signup.
 * Call from server only (uses SHOPIFY_ADMIN_API_TOKEN).
 */
export async function createCustomerWithInviteAdmin(input) {
  const { email, firstName, lastName, phone } = input;
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error("Shopify Admin API credentials not configured");
  }
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

  // 1) Create customer (Admin API – no password)
  const createMutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id email firstName lastName phone }
        userErrors { field message }
      }
    }
  `;
  const customerInput = {
    email: email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone && phone.trim() !== "" ? formatPhoneForShopify(phone) : null,
  };
  const createRes = await fetch(url, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      query: createMutation,
      variables: { input: customerInput },
    }),
  });
  const createJson = await createRes.json();
  if (createJson.errors) {
    throw new Error(createJson.errors[0].message || "Admin API error");
  }
  const userErrors = createJson.data?.customerCreate?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }
  const customer = createJson.data?.customerCreate?.customer;
  if (!customer?.id) {
    throw new Error("Customer creation failed");
  }

  // 2) Send account invite email (customer sets password via link)
  const inviteMutation = `
    mutation customerSendAccountInviteEmail($customerId: ID!) {
      customerSendAccountInviteEmail(customerId: $customerId) {
        customer { id }
        userErrors { field message }
      }
    }
  `;
  const inviteRes = await fetch(url, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      query: inviteMutation,
      variables: { customerId: customer.id },
    }),
  });
  const inviteJson = await inviteRes.json();
  if (inviteJson.errors) {
    throw new Error(inviteJson.errors[0].message || "Invite API error");
  }
  const inviteErrors = inviteJson.data?.customerSendAccountInviteEmail?.userErrors || [];
  if (inviteErrors.length > 0) {
    throw new Error(inviteErrors.map((e) => e.message).join(", "));
  }

  return { customer: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone } };
}

function formatPhoneForShopify(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "+92" + digits.substring(1);
  }
  if (!digits.startsWith("92") && digits.length <= 10) {
    return "+92" + digits;
  }
  return "+" + digits;
}

/** Send password recovery email to customer (Storefront API) */
export async function customerRecover(email) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error("Shopify API credentials not configured");
  }
  const mutation = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: storefrontHeaders,
      body: JSON.stringify({ query: mutation, variables: { email } }),
    }
  );
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  const errors = result.data?.customerRecover?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }
  return true;
}

/**
 * Complete password reset from email link (Storefront API).
 * @param {string} customerNumericId - Numeric ID from URL path (e.g. 8824960516251)
 * @param {string} resetToken - Token from URL path
 * @param {string} password - New password
 */
export async function customerResetPassword(customerNumericId, resetToken, password) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error("Shopify API credentials not configured");
  }
  const id = String(customerNumericId).startsWith("gid://")
    ? customerNumericId
    : `gid://shopify/Customer/${customerNumericId}`;
  const mutation = `
    mutation customerReset($id: ID!, $input: CustomerResetInput!) {
      customerReset(id: $id, input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: storefrontHeaders,
      body: JSON.stringify({
        query: mutation,
        variables: {
          id,
          input: { resetToken, password },
        },
      }),
    }
  );
  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  const payload = result.data?.customerReset;
  const errors = payload?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }
  const token = payload?.customerAccessToken;
  if (!token?.accessToken) {
    throw new Error("Password was not updated. Please request a new reset link.");
  }
  return token;
}

/** Update customer profile (firstName, lastName, phone). Requires accessToken. */
export async function updateCustomerProfile(accessToken, updates) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error("Shopify API credentials not configured");
  }
  const mutation = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          firstName
          lastName
          email
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const customer = {};
  if (updates.firstName != null) customer.firstName = updates.firstName;
  if (updates.lastName != null) customer.lastName = updates.lastName;
  if (updates.phone != null) customer.phone = updates.phone === "" ? null : updates.phone;
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: storefrontHeaders,
      body: JSON.stringify({
        query: mutation,
        variables: { customerAccessToken: accessToken, customer },
      }),
    }
  );
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  const errors = result.data?.customerUpdate?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }
  return result.data.customerUpdate.customer;
}

// Add other Storefront API functions as needed
export async function getCustomerAccessToken(email, password) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: { email, password },
  };

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: storefrontHeaders,
      body: JSON.stringify({ query: mutation, variables }),
    }
  );

  const result = await response.json();
  return result.data.customerAccessTokenCreate;
}

export async function fetchProductByHandle(handle) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.error("Missing Shopify environment variables");
    return null;
  }

  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        vendor
        tags
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          name
          values
        }
        variants(first: 100) {
          edges {
            node {
              id
              availableForSale
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables: { handle } }),
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    return result.data.productByHandle;
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
    return null;
  }
}
// In app/lib/shopify.js - REPLACE THE EXISTING FUNCTION
// SIMPLE WORKING VERSION - Use this instead
export async function fetchShopifyCollections(first = 10) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    return [];
  }

  // Simple query without product count
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables: { first } }),
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return [];
    }

    const collections = result.data.collections.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      image: edge.node.image?.url || null,
      altText: edge.node.image?.altText || edge.node.title,
      // Don't include count - we'll calculate it differently
    }));
    
    console.log("Shopify Collections Response:", collections);
    return collections;
  } catch (error) {
    console.error("Error fetching Shopify collections:", error);
    return [];
  }
}

/** Get a single collection by handle (for collection page title + SEO description) */
export async function getCollectionByHandle(handle) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN || !handle) {
    return null;
  }

  const query = `
    query GetCollectionByHandle($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        image {
          url
          altText
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables: { handle } }),
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    const node = result.data?.collectionByHandle;
    if (!node) return null;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description || "",
      descriptionHtml: node.descriptionHtml || "",
      image: node.image?.url || null,
      altText: node.image?.altText || node.title,
    };
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
  }
}

// export async function fetchShopifyProducts() {
//   const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
//   const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_API_TOKEN;

//   if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
//     console.error("Missing Shopify environment variables");
//     return [];
//   }

//   const query = `
//     query GetProducts($first: Int = 20) {
//       products(first: $first) {
//         edges {
//           node {
//             id
//             title
//             handle
//             description
//             descriptionHtml
//             featuredImage {
//               url
//               altText
//               width
//               height
//             }
//             priceRange {
//               minVariantPrice {
//                 amount
//                 currencyCode
//               }
//               maxVariantPrice {
//                 amount
//                 currencyCode
//               }
//             }
//             tags
//             totalInventory
//           }
//         }
//       }
//     }
//   `;

//   try {
//     const response = await fetch(
//       `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
//         },
//         body: JSON.stringify({ query, variables: { first: 12 } }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Shopify API error: ${response.statusText}`);
//     }

//     const result = await response.json();

//     if (result.errors) {
//       console.error("GraphQL Errors:", result.errors);
//       return [];
//     }

//     // Transform the data to a simpler format
//     return result.data.products.edges.map((edge) => ({
//       id: edge.node.id,
//       title: edge.node.title,
//       handle: edge.node.handle,
//       description: edge.node.description,
//       image: edge.node.featuredImage?.url || null,
//       altText: edge.node.featuredImage?.altText || edge.node.title,
//       price: edge.node.priceRange?.minVariantPrice?.amount || "0",
//       currency: edge.node.priceRange?.minVariantPrice?.currencyCode || "USD",
//       tags: edge.node.tags || [],
//       inStock: edge.node.totalInventory > 0,
//     }));
//   } catch (error) {
//     console.error("Error fetching Shopify products:", error);
//     return [];
//   }
// }

// Fetch blogs from Shopify
export async function fetchShopifyBlogs(first = 10) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.error("Missing Shopify environment variables");
    return [];
  }

  const query = `
    query GetBlogs($first: Int!) {
      blogs(first: $first) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables: { first } }),
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return [];
    }

    return result.data.blogs.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
    }));
  } catch (error) {
    console.error("Error fetching Shopify blogs:", error);
    return [];
  }
}

// Fetch articles from a specific blog
export async function fetchShopifyBlogArticles(blogHandle = "news", first = 50) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.error("Missing Shopify environment variables");
    return [];
  }

  const query = `
    query GetBlogArticles($handle: String!, $first: Int!) {
      blogByHandle(handle: $handle) {
        id
        title
        handle
        articles(first: $first) {
          edges {
            node {
              id
              title
              handle
              excerpt
              excerptHtml
              content
              contentHtml
              author {
                name
              }
              publishedAt
              tags
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ query, variables: { handle: blogHandle, first } }),
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      // If blog not found, try to list available blogs
      if (result.errors.some(e => e.message?.includes("Could not find") || e.message?.includes("not found"))) {
        console.warn(`Blog with handle "${blogHandle}" not found. Fetching available blogs...`);
        const availableBlogs = await fetchShopifyBlogs(10);
        console.log("Available blogs:", availableBlogs);
        if (availableBlogs.length > 0) {
          console.log(`Try using blog handle: "${availableBlogs[0].handle}"`);
        }
      }
      return [];
    }

    if (!result.data.blogByHandle) {
      console.warn(`Blog with handle "${blogHandle}" not found.`);
      // Try to fetch available blogs
      const availableBlogs = await fetchShopifyBlogs(10);
      if (availableBlogs.length > 0) {
        console.log("Available blogs:", availableBlogs);
        console.log(`Try using blog handle: "${availableBlogs[0].handle}"`);
      }
      return [];
    }

    const articlesData = result.data.blogByHandle.articles.edges;
    console.log(`Found ${articlesData.length} articles in blog "${result.data.blogByHandle.title}" (handle: "${result.data.blogByHandle.handle}")`);
    
    if (articlesData.length === 0) {
      console.warn(`Blog "${result.data.blogByHandle.title}" exists but has no published articles.`);
    }

    // Transform Shopify articles to match the expected blog post format
    const articles = articlesData.map((edge) => {
      const article = edge.node;
      const publishedDate = new Date(article.publishedAt);
      const formattedDate = publishedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = article.contentHtml
        ? article.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).length
        : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Extract category from tags or use first tag
      const category = article.tags && article.tags.length > 0 
        ? article.tags[0].charAt(0).toUpperCase() + article.tags[0].slice(1)
        : "General";

      return {
        id: article.id,
        slug: article.handle,
        title: article.title,
        excerpt: article.excerpt || article.excerptHtml?.replace(/<[^>]*>/g, "") || "",
        content: article.contentHtml || article.content || "",
        author: article.author?.name || "Tara Kids",
        authorRole: "Editor",
        date: formattedDate,
        readTime: `${readTime} min read`,
        category: category,
        tags: article.tags || [],
        image: article.image?.url || "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=600",
        featured: article.tags?.some(tag => tag.toLowerCase().includes("featured")) || false,
      };
    });
    
    console.log("Shopify Blog Articles Response:", articles);
    return articles;
  } catch (error) {
    console.error("Error fetching Shopify blog articles:", error);
    return [];
  }
}

// Fetch a single article by handle
export async function fetchShopifyArticleByHandle(blogHandle, articleHandle) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.error("Missing Shopify environment variables");
    return null;
  }

  const query = `
    query GetArticle($blogHandle: String!, $articleHandle: String!) {
      blogByHandle(handle: $blogHandle) {
        id
        title
        articleByHandle(handle: $articleHandle) {
          id
          title
          handle
          excerpt
          excerptHtml
          content
          contentHtml
          author {
            name
          }
          publishedAt
          tags
          image {
            url
            altText
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: storefrontHeaders,
        body: JSON.stringify({ 
          query, 
          variables: { blogHandle, articleHandle } 
        }),
        next: { revalidate: 300 },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    if (!result.data.blogByHandle?.articleByHandle) {
      return null;
    }

    const article = result.data.blogByHandle.articleByHandle;
    const publishedDate = new Date(article.publishedAt);
    const formattedDate = publishedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const wordCount = article.contentHtml
      ? article.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).length
      : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const category = article.tags && article.tags.length > 0 
      ? article.tags[0].charAt(0).toUpperCase() + article.tags[0].slice(1)
      : "General";

    return {
      id: article.id,
      slug: article.handle,
      title: article.title,
      excerpt: article.excerpt || article.excerptHtml?.replace(/<[^>]*>/g, "") || "",
      content: article.contentHtml || article.content || "",
      author: article.author?.name || "Tara Kids",
      authorRole: "Editor",
      date: formattedDate,
      readTime: `${readTime} min read`,
      category: category,
      tags: article.tags || [],
      image: article.image?.url || "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=600",
      featured: article.tags?.some(tag => tag.toLowerCase().includes("featured")) || false,
    };
  } catch (error) {
    console.error("Error fetching Shopify article:", error);
    return null;
  }
}
