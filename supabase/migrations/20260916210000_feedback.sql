-- Geri bildirim tablosu.
--
-- NEDEN SUNUCUDA: Bildirimler tarayıcıda dursaydı kullanıcı onları bize
-- ulaştırmak için dosya göndermek zorunda kalırdı; "bildir" düğmesinin
-- anlamı da kalmazdı. Tek amacı ulaşmak olan bir veri, ulaşabildiği
-- yerde durmalı.
--
-- GÜVENLİK KARARI — satır düzeyi güvenlik AÇIK, HİÇ politika YOK:
-- Bu, tabloya anon (publishable) anahtarla erişilemeyeceği anlamına
-- geliyor; yalnızca gizli (service_role) anahtar okuyup yazabilir.
-- Gizli anahtar da yalnızca sunucu tarafında, Vercel ortam değişkeninde
-- duruyor ve tarayıcıya hiç gitmiyor.
--
-- Alternatif "anon insert'e izin ver" politikası daha kolay olurdu ama
-- o zaman adresi bilen herkes tabloya yazabilirdi; üstelik okuma izni
-- de verilseydi bütün bildirimler herkese açık olurdu.

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- Ne tür bir bildirim: hata, istek, soru, öneri.
  kind        text not null check (kind in ('hata', 'istek', 'soru', 'oneri')),

  -- Kullanıcının yazdığı metin. Boş gönderilemez, uzunluk sınırlı:
  -- sınırsız metin hem veritabanını hem gelen kutusunu kullanılamaz kılar.
  message     text not null check (char_length(trim(message)) between 3 and 4000),

  -- İsteğe bağlı iletişim bilgisi. Zorunlu DEĞİL: zorunlu olsaydı
  -- adını vermek istemeyen biri hiç bildirmezdi.
  contact     text check (contact is null or char_length(contact) <= 200),

  -- Bağlam: bildirimin hangi sayfadan, hangi sürümden geldiği.
  -- Bunlar olmadan "çalışmıyor" diyen bir bildirim araştırılamaz.
  page        text,
  app_version text,
  user_agent  text,

  -- Okundu işareti — gelen kutusu bunu kullanıyor.
  handled     boolean not null default false
);

-- Gelen kutusu her zaman "en yeni önce" sıralıyor.
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

-- Okunmamışları hızlı saymak için.
create index if not exists feedback_handled_idx
  on public.feedback (handled)
  where handled = false;

alter table public.feedback enable row level security;

-- Politika YOK: bu bilinçli. Yukarıdaki açıklamaya bakın.
-- Yalnızca service_role anahtarı satır düzeyi güvenliği aşar.

comment on table public.feedback is
  'Shoresh uygulamasindan gelen kullanici bildirimleri. RLS acik, politika yok: yalnizca service_role erisir.';
