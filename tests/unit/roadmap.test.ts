/**
 * Yol haritası ile kayıt defteri tutarlı mı.
 *
 * NEDEN VAR: Karşılama sayfası iki kaynaktan besleniyor — kurulu
 * diller kayıt defterinden, "yakında" olanlar yol haritasından.
 * Korece kurulduğu gün onu yol haritasından silmek unutulursa sayfa
 * aynı dili hem "Hazır" hem "Yakında" diye iki kez gösterir. Bu
 * gözle fark edilmesi zor, çünkü kartlar ızgarada yan yana durur ve
 * ikisi de doğru görünür.
 */
import { describe, expect, it } from 'vitest';
import { languages } from '@/core/language';
import { PLANNED_LANGUAGES } from '@/core/roadmap';
import { FLAG_BY_LANGUAGE } from '@/app/Flags';

describe('yol haritası', () => {
  it('kurulu bir dil aynı anda "yakında" görünmüyor', () => {
    const kurulu = new Set(languages().map((d) => d.id));
    const cakisan = PLANNED_LANGUAGES.filter((d) => kurulu.has(d.id)).map((d) => d.id);
    expect(cakisan, `hem kurulu hem yakında: ${cakisan.join(', ')}`).toEqual([]);
  });

  it('kimlikler benzersiz', () => {
    const idler = PLANNED_LANGUAGES.map((d) => d.id);
    expect(new Set(idler).size, 'yol haritasında yinelenen kimlik var').toBe(idler.length);
  });

  it('her planlanan dilin adı, yazısı ve gerekçesi dolu', () => {
    for (const d of PLANNED_LANGUAGES) {
      expect(d.nativeName.trim(), `${d.id}: kendi yazısıyla adı yok`).not.toBe('');
      expect(d.englishName.trim(), `${d.id}: İngilizce adı yok`).not.toBe('');
      expect(d.name.trim(), `${d.id}: Türkçe adı yok`).not.toBe('');
      expect(d.blurb.length, `${d.id}: neden öğrenileceği yazılmamış`).toBeGreaterThan(20);
      /*
       * `engine` alanı zorunlu: "aynı uygulama başka kelimelerle"
       * demek istemiyoruz. Her dilin kendi üretici çekirdeği
       * yazılmadan o dil yol haritasına giremez.
       */
      expect(d.engine.length, `${d.id}: üretici çekirdeği yazılmamış`).toBeGreaterThan(20);
    }
  });

  it('kimlikler adres öneki olarak kullanılabilir', () => {
    // Adreste görünecekler: boşluk, büyük harf ya da eğik çizgi olamaz.
    for (const d of PLANNED_LANGUAGES) {
      expect(d.id, `${d.id}: adres öneki olamaz`).toMatch(/^[a-z]{2,8}$/);
    }
  });

  it('görünen her dilin bayrağı var', () => {
    /*
     * Bayrağı olmayan bir dil kartı, ötekilerin yanında eksik
     * görünürdü. Uydurma bayrak çizmek yerine test kuruluyor: yeni
     * dil eklerken bayrağı da eklenecek.
     */
    const gorunen = [...languages().map((d) => d.id), ...PLANNED_LANGUAGES.map((d) => d.id)];
    const eksik = gorunen.filter((id) => !FLAG_BY_LANGUAGE[id]);
    expect(eksik, `bayrağı olmayan dil: ${eksik.join(', ')}`).toEqual([]);
  });
});
