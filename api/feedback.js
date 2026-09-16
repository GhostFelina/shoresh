/**
 * Geri bildirim ucu.
 *
 * POST  → yeni bildirim yazar (herkes)
 * GET   → bildirimleri listeler (yalnızca yönetici parolasıyla)
 * PATCH → bildirimi okundu işaretler (yalnızca yönetici parolasıyla)
 *
 * NEDEN TARAYICI DOĞRUDAN SUPABASE'E GİTMİYOR:
 *  1. Gizli anahtar tarayıcıya hiç gitmiyor. Tablo satır düzeyi
 *     güvenlikle kapalı ve politikası yok; yalnızca gizli anahtar
 *     erişebiliyor. Anahtar istemciye konsaydı herkes bütün bildirimleri
 *     okuyabilirdi.
 *  2. Doğrulama ve hız sınırı burada yapılabiliyor. İstemciye bırakılan
 *     doğrulama, istemciyi atlayan biri için hiç yoktur.
 *  3. Aynı yol seslendirme vekilinde de kullanıldı ve orada işe yaradı.
 *
 * YAPILANDIRMA (Vercel ortam değişkenleri):
 *   SUPABASE_URL          proje adresi
 *   SUPABASE_SECRET_KEY   gizli (service_role) anahtar — TARAYICIYA GİTMEZ
 *   FEEDBACK_ADMIN_KEY    gelen kutusu parolası
 *
 * Değişkenler eksikse uç nokta ÇÖKMÜYOR, 503 ile durumu söylüyor —
 * "bir şeyler ters gitti" demek, kurulum eksiğini gizlemekten iyidir.
 */

const KINDS = new Set(['hata', 'istek', 'soru', 'oneri']);
const MAX_MESSAGE = 4000;
const MAX_CONTACT = 200;

/**
 * Basit hız sınırı.
 *
 * Bellekte tutuluyor ve sunucu örneği yenilenince sıfırlanıyor — bu
 * bilinçli bir ödün: gerçek bir hız sınırı için paylaşımlı bir sayaç
 * gerekir ve bu uygulamanın tek kullanıcısı için orantısız. Amaç
 * kötü niyetli bir saldırıyı durdurmak değil, kazara açılan bir
 * döngünün tabloyu doldurmasını engellemek.
 */
const recent = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);

  // Harita sınırsız büyümesin.
  if (recent.size > 500) {
    for (const [k, v] of recent) {
      if (v.every((t) => now - t >= WINDOW_MS)) recent.delete(k);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const admin = process.env.FEEDBACK_ADMIN_KEY;
  return { url, key, admin, hazir: Boolean(url && key) };
}

/** Supabase REST çağrısı — gizli anahtarla, yalnızca sunucudan. */
async function supabase(path, init = {}) {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  return res;
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

export default async function handler(req, res) {
  const { url, admin, hazir } = config();

  /*
   * Kurulum yoklamasi — kimlik istemez, hicbir sey sizdirmaz.
   *
   * Form acilirken bunu soruyor. Olmasaydi kullanici uzun bir bildirim
   * yazip Gonder'e bastiktan SONRA "kurulum eksik" gorurdu; yazdigi sey
   * de bosa giderdi. Zamanini almadan once soylemek gerekiyor.
   */
  if (req.method === 'GET') {
    const gelen = new URL(req.url, `https://${req.headers.host}`);
    if (gelen.searchParams.get('probe') === '1') {
      return json(res, 200, { ready: hazir, inbox: Boolean(admin) });
    }
  }

  if (!hazir) {
    return json(res, 503, {
      error: 'kurulum eksik',
      detay: 'SUPABASE_URL ve SUPABASE_SECRET_KEY ortam degiskenleri tanimli degil',
    });
  }

  /* ---------------- Yazma ---------------- */
  if (req.method === 'POST') {
    const ip =
      (req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim() || 'bilinmiyor';
    if (rateLimited(ip)) {
      return json(res, 429, { error: 'cok sik gonderim, biraz bekle' });
    }

    const body = await readBody(req);
    if (!body) return json(res, 400, { error: 'gecersiz istek govdesi' });

    const kind = String(body.kind ?? '').trim();
    const message = String(body.message ?? '').trim();
    const contact = String(body.contact ?? '').trim();

    if (!KINDS.has(kind)) return json(res, 400, { error: 'gecersiz tur' });
    if (message.length < 3) return json(res, 400, { error: 'mesaj cok kisa' });
    if (message.length > MAX_MESSAGE) return json(res, 400, { error: 'mesaj cok uzun' });
    if (contact.length > MAX_CONTACT) return json(res, 400, { error: 'iletisim bilgisi cok uzun' });

    const kayit = {
      kind,
      message,
      contact: contact || null,
      page: String(body.page ?? '').slice(0, 200) || null,
      app_version: String(body.appVersion ?? '').slice(0, 40) || null,
      user_agent: String(req.headers['user-agent'] ?? '').slice(0, 400) || null,
    };

    try {
      const r = await supabase('feedback', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(kayit),
      });
      if (!r.ok) {
        const metin = await r.text();
        return json(res, 502, { error: 'kaydedilemedi', detay: metin.slice(0, 300) });
      }
      return json(res, 201, { ok: true });
    } catch (err) {
      return json(res, 502, { error: 'kaydedilemedi', detay: String(err).slice(0, 200) });
    }
  }

  /* ---------------- Okuma (yönetici) ---------------- */
  if (req.method === 'GET' || req.method === 'PATCH') {
    const gelen = new URL(req.url, `https://${req.headers.host}`);
    const parola = gelen.searchParams.get('key') ?? req.headers['x-admin-key'];

    /*
     * Parola tanımlı değilse gelen kutusu KAPALI kalıyor — boş bir
     * parolayla açılsaydı adresi bilen herkes bütün bildirimleri
     * okuyabilirdi.
     */
    if (!admin) return json(res, 503, { error: 'gelen kutusu parolasi tanimli degil' });
    if (parola !== admin) return json(res, 401, { error: 'parola yanlis' });

    if (req.method === 'GET') {
      try {
        const r = await supabase('feedback?select=*&order=created_at.desc&limit=200');
        if (!r.ok) {
          return json(res, 502, { error: 'okunamadi', detay: (await r.text()).slice(0, 300) });
        }
        return json(res, 200, { items: await r.json() });
      } catch (err) {
        return json(res, 502, { error: 'okunamadi', detay: String(err).slice(0, 200) });
      }
    }

    // PATCH — okundu işareti
    const body = await readBody(req);
    const id = String(body?.id ?? '');
    if (!id) return json(res, 400, { error: 'id gerekli' });
    try {
      const r = await supabase(`feedback?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ handled: body.handled !== false }),
      });
      if (!r.ok) {
        return json(res, 502, { error: 'guncellenemedi', detay: (await r.text()).slice(0, 300) });
      }
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, 502, { error: 'guncellenemedi', detay: String(err).slice(0, 200) });
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  return json(res, 405, { error: 'desteklenmeyen yontem', adres: url ? undefined : undefined });
}
