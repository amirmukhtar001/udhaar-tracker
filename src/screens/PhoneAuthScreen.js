import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default function PhoneAuthScreen({ navigation }) {
  const { session, sendOtp, verifyOtp, isSupabaseEnabled } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
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
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(t("common.validation"), t("auth.validation.emailRequired"));
      return;
    }

    setLoading(true);
    const { error } = await sendOtp(normalizedEmail);
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message || t("auth.error.sendOtp"));
      return;
    }

    setEmail(normalizedEmail);
    setOtpSent(true);
    Alert.alert(t("auth.otpSentTitle"), t("auth.otpSentMessage"));
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert(t("common.validation"), t("auth.validation.otpRequired"));
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, otp.trim());
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message || t("auth.error.verifyOtp"));
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 18}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t("auth.title")}</Text>
        <Text style={styles.subtitle}>
          {isSupabaseEnabled ? t("auth.subtitle") : t("auth.supabaseDisabled")}
        </Text>

        {!otpSent ? (
          <View style={styles.phoneRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.phoneInput}
              editable={!otpSent}
            />
          </View>
        ) : null}

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
            <Text style={styles.helpText}>{email}</Text>
          </>
        ) : (
          <View style={styles.bigSpacer} />
        )}

        <View style={styles.bottomArea}>
          {otpSent ? (
            <>
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
              disabled={loading || !isSupabaseEnabled || !isValidEmail(email)}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? t("common.loading") : t("auth.sendOtpButton")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 18
  },
  title: {
    color: "#1f2937",
    fontSize: 44 / 2,
    fontWeight: "700",
    marginTop: 6
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 6
  },
  phoneRow: {
    marginTop: 34,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8
  },
  phoneInput: {
    color: "#111827",
    fontSize: 17,
    paddingVertical: 0
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginTop: 30,
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
  helpText: {
    color: "#6b7280",
    fontSize: 12
  },
  bigSpacer: {
    flex: 1
  },
  bottomArea: {
    marginTop: "auto",
    paddingTop: 16
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14
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
