import { Fragment, type ReactElement } from 'react';

/**
 * Karışık yönlü metin — Türkçe cümle içindeki İbranice parçaları izole eder.
 *
 * SORUN: Uygulamadaki açıklamaların çoğu iki yönlüdür:
 *   «Ardından MASTAR gelir: אֲנִי צָרִיךְ לָלֶכֶת "gitmem gerek".»
 * Tarayıcı bunu tek bir soldan sağa paragraf sayarsa İbranice parçanın
 * kendi içindeki sıralama doğru çizilir ama parçanın SINIRLARINDAKİ
 * noktalama yanlış tarafa kayar: tırnak, iki nokta ve nokta İbranice
 * öbeğin ters ucuna yapışır. Uzun notlarda cümle okunamaz hâle gelir.
 *
 * ÇÖZÜM: Her İbranice harf dizisi ayrı bir `<bdi>` içine alınır. `bdi`
 * tam olarak bunun için vardır — içindeki metnin yön hesabını çevresinden
 * yalıtır. Böylece Türkçe soldan sağa akmaya devam eder, İbranice öbek
 * kendi içinde sağdan sola çizilir ve noktalama yerinde kalır.
 *
 * NEDEN ELLE SARMIYORUZ: Notlar veri dosyalarında düz metin olarak
 * yazılıyor ve yüzlerce tane. Her birini elle işaretlemek hem unutulur
 * hem de veriyi biçimlendirmeye bulaştırır. Ayrım burada, tek yerde,
 * otomatik yapılıyor.
 */

/**
 * İbranice öbek: bir ya da daha çok İbranice sözcük, aralarındaki
 * boşluklarla birlikte.
 *
 * DİKKAT — boşluk yalnızca İKİ İbranice sözcük ARASINDA yutulur, öbeğin
 * sonunda asla. İlk sürümde desen sondaki boşluğu da içine alıyordu ve
 * ardından gelen Türkçe kelime İbranice öbeğe yapışıyordu:
 *   "ilk harf הdüşer"      (doğrusu: "ilk harf ה düşer")
 *   "fiil פ״יgibi çekilir"  (doğrusu: "fiil פ״י gibi çekilir")
 * Bu yüzden desen "sözcük (boşluk sözcük)*" biçiminde yazıldı; sonu her
 * zaman bir harfe denk gelir.
 */
const HEBREW_RUN =
  /([֐-׿יִ-ﭏ][֐-׿יִ-ﭏ־'"״׳]*(?: +[֐-׿יִ-ﭏ][֐-׿יִ-ﭏ־'"״׳]*)*)/g;

export function MixedText({
  children,
  className,
}: {
  children: string | undefined | null;
  className?: string;
}): ReactElement | null {
  if (!children) return null;

  const parts = children.split(HEBREW_RUN);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        // Bölme sonucunda yakalanan gruplar tek indekslere düşer.
        const isHebrew = i % 2 === 1;
        if (!isHebrew) return <Fragment key={i}>{part}</Fragment>;
        return (
          <bdi key={i} className="he" dir="rtl">
            {part}
          </bdi>
        );
      })}
    </span>
  );
}

/** Metinde hiç İbranice harf var mı? Sarmalamaya değer mi diye bakar. */
export const hasHebrew = (text: string): boolean => /[֐-׿]/.test(text);
