import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import { generatePaymentIntent } from "../utils/generatePaymentIntent.js";
import {
  getStallionConfig,
  saveStallionConfig,
  testStallionConnection,
  createStallionShipment,
  fetchStallionTracking,
} from "../utils/stallionExpress.js";

export const placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    full_name,
    state,
    city,
    country,
    address,
    pincode,
    phone,
    orderedItems,
  } = req.body;
  if (
    !full_name ||
    !state ||
    !city ||
    !country ||
    !address ||
    !pincode ||
    !phone
  ) {
    return next(
      new ErrorHandler("Please provide complete shipping details.", 400)
    );
  }

  const items = Array.isArray(orderedItems)
    ? orderedItems
    : JSON.parse(orderedItems);

  if (!items || items.length === 0) {
    return next(new ErrorHandler("No items in cart.", 400));
  }
  const productIds = items.map((item) => item.product.id);
  const { rows: products } = await database.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
    [productIds]
  );

  let total_price = 0;
  const values = [];
  const placeholders = [];

  items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.product.id);

    if (!product) {
      return next(
        new ErrorHandler(`Product not found for ID: ${item.product.id}`, 404)
      );
    }

    if (item.quantity > product.stock) {
      return next(
        new ErrorHandler(
          `Only ${product.stock} units available for ${product.name}`,
          400
        )
      );
    }

    const itemTotal = product.price * item.quantity;
    total_price += itemTotal;

    values.push(
      null,
      product.id,
      item.quantity,
      product.price,
      item.product.images[0].url || "",
      product.name
    );

    const offset = index * 6;

    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
        offset + 5
      }, $${offset + 6})`
    );
  });

  const tax_price = 0.18;
  const shipping_price = total_price >= 50 ? 0 : 2;
  total_price = Math.round(
    total_price + total_price * tax_price + shipping_price
  );

  const orderResult = await database.query(
    `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.user.id, total_price, tax_price, shipping_price]
  );

  const orderId = orderResult.rows[0].id;

  for (let i = 0; i < values.length; i += 6) {
    values[i] = orderId;
  }

  await database.query(
    `
    INSERT INTO order_items (order_id, product_id, quantity, price, image, title)
    VALUES ${placeholders.join(", ")} RETURNING *
    `,
    values
  );

  await database.query(
    `
    INSERT INTO shipping_info (order_id, full_name, state, city, country, address, pincode, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `,
    [orderId, full_name, state, city, country, address, pincode, phone]
  );

  const paymentResponse = await generatePaymentIntent(orderId, total_price);

  if (!paymentResponse.success) {
    return next(new ErrorHandler("Payment failed. Try again.", 500));
  }

  res.status(200).json({
    success: true,
    message: "Order placed successfully. Please proceed to payment.",
    paymentIntent: paymentResponse.clientSecret,
    total_price,
  });
});

export const fetchSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const result = await database.query(
    `
    SELECT 
 o.*, 
 COALESCE(
 json_agg(
json_build_object(
'order_item_id', oi.id,
'order_id', oi.order_id,
'product_id', oi.product_id,
'quantity', oi.quantity,
'price', oi.price
 )
 ) FILTER (WHERE oi.id IS NOT NULL), '[]'
 ) AS order_items,
 json_build_object(
 'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone
 ) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.id = $1
GROUP BY o.id, s.id;
`,
    [orderId]
  );

  res.status(200).json({
    success: true,
    message: "Order fetched.",
    orders: result.rows[0],
  });
});

export const fetchMyOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(
    `
  SELECT 
  o.*, 

  COALESCE(
    json_agg(
      json_build_object(
        'order_item_id', oi.id,
        'order_id', oi.order_id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'image', oi.image,
        'title', oi.title
      )
    ) FILTER (WHERE oi.id IS NOT NULL), '[]'
  ) AS order_items,

  json_build_object(
    'full_name', s.full_name,
    'state', s.state,
    'city', s.city,
    'country', s.country,
    'address', s.address,
    'pincode', s.pincode,
    'phone', s.phone
  ) AS shipping_info,

  -- 🔥 ADD THIS
  p.payment_type,
  p.payment_status

FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
LEFT JOIN payments p ON o.id = p.order_id

WHERE o.buyer_id = $1

GROUP BY o.id, s.id, p.payment_type, p.payment_status
ORDER BY o.created_at DESC;
        `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: "All your orders are fetched.",
    myOrders: result.rows,
  });
});

export const fetchAllOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(`
            SELECT o.*,
COALESCE(json_agg(
 json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
 )
) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,

json_build_object(
 'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone
) AS shipping_info

FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id

-- ❌ REMOVE THIS LINE
-- WHERE o.paid_at IS NOT NULL

GROUP BY o.id, s.id
ORDER BY o.created_at DESC;
        `);

  res.status(200).json({
    success: true,
    message: "All orders fetched.",
    orders: result.rows,
  });
});

export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new ErrorHandler("Provide a valid status for order.", 400));
  }
  const { orderId } = req.params;
  const results = await database.query(
    `
    SELECT * FROM orders WHERE id = $1
    `,
    [orderId]
  );

  if (results.rows.length === 0) {
    return next(new ErrorHandler("Invalid order ID.", 404));
  }

  let timestampClause = "";
  if (status === "Shipped") {
    timestampClause = ", shipped_at = COALESCE(shipped_at, NOW())";
  } else if (status === "Out for Delivery") {
    timestampClause = ", out_for_delivery_at = COALESCE(out_for_delivery_at, NOW()), shipped_at = COALESCE(shipped_at, NOW())";
  } else if (status === "Delivered") {
    timestampClause = ", delivered_at = COALESCE(delivered_at, NOW()), out_for_delivery_at = COALESCE(out_for_delivery_at, NOW()), shipped_at = COALESCE(shipped_at, NOW())";
  }

  const updatedOrder = await database.query(
    `
    UPDATE orders SET order_status = $1 ${timestampClause} WHERE id = $2 RETURNING *
    `,
    [status, orderId]
  );

  res.status(200).json({
    success: true,
    message: "Order status updated.",
    updatedOrder: updatedOrder.rows[0],
  });
});

export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const results = await database.query(
    `
        DELETE FROM orders WHERE id = $1 RETURNING *
        `,
    [orderId]
  );
  if (results.rows.length === 0) {
    return next(new ErrorHandler("Invalid order ID.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted.",
    order: results.rows[0],
  });
});

// ==================== STALLION EXPRESS INTEGRATION ====================

// 1. Get Stallion Settings
export const getStallionSettings = catchAsyncErrors(async (req, res, next) => {
  const config = await getStallionConfig();
  const maskedKey = config.apiKey
    ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}`
    : "";

  res.status(200).json({
    success: true,
    config: {
      ...config,
      apiKey: maskedKey,
      hasKey: Boolean(config.apiKey && config.apiKey.length > 5),
    },
  });
});

// 2. Save & Test Stallion Settings
export const saveStallionSettings = catchAsyncErrors(async (req, res, next) => {
  const {
    apiKey,
    environment,
    defaultCarrier,
    shipperCity,
    shipperProvince,
    shipperPostalCode,
    autoSync,
  } = req.body;

  let testResult = { success: true, message: "Settings saved." };
  if (apiKey && apiKey.trim() && !apiKey.includes("...")) {
    testResult = await testStallionConnection(apiKey, environment || "production");
  }

  const saved = await saveStallionConfig({
    ...(apiKey && !apiKey.includes("...") ? { apiKey } : {}),
    environment,
    defaultCarrier,
    shipperCity,
    shipperProvince,
    shipperPostalCode,
    autoSync,
  });

  res.status(200).json({
    success: true,
    message: "Stallion Express settings updated successfully.",
    testResult,
    config: {
      ...saved,
      apiKey: saved.apiKey ? `${saved.apiKey.slice(0, 4)}...${saved.apiKey.slice(-4)}` : "",
      hasKey: Boolean(saved.apiKey && saved.apiKey.length > 5),
    },
  });
});

// 3. Ship Order with Stallion Express (Create Shipment & Fetch Tracking)
export const shipOrderWithStallion = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { weight, length, width, height } = req.body || {};

  // Fetch full order with items and shipping info
  const orderRes = await database.query(
    `
    SELECT o.*,
    COALESCE(json_agg(
      json_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'title', oi.title
      )
    ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
    json_build_object(
      'full_name', s.full_name,
      'state', s.state,
      'city', s.city,
      'country', s.country,
      'address', s.address,
      'pincode', s.pincode,
      'phone', s.phone
    ) AS shipping_info
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN shipping_info s ON o.id = s.order_id
    WHERE o.id = $1
    GROUP BY o.id, s.id
    `,
    [orderId]
  );

  if (orderRes.rows.length === 0) {
    return next(new ErrorHandler("Order not found.", 404));
  }

  const order = orderRes.rows[0];

  // Call Stallion Express API
  const shipmentResult = await createStallionShipment(order, { weight, length, width, height });

  // Fetch initial tracking events
  const trackingData = await fetchStallionTracking(shipmentResult.tracking_number);

  // Update order in database
  const updatedOrder = await database.query(
    `
    UPDATE orders
    SET order_status = 'Shipped',
        shipped_at = COALESCE(shipped_at, NOW()),
        stallion_shipment_id = $1,
        stallion_tracking_number = $2,
        stallion_carrier = $3,
        stallion_label_url = $4,
        stallion_status = $5,
        stallion_tracking_data = $6,
        stallion_synced_at = NOW()
    WHERE id = $7
    RETURNING *
    `,
    [
      shipmentResult.shipment_id,
      shipmentResult.tracking_number,
      shipmentResult.carrier,
      shipmentResult.label_url,
      shipmentResult.raw_status || "in_transit",
      JSON.stringify(trackingData),
      orderId,
    ]
  );

  res.status(200).json({
    success: true,
    message: shipmentResult.is_live_api
      ? "Shipment created on Stallion Express and tracking synced!"
      : "Stallion Express shipment record & tracking code generated successfully.",
    shipment: shipmentResult,
    tracking: trackingData,
    updatedOrder: updatedOrder.rows[0],
  });
});

// 4. Manually Attach or Edit Stallion Tracking Number
export const attachStallionTracking = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { trackingNumber, carrier, labelUrl } = req.body;

  if (!trackingNumber) {
    return next(new ErrorHandler("Tracking number is required.", 400));
  }

  const trackingData = await fetchStallionTracking(trackingNumber);

  const updatedOrder = await database.query(
    `
    UPDATE orders
    SET order_status = 'Shipped',
        shipped_at = COALESCE(shipped_at, NOW()),
        stallion_tracking_number = $1,
        stallion_carrier = COALESCE($2, stallion_carrier, 'canada_post'),
        stallion_label_url = COALESCE($3, stallion_label_url, ''),
        stallion_status = $4,
        stallion_tracking_data = $5,
        stallion_synced_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [
      trackingNumber.trim(),
      carrier || "canada_post",
      labelUrl || "",
      trackingData.status || "in_transit",
      JSON.stringify(trackingData),
      orderId,
    ]
  );

  res.status(200).json({
    success: true,
    message: "Stallion tracking number attached successfully.",
    tracking: trackingData,
    updatedOrder: updatedOrder.rows[0],
  });
});

// 5. Track Stallion Shipment for an Order (Live sync)
export const trackStallionOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  const orderRes = await database.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );

  if (orderRes.rows.length === 0) {
    return next(new ErrorHandler("Order not found.", 404));
  }

  const order = orderRes.rows[0];
  const trackingNumber = order.stallion_tracking_number;

  if (!trackingNumber) {
    return res.status(200).json({
      success: true,
      has_tracking: false,
      message: "Order has not yet been assigned a Stallion tracking number.",
      order,
    });
  }

  // Fetch live events from Stallion API
  const liveTracking = await fetchStallionTracking(trackingNumber);

  // Determine updated status
  let statusUpdateSql = "";

  if (liveTracking.mapped_order_status === "Delivered" && order.order_status !== "Delivered") {
    statusUpdateSql = ", order_status = 'Delivered', delivered_at = COALESCE(delivered_at, NOW())";
  } else if (
    liveTracking.mapped_order_status === "Out for Delivery" &&
    order.order_status !== "Delivered" &&
    order.order_status !== "Out for Delivery"
  ) {
    statusUpdateSql = ", order_status = 'Out for Delivery', out_for_delivery_at = COALESCE(out_for_delivery_at, NOW())";
  }

  const updatedOrder = await database.query(
    `
    UPDATE orders
    SET stallion_status = $1,
        stallion_tracking_data = $2,
        stallion_synced_at = NOW()
        ${statusUpdateSql}
    WHERE id = $3
    RETURNING *
    `,
    [liveTracking.status, JSON.stringify(liveTracking), orderId]
  );

  res.status(200).json({
    success: true,
    has_tracking: true,
    tracking: liveTracking,
    updatedOrder: updatedOrder.rows[0],
  });
});

// 6. Bulk Sync All Active Stallion Orders
export const syncAllStallionOrders = catchAsyncErrors(async (req, res, next) => {
  const activeOrdersRes = await database.query(`
    SELECT id, stallion_tracking_number, order_status
    FROM orders
    WHERE stallion_tracking_number IS NOT NULL
      AND order_status NOT IN ('Delivered', 'Cancelled')
    LIMIT 50;
  `);

  const results = [];
  for (const ord of activeOrdersRes.rows) {
    try {
      const live = await fetchStallionTracking(ord.stallion_tracking_number);
      let statusSql = "";
      if (live.mapped_order_status === "Delivered") {
        statusSql = ", order_status = 'Delivered', delivered_at = COALESCE(delivered_at, NOW())";
      } else if (live.mapped_order_status === "Out for Delivery") {
        statusSql = ", order_status = 'Out for Delivery', out_for_delivery_at = COALESCE(out_for_delivery_at, NOW())";
      }

      await database.query(
        `UPDATE orders
         SET stallion_status = $1,
             stallion_tracking_data = $2,
             stallion_synced_at = NOW()
             ${statusSql}
         WHERE id = $3`,
        [live.status, JSON.stringify(live), ord.id]
      );
      results.push({ orderId: ord.id, tracking: ord.stallion_tracking_number, status: live.status });
    } catch (e) {
      console.warn(`Failed to sync order ${ord.id}:`, e.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Synced ${results.length} active Stallion Express consignments.`,
    results,
  });
});
