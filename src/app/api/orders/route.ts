import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

async function sendTelegramNotification(order: {
  id: string;
  customerName: string;
  phoneNumber: string;
  fulfillmentType: string;
  deliveryAddress: string;
  timeSlot: string;
  items: Array<{ name: string; quantity: number; price: number; selectedWeight?: string; weight?: string }>;
  totalAmount: number;
}) {
  try {
    const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const rawChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!rawBotToken || !rawChatId) {
      console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID environment variable missing.");
      return;
    }

    // Clean tokens of any surrounding quotes or inline comments
    const botToken = rawBotToken.trim().split("#")[0].trim().replace(/^["']|["']$/g, "");
    const chatId = rawChatId.trim().split("#")[0].trim().replace(/^["']|["']$/g, "");

    const escapeHtml = (str: string) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : "1024";
    const fulfillmentText = order.fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup";

    const itemsFormatted = (order.items || [])
      .map((item) => {
        const weightStr = item.selectedWeight || item.weight ? ` (${item.selectedWeight || item.weight})` : "";
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return `  - ${escapeHtml(item.name)}${escapeHtml(weightStr)} (x${item.quantity}) - ₹${itemTotal}`;
      })
      .join("\n");

    const messageText = [
      `🛍️ <b>NEW ORDER RECEIVED!</b>`,
      `• <b>Order ID:</b> #${escapeHtml(shortId)}`,
      `• <b>Customer:</b> ${escapeHtml(order.customerName || "Customer")} (${escapeHtml(order.phoneNumber || "N/A")})`,
      `• <b>Fulfillment:</b> ${escapeHtml(fulfillmentText)} (${escapeHtml(order.timeSlot || "N/A")})`,
      `• <b>Address:</b> ${escapeHtml(order.deliveryAddress || "N/A")}`,
      `• <b>Items:</b>\n${itemsFormatted}`,
      `• <b>Total Amount:</b> ₹${order.totalAmount}`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 5-second timeout controller so external network delays never hang order response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`Telegram admin notification sent successfully for Order #${shortId}`);
    } else {
      const errText = await response.text();
      console.warn(`Telegram API returned HTTP ${response.status} for Order #${shortId}: ${errText}`);
    }
  } catch (err: any) {
    console.error("Error sending Telegram admin notification:", err?.message || err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      userEmail,
      customerName,
      phoneNumber,
      fulfillmentType,
      deliveryAddress,
      orderDate,
      timeSlot,
      items,
      subtotal,
      deliveryFee,
      discountAmount = 0,
      appliedCoupon = null,
      totalAmount,
    } = body;

    // 1. Backend Minimum Order Amount Protection (₹200)
    if (!subtotal || subtotal < 200) {
      return NextResponse.json(
        { error: "Minimum order amount is ₹200. Please add more items to your cart." },
        { status: 400 }
      );
    }

    // 2. Validate One-Time Coupon Code Usage using Admin SDK query
    if (appliedCoupon && userId) {
      const code = String(appliedCoupon).trim().toUpperCase();
      const existingOrdersSnapshot = await adminDb
        .collection("orders")
        .where("userId", "==", userId)
        .where("appliedCoupon", "==", code)
        .get();

      if (!existingOrdersSnapshot.empty) {
        return NextResponse.json(
          { error: "You have already used this coupon code in a previous order." },
          { status: 400 }
        );
      }
    }

    // 3. Save order into Firestore database using Admin SDK
    const newOrderData = {
      userId: userId || "guest",
      userEmail: userEmail || "",
      customerName: customerName || "Valued Customer",
      phoneNumber: phoneNumber || "",
      fulfillmentType: fulfillmentType || "delivery",
      deliveryAddress: deliveryAddress || "Store Pickup",
      orderDate: orderDate || "",
      timeSlot: timeSlot || "",
      items: items || [],
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discountAmount: discountAmount || 0,
      appliedCoupon: appliedCoupon || null,
      totalAmount: totalAmount || 0,
      status: "Pending",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("orders").add(newOrderData);

    // 4. Send automated Telegram admin notification (fail-safe background call)
    sendTelegramNotification({
      id: docRef.id,
      customerName: newOrderData.customerName,
      phoneNumber: newOrderData.phoneNumber,
      fulfillmentType: newOrderData.fulfillmentType,
      deliveryAddress: newOrderData.deliveryAddress,
      timeSlot: newOrderData.timeSlot,
      items: newOrderData.items,
      totalAmount: newOrderData.totalAmount,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      orderId: docRef.id,
    });
  } catch (error: any) {
    console.error("API Orders Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process order request." },
      { status: 500 }
    );
  }
}