import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLanguage } from "../context/LanguageContext";

const LANGUAGE_OPTIONS = [
  { code: "roman_urdu", labelKey: "lang.roman_urdu" },
  { code: "urdu", labelKey: "lang.urdu" },
  { code: "english", labelKey: "lang.english" },
  { code: "sindhi", labelKey: "lang.sindhi" },
  { code: "arabic", labelKey: "lang.arabic" }
];

export default function LanguageSelectScreen({ navigation }) {
  const { setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguageCode] = useState("roman_urdu");

  const handleContinue = async () => {
    await setLanguage(selectedLanguage);
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }]
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t("lang.welcome")}</Text>
        <Text style={styles.subtitle}>{t("lang.select")}</Text>

        {LANGUAGE_OPTIONS.map((language) => {
          const isSelected = selectedLanguage === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.languageCard, isSelected ? styles.languageCardSelected : null]}
              onPress={() => setSelectedLanguageCode(language.code)}
            >
              <Text style={styles.languageLabel}>{t(language.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleContinue}>
        <Text style={styles.nextButtonText}>{t("common.next")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 18
  },
  content: {
    paddingBottom: 20
  },
  title: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12
  },
  subtitle: {
    color: "#374151",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 16
  },
  languageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12
  },
  languageCardSelected: {
    borderColor: "#16a34a",
    borderWidth: 2
  },
  languageLabel: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 31 / 2
  },
  nextButton: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  }
});
