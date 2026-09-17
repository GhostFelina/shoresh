/**
 * Bayraklar — SVG, emoji DEĞİL.
 *
 * NEDEN ÇİZİLDİ: Emoji bayraklar (🇮🇱, 🇰🇷) Windows'ta ÇALIŞMIYOR.
 * Windows'un kendi yazı tipinde bayrak birleşimi yok; tarayıcı iki
 * harfi yan yana kutu olarak basıyor ve kullanıcı "IL", "KR" görüyor.
 * Kullanıcı zaten ikonlar için "emoji gibi, amatör" demişti; asıl
 * emojiyi buraya koymak o şikâyeti doğrulamak olurdu.
 *
 * Çizimler SADELEŞTİRİLMİŞ: 24×16 piksellik bir alanda gerçek armalar
 * okunmaz. Amaç tanınırlık — renk düzeni ve en belirgin öğe. Gerçeğe
 * uymayan ayrıntı eklenmiyor; sadeleştirme yanlış bilgi değildir, ama
 * uydurma arma olurdu.
 */

type FlagProps = { className?: string; title?: string };

/** Ortak çerçeve: bayrakların kenarı zeminden ayrışsın. */
function Frame({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className="size-full"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
    >
      {children}
      <rect
        x="0.25"
        y="0.25"
        width="23.5"
        height="15.5"
        rx="2"
        fill="none"
        stroke="rgb(0 0 0 / 0.25)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

const sarma = (className = 'h-4 w-6 overflow-hidden rounded-[3px] shrink-0') => className;

/** İsrail — beyaz zemin, iki mavi şerit, Davud yıldızı. */
export function FlagIL({ className, title = 'İsrail' }: FlagProps) {
  return (
    <span className={className ?? sarma()}>
      <Frame title={title}>
        <rect width="24" height="16" fill="#ffffff" />
        <rect y="1.6" width="24" height="2.2" fill="#0038b8" />
        <rect y="12.2" width="24" height="2.2" fill="#0038b8" />
        {/* İki üçgen üst üste — Davud yıldızı. */}
        <path
          d="M12 5.1l2.6 4.5h-5.2zM12 10.9l-2.6-4.5h5.2z"
          fill="none"
          stroke="#0038b8"
          strokeWidth="0.75"
        />
      </Frame>
    </span>
  );
}

/** Güney Kore — beyaz zemin, taegeuk dairesi, dört trigram. */
export function FlagKR({ className, title = 'Güney Kore' }: FlagProps) {
  return (
    <span className={className ?? sarma()}>
      <Frame title={title}>
        <rect width="24" height="16" fill="#ffffff" />
        {/* Taegeuk: üst yarı kırmızı, alt yarı mavi, aralarında S kıvrımı. */}
        <path d="M8.2 8a3.8 3.8 0 0 1 7.6 0a1.9 1.9 0 0 0-3.8 0a1.9 1.9 0 0 1-3.8 0z" fill="#cd2e3a" />
        <path d="M8.2 8a3.8 3.8 0 0 0 7.6 0a1.9 1.9 0 0 1-3.8 0a1.9 1.9 0 0 0-3.8 0z" fill="#0047a0" />
        {/* Trigramlar — dört köşede kısa çizgiler. */}
        <g fill="#111">
          <rect x="2.2" y="3.2" width="3.4" height="0.55" />
          <rect x="2.2" y="4.2" width="3.4" height="0.55" />
          <rect x="18.4" y="3.2" width="3.4" height="0.55" />
          <rect x="18.4" y="4.2" width="3.4" height="0.55" />
          <rect x="2.2" y="11.4" width="3.4" height="0.55" />
          <rect x="2.2" y="12.4" width="3.4" height="0.55" />
          <rect x="18.4" y="11.4" width="3.4" height="0.55" />
          <rect x="18.4" y="12.4" width="3.4" height="0.55" />
        </g>
      </Frame>
    </span>
  );
}

/**
 * Arapça — Arap Birliği yeşili.
 *
 * NEDEN TEK ÜLKE BAYRAĞI DEĞİL: Arapça yirmiden fazla ülkenin resmî
 * dili; birinin bayrağını seçmek ötekileri dışarıda bırakmak olurdu.
 * Bunun yerine bütün Arap bayraklarının ortak rengi olan yeşil zemin
 * ve dilin kendi harfi kullanılıyor.
 */
export function FlagAR({ className, title = 'Arapça' }: FlagProps) {
  return (
    <span className={className ?? sarma()}>
      <Frame title={title}>
        <rect width="24" height="16" fill="#0f7b3f" />
        <text
          x="12"
          y="12"
          textAnchor="middle"
          fontSize="11"
          fill="#ffffff"
          fontFamily="serif"
        >
          ع
        </text>
      </Frame>
    </span>
  );
}

/** Çin — kırmızı zemin, biri büyük beş sarı yıldız. */
export function FlagCN({ className, title = 'Çin' }: FlagProps) {
  const yildiz = (cx: number, cy: number, r: number) => {
    const noktalar: string[] = [];
    for (let i = 0; i < 10; i++) {
      const yari = i % 2 === 0 ? r : r / 2.4;
      const aci = (Math.PI / 5) * i - Math.PI / 2;
      noktalar.push(`${cx + yari * Math.cos(aci)},${cy + yari * Math.sin(aci)}`);
    }
    return noktalar.join(' ');
  };

  return (
    <span className={className ?? sarma()}>
      <Frame title={title}>
        <rect width="24" height="16" fill="#de2910" />
        <g fill="#ffde00">
          <polygon points={yildiz(5, 5, 3)} />
          <polygon points={yildiz(9.6, 2.2, 1)} />
          <polygon points={yildiz(11.4, 4.4, 1)} />
          <polygon points={yildiz(11.4, 7.2, 1)} />
          <polygon points={yildiz(9.6, 9.4, 1)} />
        </g>
      </Frame>
    </span>
  );
}

/** Dil kimliğinden bayrağa. Bilinmeyen dil için null — uydurma bayrak yok. */
export const FLAG_BY_LANGUAGE: Record<string, (p: FlagProps) => React.ReactElement> = {
  he: FlagIL,
  ko: FlagKR,
  ar: FlagAR,
  zh: FlagCN,
};
