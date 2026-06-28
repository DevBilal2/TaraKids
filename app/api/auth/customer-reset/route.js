import { NextResponse } from "next/server";
import { customerResetPassword, getCustomerData } from "../../../lib/shopify";

const MIN_PASSWORD = 8;

export async function POST(request) {
  try {
    const body = await request.json();
    const customerId = body?.customerId;
    const resetToken = body?.resetToken;
    const password = body?.password;

    if (!customerId || !resetToken || !password) {
      return NextResponse.json(
        { error: "Missing customer ID, reset token, or password." },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD} characters.` },
        { status: 400 }
      );
    }

    const tokenData = await customerResetPassword(
      String(customerId),
      String(resetToken),
      password
    );
    const customer = await getCustomerData(tokenData.accessToken);

    return NextResponse.json({
      accessToken: tokenData.accessToken,
      expiresAt: tokenData.expiresAt,
      customer,
    });
  } catch (e) {
    const message =
      e?.message || "Could not reset password. The link may have expired—request a new one.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
