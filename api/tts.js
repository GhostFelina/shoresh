/**
 * Seslendirme vekili (proxy).
 *
 * NEDEN VAR — ölçülmüş gerçek:
 * Seslendirme uç noktası SUNUCUDAN çağrıldığında 200 ve geçerli MP3
 * döndürüyor, ama TARAYICIDAN çağrıldığında 404 veriyor. Google, Referer
 * ve Origin başlığı taşıyan istekleri reddediyor. Bu yüzden istemciden
 * doğrudan çağıran her deneme sessizce başarısız oldu: `<audio>` öğesi
 * 404 gövdesini ses sanıp "MEDIA_ELEMENT_ERROR: Format error" verdi.
 *
 * Çözüm isteği sunucudan yapmak. Böylece:
 *  - Referer/Origin yok → uç nokta 200 dönüyor
 *  - Yanıt kendi alan adımızdan geliyor → CORS sorunu ortadan kalkıyor
 *  - Tarayıcı ve service worker sıradan bir medya dosyası görüyor
 *
 * Aynı metin her zaman aynı sesi verdiği için yanıt uzun süre
 * önbelleklenebilir; ikinci istek artık bize bile gelmez.
 */

/** Tek seferde seslendirilecek en uzun metin. */
const MAX_LENGTH = 200;

/** İbranice harfler, boşluk ve temel noktalama dışında bir şey geçmesin. */
const ALLOWED = /^[֐-׿\s.,!?'"()־׳״-]+$/;

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const text = (url.searchParams.get('q') ?? '').trim();
  const slow = url.searchParams.get('slow') === '1';

  if (!text) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'q parametresi gerekli' }));
    return;
  }

  if (text.length > MAX_LENGTH) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: `metin ${MAX_LENGTH} karakteri aşamaz` }));
    return;
  }

  /*
   * Girdi kısıtı bir güvenlik önlemi: bu uç nokta olduğu gibi bırakılsaydı
   * herhangi bir metni seslendiren açık bir kapı olurdu. Yalnızca İbranice
   * metin kabul etmek, uygulamanın kendi içeriği dışındaki kullanımı kapatıyor.
   */
  if (!ALLOWED.test(text)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'yalnizca Ibranice metin seslendirilir' }));
    return;
  }

  const upstream =
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&client=tw-ob&tl=iw&ttsspeed=${slow ? '0.4' : '1'}` +
    `&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(upstream, {
      headers: {
        /*
         * Tarayıcı benzeri bir User-Agent şart: uç nokta bunu taşımayan
         * isteklere de olumsuz yanıt verebiliyor. Referer ve Origin ise
         * BİLEREK gönderilmiyor — 404'ün sebebi tam olarak onlardı.
         */
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'he,en;q=0.8',
      },
    });

    if (!response.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({ error: 'seslendirme servisine ulasilamadi', status: response.status }),
      );
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', String(buffer.length));
    // Metin → ses eşlemesi değişmez; bir yıl önbelleklenebilir.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(buffer);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'seslendirme basarisiz', detail: String(err).slice(0, 200) }));
  }
}
