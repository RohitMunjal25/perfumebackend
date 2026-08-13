import { useEffect, useState } from "react";
import { apiRequest } from "./api";

export default function MyOrderDetailPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiRequest(`/orders/${orderId}`)
      .then((data) => {
        if (active) setOrder(data.order);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) return <main className="order-page">Loading order...</main>;
  if (error) return <main className="order-page">{error}</main>;
  if (!order) return <main className="order-page">Order not found</main>;

  return (
    <main className="order-page">
      <header>
        <h1>Order #{order._id}</h1>
        <p>Status: {order.orderStatus}</p>
        <p>Payment: {order.paymentStatus}</p>
      </header>

      <section>
        <h2>Products</h2>
        {order.products.map((item) => (
          <article key={item._id || item.productId}>
            {item.image && <img src={item.image} alt={item.name} width="72" />}
            <div>
              <h3>{item.name}</h3>
              <p>Qty: {item.quantity}</p>
              <p>Price: Rs. {item.price}</p>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2>Delivery Address</h2>
        <p>{order.shippingAddress?.fullName}</p>
        <p>{order.shippingAddress?.phone}</p>
        <p>{order.shippingAddress?.address}</p>
        <p>
          {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
          {order.shippingAddress?.pincode}
        </p>
      </section>

      <section>
        <h2>Payment Summary</h2>
        <p>Total: Rs. {order.totalAmount}</p>
        <p>Discount: Rs. {order.discountAmount || 0}</p>
        <p>Final: Rs. {order.finalAmount || order.totalAmount}</p>
        {order.couponCode && <p>Coupon: {order.couponCode}</p>}
      </section>

      <section>
        <h2>Tracking</h2>
        {order.courierName && <p>Courier: {order.courierName}</p>}
        {order.trackingEmbedSrc ? (
          <iframe
            title="Order tracking"
            src={order.trackingEmbedSrc}
            style={{ width: "100%", minHeight: 420, border: 0 }}
          />
        ) : order.trackingLink ? (
          <a href={order.trackingLink} target="_blank" rel="noreferrer">
            Track Order
          </a>
        ) : (
          <p>Tracking will appear here once admin ships your order.</p>
        )}
      </section>

      <section>
        <h2>Support</h2>
        <p>Need help with this order?</p>
        <a href={`/contact?orderId=${order._id}`}>Contact support</a>
      </section>
    </main>
  );
}

