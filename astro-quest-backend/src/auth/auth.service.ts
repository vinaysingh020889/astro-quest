// Auth service placeholder
type OtpRecord = {
  otp: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

export function generateOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  return otp;
}

export function verifyOtp(email: string, otp: string) {
  const record = otpStore.get(email);

  if (!record) return false;
  if (record.expiresAt < Date.now()) return false;
  if (record.otp !== otp) return false;

  otpStore.delete(email); // one-time use
  return true;
}
