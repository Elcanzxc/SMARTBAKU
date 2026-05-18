# 🚦 SmartBaku — Ağıllı Şəhər Nəqliyyat Platforması

Bakının ağıllı nəqliyyat idarəetmə sistemi — sürücülər və piyadalar üçün.

---

## 📋 Bu proqramı kompüterdə necə açmaq olar?

> ⚠️ **Vacib:** Aşağıdakı addımları **bir dəfə** etmək kifayətdir. Sonrakı dəfələr yalnız **6-cı addımdan** başlayırsınız.

---

### 📥 Addım 1: Docker Desktop proqramını yükləyin

Docker — bu proqramı işə salmaq üçün lazım olan **yeganə** proqramdır. Başqa heç nə lazım deyil.

1. Bu linkə daxil olun: **https://www.docker.com/products/docker-desktop/**
2. **"Download for Windows"** düyməsinə basın
3. Yüklənmiş faylı açın (`Docker Desktop Installer.exe`)
4. Quraşdırma pəncərəsində **hər şeyi olduğu kimi qoyun**, sadəcə "Next" və "Install" basın
5. Quraşdırma bitdikdə **"Close and restart"** düyməsini basın (kompüter yenidən başlayacaq)

---

### 🖥️ Addım 2: Docker Desktop-u açın

1. Kompüter yenidən açıldıqdan sonra, masaüstündə **Docker Desktop** ikonasını tapın (balina şəkli 🐳)
2. İkona **iki dəfə klikləyin**
3. Proqram açılacaq — **bir neçə dəqiqə gözləyin**
4. Aşağı sol küncəndə **yaşıl dairə** 🟢 və **"Engine running"** yazısı görünməlidir
5. Yaşıl dairəni görənə qədər **gözləyin**, tələsməyin!

> ❗ Əgər yaşıl əvəzinə **sarı** və ya **qırmızı** dairə görürsünüzsə — Docker hələ hazır deyil. 1-2 dəqiqə daha gözləyin.

---

### 📂 Addım 3: Proqram qovluğunu açın

1. Sizə göndərilmiş **zip faylını** açın (sağ klik → "Hamısını çıxar..." / "Extract All...")
2. Çıxarılmış qovluğu açın — içində `docker-compose.yml`, `README.md`, `src` qovluğu olmalıdır

---

### 💻 Addım 4: Terminalı (PowerShell) açın

Bu ən vacib addımdır. Diqqətlə oxuyun:

1. Açdığınız qovluğun **içində** (faylların olduğu yerdə) boş bir yerə **Shift + Sağ klik** edin
2. Menyudan **"Burada PowerShell pəncərəsini aç"** və ya **"Open PowerShell window here"** seçin

> 💡 **Alternativ üsul:** Qovluğun yuxarı hissəsindəki ünvan çubuğuna (address bar) klikləyin, `powershell` yazın və Enter basın.

Açılan qara/mavi pəncərə — **Terminal**dir. Buraya əmrlər yazacaqsınız.

---

### 🚀 Addım 5: Proqramı ilk dəfə işə salın

Terminalda (qara/mavi pəncərədə) bu əmri **dəqiq** kopyalayıb yapışdırın:

```
docker-compose up --build
```

Sonra **Enter** basın.

> ⏳ **İlk dəfə 5-15 dəqiqə çəkə bilər!** Narahat olmayın — proqram lazımi faylları internetdən yükləyir.
> Ekranda çoxlu yazılar axacaq — bu normaldır. **Gözləyin.**

Proqram **hazırdır**, əgər ekranda belə bir sətir görsəniz:

```
api-1  | Now listening on: http://[::]:5000
```

---

### 🌐 Addım 6: Brauzerdə açın

1. **Google Chrome** və ya **Microsoft Edge** brauzerin açın
2. Ünvan çubuğuna yazın:

```
localhost
```

3. **Enter** basın
4. 🎉 **SmartBaku açılacaq!**

İlk açılan ekranda iki seçim olacaq:
- 🚗 **"Mən Sürücüyəm"** — Sürücü rejimi
- 🚶 **"Mən Piyadayam"** — Piyada rejimi

Birini seçin və istifadə edin!

---

## 🛑 Proqramı necə dayandırmaq?

Terminal pəncərəsində (qara/mavi pəncərə) **Ctrl + C** düymələrini birlikdə basın.

Sonra yazın:
```
docker-compose down
```
Enter basın. Proqram dayanacaq.

---

## ▶️ Proqramı növbəti dəfə necə açmaq?

İlk dəfədən fərqli olaraq, artıq 5-15 dəqiqə gözləmək lazım deyil. Sadəcə:

1. **Docker Desktop** proqramını açın (yaşıl dairə 🟢 gözləyin)
2. Proqram qovluğunda **terminal açın** (Addım 4-dəki kimi)
3. Yazın:
```
docker-compose up
```
4. 30 saniyə gözləyin
5. Brauzerdə **localhost** yazın

> 💡 Diqqət: İkinci dəfə `--build` yazmağa ehtiyac yoxdur. Sadəcə `docker-compose up` kifayətdir.

---

## ❓ Problemlər və Həllər

### "Docker Desktop başlamır"
- Kompüterinizi **yenidən başladın**
- Docker Desktop-u **administrator olaraq** açın (sağ klik → "Administrator olaraq çalıştır")

### Brauzerdə "localhost" açılmır
- Docker Desktop-da yaşıl dairə 🟢 olduğuna əmin olun
- Terminalda `docker-compose up` əmrinin hələ işlədiyinə əmin olun (pəncərəni bağlamamalısınız!)
- 1-2 dəqiqə daha gözləyin — bəzən proqram yavaş başlayır

### Ekranda xəta yazısı görünür
- Terminalda **Ctrl + C** basın
- Sonra yazın: `docker-compose down`
- Sonra yenidən yazın: `docker-compose up --build`

### "Kompüterdə yer yoxdur" xətası
- Docker təxminən **3-4 GB** yer tələb edir
- Kompüterdə ən azı **5 GB** boş yer olmalıdır

---

## 📱 Telefonda necə istifadə etmək?

Əgər kompüter və telefon **eyni Wi-Fi şəbəkəsindədirsə**:

1. Kompüterdə **Windows + R** basın, `cmd` yazın, Enter basın
2. Açılan pəncərədə `ipconfig` yazın, Enter basın
3. **IPv4 Address** yazısının qarşısındakı rəqəmi tapın (məsələn: `192.168.0.105`)
4. Telefonun brauzerində yazın: `http://192.168.0.105`
5. SmartBaku telefonda açılacaq! 📱

---

## 🚗 Proqramda nələr var?

| Funksiya | Təsvir |
|---|---|
| 🗺️ **Canlı Xəritə** | Bakının interaktiv xəritəsi, maşınlar və tıxac |
| 🧭 **Ağıllı Naviqasiya** | A nöqtəsindən B nöqtəsinə ən yaxşı marşrut |
| 🌊 **Yaşıl Dalğa** | Hansı sürətlə getsəniz qırmızıya düşməyəcəksiniz |
| 🚨 **Rəqəmsal Siren** | Təcili yardım simulyasiyası (səs + işıq) |
| ⚠️ **Dinamik Qaydalar** | Müvəqqəti sürət həddləri və radar xəbərdarlıqları |
| 🚶 **Piyada Keçidi** | Bir düymə ilə yaşıl işıq tələb edin |
| 🏅 **Eko-Ballar** | Yaxşı sürücülük üçün mükafatlar |
| 🎁 **Kupanlar** | Bravo, SOCAR, Bolt endirimlər |

---

**Hazırladı:** SmartBaku Komandası 🇦🇿
