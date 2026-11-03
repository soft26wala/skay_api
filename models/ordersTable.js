import database from "../database/db.js";
export async function createOrdersTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS orders (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         buyer_id UUID,
         total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
         tax_price DECIMAL(10,2) NOT NULL CHECK (tax_price >= 0),
         shipping_price DECIMAL(10,2) NOT NULL CHECK (shipping_price >= 0),
         cgst DECIMAL(10,2) DEFAULT 0,
         sgst DECIMAL(10,2) DEFAULT 0,
         igst DECIMAL(10,2) DEFAULT 0,
         order_status VARCHAR(50) DEFAULT 'Processing' CHECK (order_status IN ('Processing', 'Order Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
         paid_at TIMESTAMP CHECK (paid_at IS NULL OR paid_at <= CURRENT_TIMESTAMP),
         shipped_at TIMESTAMP,
         out_for_delivery_at TIMESTAMP,
         delivered_at TIMESTAMP,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL);
         
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgst DECIMAL(10,2) DEFAULT 0;
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS sgst DECIMAL(10,2) DEFAULT 0;
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS igst DECIMAL(10,2) DEFAULT 0;
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP;
         ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
         ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
         ALTER TABLE orders ADD CONSTRAINT orders_order_status_check CHECK (order_status IN ('Processing', 'Order Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));
         ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL;
         `;
    await database.query(query);
  } catch (error) {
    console.error("❌ Failed To Create Orders Table.", error);
    process.exit(1);
  }
}
