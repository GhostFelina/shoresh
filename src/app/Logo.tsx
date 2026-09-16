/**
 * Ürün işareti.
 *
 * NEDEN DEĞİŞTİ: Eski işaret ש harfiydi — üç çatalı kökü anlatıyordu ve
 * İbranice tek dil olduğu sürece doğruydu. Uygulama çok dilli olunca
 * ürünün simgesi öğretilen dillerden birinin harfi olarak kaldı;
 * Korece eklendiğinde simge yanlış söz veriyor olacaktı.
 *
 * YENİ İŞARET NE ANLATIYOR: Açık bir yay (C) içinde tek bir çekirdek ve
 * ondan dışarı açılan üç kol. Uygulamanın tek iddiası bu: tek bir
 * çekirdek kuraldan bütün biçimler ÜRETİLİR, biçimler tek tek
 * ezberlenmez. Yay kapanmıyor — dil listesi de kapalı değil.
 *
 * NEDEN AYRI DOSYA: Kabuğun içindeyken üst bant, kenar çubuğu ve
 * çekmece onu içeriden çağırıyordu; künye ya da karşılama ekranı gibi
 * kabuk dışı bir yer kullanmak isteseydi Shell'i içe aktarması
 * gerekirdi.
 *
 * NEDEN GRADYAN DEĞİŞKENLERLE: Renkler paletten geliyor. Sabit renk
 * yazılsaydı kullanıcı paleti değiştirdiğinde tek başına eski palette
 * kalan şey logo olurdu.
 */

let sayac = 0;

export function Logo({ className = 'size-8' }: { className?: string }) {
  /*
   * Gradyan kimliği benzersiz olmalı: aynı sayfada logo üç kez
   * basılıyor (kenar çubuğu, çekmece, üst bant) ve yinelenen `id`
   * olduğunda tarayıcı ilk tanımı kullanır — kendi başına bozulmaz ama
   * biri kaldırıldığında ötekilerin rengi sessizce gider.
   */
  const gid = `cx-mark-${(sayac += 1)}`;

  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-text)" />
          <stop offset="1" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Açık yay: sağa doğru açık bırakıldı — liste kapalı değil. */}
        <path d="M45 17a19 19 0 1 0 0 30" />
        {/* Çekirdekten açılan üç kol. */}
        <path d="M30 32h9" />
        <path d="M39 32l10-9" />
        <path d="M39 32l10 9" />
      </g>

      {/* Çekirdek: kolların çıktığı tek nokta. */}
      <circle cx="29" cy="32" r="4.5" fill={`url(#${gid})`} />
    </svg>
  );
}

export default Logo;
