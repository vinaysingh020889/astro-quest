import Toast from 'react-native-toast-message';
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

// ⚠️ USE MAC IP, NOT localhost
const API_BASE = "http://192.168.1.7:5050";

/* 🔹 helper functions (ONLY ADDED, nothing removed) */
const showSuccess = (title: string, message: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
  });
};

const showError = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'top',
  });
};

/* 🔹 INPUT VALIDATION (ONLY ADDED) */
const validateEmailOrMobile = (value: string): string | null => {
  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    if (trimmed.length !== 10) {
      return "Please enter a valid Phone Number";
    }
    return null;
  }

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(trimmed)) {
    return "Please enter a valid Gmail";
  }

  return null;
};

/* 🔹 CUSTOM TOAST UI (ONLY ADDED) */
const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={styles.successToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastText}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={styles.errorToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastText}>{text2}</Text>
    </View>
  ),
};

export default function LoginScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 TEMP OTP DISPLAY (FOR TESTING ONLY)
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const sendOtp = async () => {
    if (!identifier.trim()) {
      showError("Enter email or mobile number");
      return;
    }

    const validationError = validateEmailOrMobile(identifier);
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP failed");

      setOtpSent(true);
      setDebugOtp(data.otp?.toString() || null); // 👈 TEMP OTP POP
      showSuccess("OTP Sent", "Please check your email");

    } catch (err: any) {
      showError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      showError("Enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      showSuccess("Login Success 🎉", "Welcome to Astro-Quest");
      router.replace("/(tabs)");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Enter the cosmos ✨</Text>

        <TextInput
          placeholder="Email or Phone Number"
          placeholderTextColor="#BFA5FF"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          style={styles.input}
        />

        {debugOtp && otpSent && (
          <View style={styles.debugOtpBox}>
            <Text style={styles.debugOtpTitle}>DEBUG OTP</Text>
            <Text style={styles.debugOtpValue}>{debugOtp}</Text>
          </View>
        )}

        {otpSent && (
          <TextInput
            placeholder="Enter OTP"
            placeholderTextColor="#BFA5FF"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            style={styles.input}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={otpSent ? verifyOtp : sendOtp}
        >
          <Text style={styles.buttonText}>
            {otpSent ? "Verify OTP" : "Send OTP"}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast config={toastConfig} />
    </View>
  );
}

// 🎨 FINAL COSMIC STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#160021",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#2A044A",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 22,
    shadowColor: "#7A2BFF",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFD84D",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#E0C9FF",
    textAlign: "center",
    marginBottom: 26,
  },

  input: {
    backgroundColor: "#3A0B63",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 14,
  },

  button: {
    marginTop: 18,
    backgroundColor: "#4B00B5",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  successToast: {
    backgroundColor: '#0A1AFF',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
  },
  errorToast: {
    backgroundColor: '#FF3B3B',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
  },
  toastTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  toastText: {
    color: '#E0E7FF',
    fontSize: 13,
    marginTop: 4,
  },

  // 🔐 TEMP OTP BOX
  debugOtpBox: {
    backgroundColor: "#0A1AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  debugOtpTitle: {
    color: "#E0E7FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  debugOtpValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    marginTop: 4,
  },
});
