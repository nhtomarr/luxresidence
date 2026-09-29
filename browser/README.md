# Təchizat — brauzer serveri
JavaScript ilə yüklənən saytları (Tvim, Elem və s.) açıb HTML qaytarır. ScrapingBee-nin əvəzidir.

**Render.com ilə:** New → Web Service → bu repo → Root Directory: `browser` → Runtime: Docker → Instance: Starter →
Environment: `TOKEN` = uzun təsadüfi şifrə. Deploy bitəndə URL-i (https://…onrender.com) və TOKEN-i sistemə əlavə edin.

Sorğu: `POST /` başlıq `x-token: TOKEN`, gövdə `{"url":"https://…","wait":5000}` → HTML.
