# Baş Ofis — mobil tətbiq (Android)

Tətbiq `https://luxresidence.az/ofis` sistemini native qabıqda açır (Capacitor 6).
APK faylı GitHub Actions ilə avtomatik yığılır: **Actions → "Android tətbiqi" → son işləmə → Artifacts → bas-ofis-apk**.

- Paket adı (Play Store üçün dəyişməz): `az.rahmangroup.basofis`
- İcazələr: kamera (QR), yer (ofis yoxlaması), bildirişlər
- Bildirişlər (FCM): `google-services.json` GitHub secret `GOOGLE_SERVICES_JSON` kimi əlavə olunanda aktivləşir.
