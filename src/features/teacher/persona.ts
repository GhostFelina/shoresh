/**
 * Öğretmenin sesi — sınıfa girdiğinde seni karşılayan cümle.
 *
 * NEDEN VAR: "Öğretmen modu" başlığı altında bir ders listesi, öğretmen
 * değil katalogdur. Sınıf duygusunu yaratan şey, karşındakinin seni
 * HATIRLAMASI: dün geldiğini, on gündür gelmediğini, henüz hiç
 * tanışmadığınızı bilmesi.
 *
 * NEDEN RASTGELE CÜMLE DEĞİL: Rastgele seçilen bir "motive edici söz",
 * ikinci görüşte sahte durur. Buradaki her cümlenin bir KOŞULU var;
 * cümle değişiyorsa durumun kendisi değişmiştir.
 *
 * NEDEN YAPAY ZEKÂ YAZMIYOR: Bu cümle sayfa açılır açılmaz, ağ
 * beklemeden görünmeli. Bir isteğin dönmesini bekleyen karşılama,
 * karşılama değildir.
 */

export type ClassroomTone = 'tanisma' | 'ilk-ders' | 'devam' | 'seri' | 'geri-donus';

export interface ClassroomMood {
  /** "Günaydın" / "Merhaba" / "İyi akşamlar". */
  greeting: string;
  /** Öğretmenin bugünkü cümlesi. */
  line: string;
  tone: ClassroomTone;
}

export interface MoodInput {
  /** 0–23. */
  hour: number;
  /** Arka arkaya çalışılan gün. */
  streak: number;
  /** Son çalışmanın üstünden geçen gün; hiç çalışılmadıysa null. */
  daysSinceLast: number | null;
  /** Seviye tespit sınavı yapılmış mı. */
  placed: boolean;
}

function greetingFor(hour: number): string {
  if (hour < 6) return 'Gece çalışıyorsun';
  if (hour < 11) return 'Günaydın';
  if (hour < 18) return 'Merhaba';
  return 'İyi akşamlar';
}

export function classroomMood(input: MoodInput): ClassroomMood {
  const greeting = greetingFor(input.hour);

  // Sıra ÖNEMLİ: önce tanışma, sonra dönüş, sonra seri. Ters sırada
  // olsaydı on gün sonra dönen bir öğrenciye "serin sürüyor" denirdi.
  if (!input.placed) {
    return {
      greeting,
      tone: 'tanisma',
      line: 'Henüz tanışmadık. Kısa bir sınavla nerede olduğunu ölçelim; gerisini ben ayarlarım.',
    };
  }

  if (input.daysSinceLast === null) {
    return {
      greeting,
      tone: 'ilk-ders',
      line: 'Seviyeni biliyorum, sıra ilk derste. Bugünkü programı senin için kurdum.',
    };
  }

  if (input.daysSinceLast >= 7) {
    return {
      greeting,
      tone: 'geri-donus',
      line: `${input.daysSinceLast} gündür yoktun. Sorun değil — programı hafiflettim, tekrarla başlıyoruz.`,
    };
  }

  if (input.streak >= 3) {
    return {
      greeting,
      tone: 'seri',
      line: `${input.streak} gündür aksatmadın. Bu aralıkta öğrenilen kalıcı olur; bugün de oturalım.`,
    };
  }

  return {
    greeting,
    tone: 'devam',
    line: 'Kaldığımız yerden devam ediyoruz. Bugünün programı hazır.',
  };
}

/**
 * Öğretmenin cevabın ardından söylediği kısa söz.
 *
 * Oyunlardaki kutlamadan farklı: burada amaç puan değil, ÖĞRETMEN
 * tepkisi. Doğruda abartmıyor, yanlışta suçlamıyor — ikisi de öğrenciyi
 * ekrandan kaçırır.
 */
export function reactionLine(correct: boolean, streakInLesson: number): string {
  if (correct) {
    if (streakInLesson >= 4) return 'Arka arkaya dördüncü. Bu konu oturdu.';
    if (streakInLesson >= 2) return 'Yine doğru.';
    return 'Doğru.';
  }
  return 'Olmadı — birlikte bakalım.';
}
