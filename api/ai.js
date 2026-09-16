/**
 * Yapay zekâ ucu — öğretmenin konuşan tarafı.
 *
 * GET  ?probe=1  → kurulum var mı (kimlik istemez, hiçbir şey sızdırmaz)
 * POST           → { task, payload } → { text }
 *
 * NEDEN TARAYICI DOĞRUDAN GEMINI'YE GİTMİYOR — üç sebep:
 *
 *  1. ANAHTAR. İstemciye konan bir API anahtarı herkese açıktır; sayfa
 *     kaynağına bakan biri onu alıp kendi işinde kullanır ve faturayı
 *     (ya da ücretsiz kotayı) tüketir.
 *
 *  2. YÖNERGE. Asıl güvence sistem yönergesinde: "sana verilmeyen
 *     İbranice biçimi ÜRETME". Bu yönerge istemcide dursaydı, isteği
 *     elle değiştiren biri onu çıkarabilirdi. Sunucuda kilitli.
 *
 *  3. MODEL DEĞİŞİMİ. Model adları zamanla değişiyor. Tek bir yerde
 *     durduğunda değiştirmek bir satır; istemciye dağılsaydı yayınlanmış
 *     her sürümde ayrı ayrı eskirdi.
 *
 * NEDEN DİLBİLGİSİNİ MOTOR ÜRETİYOR, MODEL DEĞİL: Çekim tabloları
 * `src/engine/` içinde kural kural üretiliyor ve yanlışsa test düşüyor.
 * Bir dil modeli ise İbranice çekimde ikna edici biçimde yanılır —
 * öğrenci de yanlış olduğunu anlayamaz, çünkü öğrenmek için oradadır.
 * Bu yüzden model KURAL SÖYLEMEZ, verilen kuralı ANLATIR.
 *
 * YAPILANDIRMA (Vercel ortam değişkeni):
 *   GEMINI_API_KEY   aistudio.google.com/apikey → ücretsiz katman
 *
 * Anahtar yoksa uç nokta ÇÖKMÜYOR, 503 ile durumu söylüyor; arayüz de
 * yapay zekâ bölümünü sessizce boş bırakmak yerine "henüz bağlı değil"
 * diyor. Sessiz boşluk, bozuk özellik demektir.
 */

/**
 * Denenecek modeller — sırayla.
 *
 * İlki ücretsiz katmanın hızlı modeli. Bir model adı kaldırılırsa
 * (Google bunu yapıyor) istek 404 döner ve sıradaki denenir; tek model
 * yazılsaydı o gün bütün yapay zekâ özellikleri sessizce ölürdü.
 */
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Modelin tek seferde üretebileceği en fazla belirteç. */
const MAX_TOKENS = 700;

/** Tek bir isteğin en fazla bekleme süresi. */
const TIMEOUT_MS = 20_000;

/* ------------------------------------------------------------------ *
 * Görevler
 * ------------------------------------------------------------------ */

/**
 * Bütün görevlerin ortak kuralları.
 *
 * Türkçe konuşuyor çünkü öğrencinin ana dili Türkçe; İbranice öğretiyor
 * ama İbranice ANLATMIYOR. A1 öğrencisine İbranice açıklama yapmak,
 * bilmediği bir şeyi bilmediği bir dille anlatmaktır.
 */
const ORTAK = `Sen Shoresh adlı İbranice öğrenme uygulamasının öğretmenisin.
Öğrencinin ana dili Türkçe; Modern İbranice (İvrit) öğreniyor.

KURALLAR — hepsi zorunlu:
1. Türkçe konuş. Kısa ve sıcak ol; öğretmen gibi, reklam gibi değil.
2. SANA VERİLMEYEN İBRANİCE BİÇİM ÜRETME. Çekim tabloları, kelimeler ve
   kalıplar sana istekle birlikte veriliyor. Verilmeyen bir biçimi
   hatırladığını sanıp yazma; onun yerine "bu biçimi burada
   gösteremiyorum, VERB sayfasından bakabilirsin" de.
3. Emin olmadığın dilbilgisi kuralını uydurma. Bilmiyorsan bilmediğini
   söyle. Öğrenciye yanlış kural öğretmek, hiç öğretmemekten kötüdür.
4. Öğrenciyi azarlama. Yanlışta "olmadı, birlikte bakalım" tonunu koru.
5. Cevabın en fazla üç kısa paragraf olsun. Madde işareti kullanacaksan
   en çok dört madde.
6. İbranice yazarken harekeli biçimi de ver (sana verildiyse).`;

const GOREVLER = {
  /** Serbest sohbet — öğrenci soru soruyor. */
  sohbet: {
    yonerge: `${ORTAK}

Şu an öğrenciyle serbest konuşuyorsun. Soruyu cevapla, sonra tek bir
kısa soruyla konuyu ilerlet. Öğrencinin seviyesi ve eksik alanları
sana veriliyor — anlatımını ona göre ayarla.`,
  },

  /** Yanlış cevabın ardından "neden yanlış". */
  aciklama: {
    yonerge: `${ORTAK}

Öğrenci bir soruyu yanlış cevapladı. Sana sorunun kendisi, öğrencinin
cevabı, doğru cevap ve ilgili dilbilgisi olgusu veriliyor.

Şunu yap: önce öğrencinin NEDEN o cevabı vermiş olabileceğini bir
cümleyle söyle (çoğu yanlış mantıklı bir yanlış anlamadan doğar), sonra
doğru kuralı açıkla, sonra aklında kalacak tek cümlelik bir ipucu ver.
"Yanlış" deyip geçme — öğrenci bir dahaki sefere aynı yere düşer.`,
  },

  /** Açık uçlu cevabı notlandırma. */
  degerlendirme: {
    yonerge: `${ORTAK}

Öğrencinin açık uçlu cevabını değerlendiriyorsun. Sana soru, beklenen
cevap ve öğrencinin cevabı veriliyor.

YALNIZCA şu biçimde geçerli JSON döndür, başka hiçbir şey yazma:
{"puan": 0-100 arası tam sayı, "not": "en fazla iki cümle geri bildirim",
 "dogru_yanlar": ["..."], "eksik_yanlar": ["..."]}

Puanlama: anlam doğruysa yazım hatası çok puan düşürmez; anlam yanlışsa
yazımın düzgün olması kurtarmaz.`,
  },
};

/* ------------------------------------------------------------------ *
 * Yardımcılar
 * ------------------------------------------------------------------ */

function config() {
  const key = process.env.GEMINI_API_KEY;
  return { key, hazir: Boolean(key) };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Basit hız sınırı — feedback.js ile aynı gerekçe.
 *
 * Amaç saldırı durdurmak değil; kazara açılan bir döngünün ücretsiz
 * kotayı bir dakikada tüketmesini engellemek.
 */
const recent = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 500) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

/**
 * Modeli çağırır; ilk çalışan model kazanır.
 *
 * Dönen değer `{ text }` ya da `{ error, detay }`. Hata gövdesi
 * kullanıcıya OLDUĞU GİBİ gösterilmiyor ama günlüğe yazılıyor: "bir
 * şeyler ters gitti" diyen bir arayüz hata ayıklanamaz hâle getirir.
 */
async function callGemini(key, systemPrompt, userText) {
  let sonHata = 'bilinmiyor';

  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: MAX_TOKENS,
          },
        }),
      });

      if (res.status === 404) {
        sonHata = `model bulunamadi: ${model}`;
        continue;
      }

      if (!res.ok) {
        const govde = await res.text();
        sonHata = `${res.status}: ${govde.slice(0, 300)}`;
        // 429 (kota) ve 4xx'te başka model denemek işe yaramaz.
        if (res.status !== 500 && res.status !== 503) break;
        continue;
      }

      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();

      if (!text) {
        sonHata = 'model bos cevap dondu';
        continue;
      }

      return { text, model };
    } catch (err) {
      sonHata = err?.name === 'AbortError' ? 'zaman asimi' : String(err).slice(0, 200);
    } finally {
      clearTimeout(timer);
    }
  }

  return { error: 'model cagrisi basarisiz', detay: sonHata };
}

/* ------------------------------------------------------------------ *
 * Uç nokta
 * ------------------------------------------------------------------ */

export default async function handler(req, res) {
  const { key, hazir } = config();

  /*
   * Kurulum yoklaması. Arayüz açılışta bunu soruyor ki, yapay zekâ
   * bağlı değilse düğmeyi TIKLANMADAN ÖNCE dürüstçe söyleyebilsin.
   * Yoklama olmasaydı öğrenci soruyu yazıp gönderdikten sonra
   * "kurulum eksik" görürdü.
   */
  if (req.method === 'GET') {
    const gelen = new URL(req.url, `https://${req.headers.host}`);
    if (gelen.searchParams.get('probe') === '1') {
      return json(res, 200, { ready: hazir, gorevler: Object.keys(GOREVLER) });
    }
    return json(res, 405, { error: 'yalnizca POST' });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'yalnizca POST' });

  if (!hazir) {
    return json(res, 503, {
      error: 'kurulum eksik',
      detay: 'GEMINI_API_KEY ortam degiskeni tanimli degil',
    });
  }

  const ip = (req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim() || 'bilinmiyor';
  if (rateLimited(ip)) return json(res, 429, { error: 'cok sik istek, biraz bekle' });

  const body = await readBody(req);
  if (!body) return json(res, 400, { error: 'gecersiz istek govdesi' });

  const task = String(body.task ?? '');
  const gorev = GOREVLER[task];
  if (!gorev) return json(res, 400, { error: 'bilinmeyen gorev', gecerli: Object.keys(GOREVLER) });

  const userText = String(body.text ?? '').trim();
  if (userText.length < 2) return json(res, 400, { error: 'bos istek' });
  if (userText.length > 6000) return json(res, 400, { error: 'istek cok uzun' });

  const sonuc = await callGemini(key, gorev.yonerge, userText);

  if (sonuc.error) {
    console.error('[ai]', task, sonuc.detay);
    return json(res, 502, sonuc);
  }

  return json(res, 200, { text: sonuc.text, model: sonuc.model });
}
