# SStore — Ekran Görüntüsü Stüdyosu

App Store & Google Play için modern, editoryal tasarımlı **mağaza görselleri** üreten bağımsız web aracı. Gerçek cihaz ekran görüntülerini alır; başlık, telefon çerçevesi, arka plan ve yüzen öğelerle profesyonel görsellere dönüştürür. Tamamen Türkçe arayüz.

![3 adım: Ekranlar → Stil → Görseller](public/mockup.png)

## Çalıştırma

```bash
npm install       # ilk kurulum
npm run dev       # http://localhost:5173
```

Diğer:

```bash
npm run build     # üretim derlemesi (tip kontrolü dahil)
npm run preview   # derlemeyi önizle
```

## Akış

1. **Ekranlar** — Mağazada gösterilecek ekran görüntülerini seç, sırala, metinlerini düzenle. Kendi PNG'lerini yükleyebilirsin. (Gömülü hazır set: İhaleTakip)
2. **Stil** — Nasıl bir görsel istediğini belirle: cihazlar (iPhone / Android / Feature Graphic), tema, font, vurgu rengi, telefon eğimi (0 = düz), gölge, yüzen kartlar, doku. Canlı önizleme.
3. **Görseller** — Üretilen görseller cihaza göre gruplu. Bir görsele tıkla → büyür, incelenir, boyut boyut indirilir. Tek tek / toptan yeniden üret. Klasör seçip topluca kaydet.

## Özellikler

- **iPhone** (6.9″–6.1″), **Android** (Google Play FHD/QHD) ve **Feature Graphic** (1024×500) çıktıları — aynı slaytlardan uyumlu üretim.
- **Telefon eğimi ayarlanabilir** (varsayılan düz), tema/font/renk/kompozisyon tam kontrol.
- **Logo yok** — slaytlara uygulama ikonu basılmaz (elle eklenir).
- **Tam Türkçe** tipografi (`latin-ext`): ş, ğ, İ, â sorunsuz.
- **Klasöre kaydet** (File System Access API — Chrome/Edge) ya da tek tek indir.
- Kendi ekran görüntülerini yükle → her uygulama için kullanılabilir.

## Teknik

Vite + React + TypeScript SPA. Export `html-to-image` ile. Mimari ve katkı notları için `CLAUDE.md`.
