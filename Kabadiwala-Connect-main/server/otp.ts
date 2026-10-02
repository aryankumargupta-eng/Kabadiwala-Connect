const TWILIO_VERIFY_BASE = "https://verify.twilio.com/v2";

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !serviceSid) {
    throw new Error("Mobile OTP is not configured.");
  }
  return { accountSid, authToken, serviceSid };
}

function authHeader(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export function normalizePhone(phone: string) {
  const cleaned = phone.replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    throw new Error("Enter a valid mobile number with country code.");
  }
  return cleaned;
}

export async function sendOtp(phone: string, locale = "en") {
  const { accountSid, authToken, serviceSid } = getConfig();
  const to = normalizePhone(phone);
  const body = new URLSearchParams({ To: to, Channel: "sms", Locale: locale });
  const response = await fetch(`${TWILIO_VERIFY_BASE}/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: authHeader(accountSid, authToken),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!response.ok) throw new Error("Unable to send OTP. Please try again.");
  return { success: true as const, locale };
}

export async function verifyOtp(phone: string, code: string) {
  const { accountSid, authToken, serviceSid } = getConfig();
  const to = normalizePhone(phone);
  const body = new URLSearchParams({ To: to, Code: code.trim() });
  const response = await fetch(`${TWILIO_VERIFY_BASE}/Services/${serviceSid}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: authHeader(accountSid, authToken),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!response.ok) throw new Error("Unable to verify OTP. Please try again.");
  const result = await response.json() as { status?: string };
  return result.status === "approved";
}
