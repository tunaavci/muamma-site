## Render.com Kurulum Rehberi - Muamma

Bu rehber, felsefi soru platformunuzu Render.com üzerinde nasıl yayınlayacağınızı açıklar.

### 1. Veritabanı Kurulumu
1. [Render.com](https://render.com) adresine giriş yapın.
2. **New** > **PostgreSQL** butonuna tıklayın.
3. İsim olarak `muamma-db` yazın.
4. **Create Database** butonuna tıklayın.
5. Veritabanı oluşturulduğunda, **Internal Database URL** veya **External Database URL** bilgisini kopyalayın.

### 2. Web Servis Kurulumu
1. **New** > **Web Service** butonuna tıklayın.
2. GitHub deponuzu (repository) bağlayın.
3. Ayarları şu şekilde yapın:
   - **Name**: `muamma`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. **Advanced** bölümüne tıklayarak şu Ortam Değişkenlerini (Environment Variables) ekleyin:
   - `DATABASE_URL`: (1. adımda kopyaladığınız veritabanı URL'sini buraya yapıştırın)
   - `SESSION_SECRET`: (Rastgele, uzun bir metin girin)
   - `NODE_ENV`: `production`

### 3. Yayına Alma
1. **Create Web Service** butonuna tıklayın.
2. Render uygulamayı derleyecek ve yayına alacaktır.
3. Siteniz `https://muamma.onrender.com` gibi bir adreste yayına girecektir.

*Not: Ücretsiz plan kullanıldığı için siteye bir süre kimse girmezse uyku moduna geçer ve ilk girişte açılması yaklaşık 30 saniye sürebilir.*
