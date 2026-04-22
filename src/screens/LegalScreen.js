import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { APP_META } from "../config/appMeta";

export default function LegalScreen() {
  const { t } = useLanguage();

  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (_error) {
      Alert.alert(t("common.error"), t("legal.openUrlError"));
    }
  };

  const openEmail = async () => {
    const subject = encodeURIComponent("Smart Udhaar Support");
    const body = encodeURIComponent("Hello, I need help with Smart Udhaar.");
    const mailto = `mailto:${APP_META.supportEmail}?subject=${subject}&body=${body}`;
    await openUrl(mailto);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t("legal.title")}</Text>
      <Text style={styles.bodyText}>{t("legal.accountNotice")}</Text>
      <Text style={styles.bodyText}>{t("legal.dataNotice")}</Text>
      <Text style={styles.bodyText}>{t("legal.notificationNotice")}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t("legal.supportEmailLabel")}</Text>
        <Text style={styles.value}>{APP_META.supportEmail}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => openUrl(APP_META.privacyPolicyUrl)}>
        <Text style={styles.primaryButtonText}>{t("legal.privacyPolicyButton")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={openEmail}>
        <Text style={styles.secondaryButtonText}>{t("legal.contactSupportButton")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10
  },
  bodyText: {
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginTop: 8,
    marginBottom: 14
  },
  label: {
    color: "#6b7280",
    fontSize: 12
  },
  value: {
    color: "#111827",
    fontWeight: "600",
    marginTop: 4
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
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: "#1f2937",
    fontWeight: "700"
  }
});
