import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function normalizePhone(raw) {
  const cleaned = String(raw || "").replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  return `+${cleaned}`;
}

export default function PhoneAuthScreen({ navigation }) {
  const { session, sendOtp, verifyOtp, isSupabaseEnabled } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }]
      });
    }
  }, [session, navigation]);

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      Alert.alert(t("common.validation"), t("auth.validation.phoneRequired"));
      return;
    }

    setLoading(true);
    const { error } = await sendOtp(normalizedPhone);
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message || t("auth.error.sendOtp"));
      return;
    }

    setPhone(normalizedPhone);
    setOtpSent(true);
    Alert.alert(t("auth.otpSentTitle"), t("auth.otpSentMessage"));
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert(t("common.validation"), t("auth.validation.otpRequired"));
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otp.trim());
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message || t("auth.error.verifyOtp"));
      return;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("auth.title")}</Text>
        <Text style={styles.subtitle}>
          {isSupabaseEnabled ? t("auth.subtitle") : t("auth.supabaseDisabled")}
        </Text>

        <Text style={styles.label}>{t("auth.phoneLabel")}</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t("auth.phonePlaceholder")}
          keyboardType="phone-pad"
          autoCapitalize="none"
          style={styles.input}
          editable={!otpSent}
        />

        {otpSent ? (
          <>
            <Text style={styles.label}>{t("auth.otpLabel")}</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder={t("auth.otpPlaceholder")}
              keyboardType="number-pad"
              autoCapitalize="none"
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.primaryButton, loading ? styles.disabled : null]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? t("common.loading") : t("auth.verifyButton")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setOtpSent(false);
                setOtp("");
              }}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>{t("auth.changeNumber")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, loading ? styles.disabled : null]}
            onPress={handleSendOtp}
            disabled={loading || !isSupabaseEnabled}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? t("common.loading") : t("auth.sendOtpButton")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    justifyContent: "center"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16
  },
  title: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700"
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 14
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700"
  },
  secondaryButton: {
    marginTop: 10,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontWeight: "600"
  },
  disabled: {
    opacity: 0.55
  }
});
