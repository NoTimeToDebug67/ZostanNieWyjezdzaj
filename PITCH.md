# PITCH – Tymbark Hub / "Zostań, Nie Wyjeżdżaj"

## Struktura prezentacji (5 min)

---

## 1. WSTĘP / ZACZEPKA (30 sek)

**Otwarcie:**
> "Co roku z małopolskich wsi wyjeżdża tysiące młodych ludzi. Nie dlatego, że nie kochają swoich miejscowości – ale dlatego, że czują się odcięci od tego co się dzieje, nie mają wpływu, nie widzą sensu zostawania. My to zmieniamy."

**Nazwa:** Tymbark Hub (repo: ZostanNieWyjezdzaj)
**Misja:** Cyfrowe narzędzie, które sprawia, że życie w małej społeczności jest aktywne, połączone i nagradzane.

---

## 2. PROBLEM (45 sek)

**Kluczowe punkty do powiedzenia:**
- Mieszkańcy małych gmin nie wiedzą co się dzieje w ich sołectwie (komunikaty giną na tablicach ogłoszeń)
- Brak narzędzia do szybkiego zgłaszania usterek (dziury, latarnie, drzewa) – ludzie rezygnują bo "i tak nikt nie naprawi"
- Młodzi nie czują się częścią społeczności – nie ma platformy do organizowania się
- Gminy nie mają feedbacku od mieszkańców w czasie rzeczywistym
- Istniejące rozwiązania (Facebook grupy, BIP) są chaotyczne, nieczytelne, nie mobilne

---

## 3. ROZWIĄZANIE (60 sek) ⚠️ KLUCZOWE

**Tymbark Hub to mobilna aplikacja, która:**

1. **Informuje** – slider komunikatów gminy + "Sołtys AI" (inteligentny asystent który analizuje Twoje dane i podpowiada co jest dla Ciebie ważne)
2. **Łączy** – wydarzenia z kalendarzem, zapisy, grupy tworzone automatycznie po uczestnictwie (np. "byliśmy razem na meczu → tworzymy grupę → planujemy następny")
3. **Angażuje** – zgłaszanie usterek w 3 kliknięcia (GPS + zdjęcie + głos), widoczne dla całej społeczności
4. **Nagradza** – system punktów za aktywność, wymienialny na zniżki u lokalnych partnerów (piekarnia, restauracja, sklep)
5. **Mapuje** – interaktywna mapa Małopolski z GeoJSON, wydarzenia i miejsca na mapie

**Zdanie podsumowujące:**
> "To nie jest kolejna apka do newsów. To cyfrowy ekosystem, który sprawia że OPŁACA SIĘ być aktywnym mieszkańcem."

---

## 4. DEMO / DZIAŁANIE PRODUKTU (90 sek)

**Scenariusz demo (pokaż na żywo):**

1. **Ekran Start** → powitanie, komunikat gminy (slider), Sołtys AI podpowiada "zbliża się wydarzenie"
2. **Kliknij przycisk akcji** → Sołtys AI przenosi do społeczności
3. **Społeczność** → kalendarz z numerkami eventów, filtry kategorii, kliknij wydarzenie → popup z "Zapisz się"
4. **FAB (plus)** → ring menu: Zgłoś usterkę → formularz z GPS, zdjęciem, nagraniem głosowym, ważnością
5. **Mapa** → prawdziwa mapa Małopolski (Leaflet + GeoJSON powiatów), pinezki wydarzeń
6. **Nagrody** → punkty za aktywność, sklep ze zniżkami do kupienia za punkty
7. **Grupy** → po zapisaniu na wydarzenie można utworzyć grupę z chatem

---

## 5. WALIDACJA / WIELKOŚĆ RYNKU (30 sek)

- **2477 gmin w Polsce**, z czego ~1500 to gminy wiejskie i miejsko-wiejskie
- Małopolska: 182 gminy, ~3.4 mln mieszkańców
- Docelowo: każda gmina wiejska w Polsce może mieć swoją instancję
- Potencjał: partnerstwa z samorządami (budżet na cyfryzację z KPO)

---

## 6. INNOWACYJNOŚĆ / PRZEWAGA KONKURENCYJNA (30 sek)

**Co nas wyróżnia:**
- **Sołtys AI** – rule-based engine który analizuje aktywność użytkownika i proaktywnie podpowiada (nie czeka na pytanie)
- **Grywalizacja z realną wartością** – punkty za aktywność obywatelską wymieniane na zniżki u LOKALNYCH partnerów (nie korporacji)
- **Grupy z wydarzeń** – organiczne budowanie społeczności (nie "dołącz do grupy" ale "byliście razem → macie grupę")
- **One-tap reporting** – GPS + głos + zdjęcie, bez pisania, dostępne dla każdej grupy wiekowej

**Konkurencja:** Facebook grupy (chaos), Alertownik (tylko usterki), Luma (tylko eventy). My łączymy WSZYSTKO w jednym, z gamifikacją.

---

## 7. ZESPÓŁ (20 sek)

- Podkreślić: frontend (React, Tailwind, Framer Motion), backend (Supabase), UX/UI design, AI engine
- Wspomnieć o podziale ról i efektywnej współpracy podczas hackathonu
- Kompetencje: fullstack, design, product thinking

---

## 8. CALL TO ACTION (15 sek)

> "Tymbark Hub to dowód, że technologia może zatrzymać ludzi w ich miejscowościach – nie przez przymus, ale przez pokazanie im, że warto tu być. Dziękujemy."

---

## CHECKLISTA – CO MAMY ZREALIZOWANE ✅

| Funkcja | Status | Punkty oceny |
|---------|--------|--------------|
| Działający prototyp (React + Vite) | ✅ | Zespół i realizacja |
| Interaktywna mapa Małopolski (Leaflet + GeoJSON) | ✅ | Innowacyjność, Trafność |
| System logowania / użytkowników | ✅ | Realizacja |
| Sołtys AI (rule-based assistant engine) | ✅ | Innowacyjność |
| Zgłaszanie usterek (GPS + zdjęcie + głos + ważność) | ✅ | Trafność, Użyteczność |
| Kalendarz wydarzeń z zapisami | ✅ | Trafność |
| Grupy z czatem (tworzone po uczestnictwie) | ✅ | Innowacyjność |
| System punktów + nagrody/zniżki | ✅ | Innowacyjność, Wpływ |
| Dodawanie wydarzeń lokalnych | ✅ | Użyteczność |
| Zgłoszenia społeczności (widoczne dla wszystkich) | ✅ | Wpływ społeczny |
| Komunikaty gminy (slider) | ✅ | Trafność |
| Supabase backend (opcjonalny, z fallback na localStorage) | ✅ | Realizacja |
| Responsywny mobile-first design | ✅ | Realizacja |
| Ring Menu (FAB z animacjami) | ✅ | UX |

---

## CO KONIECZNIE POWIEDZIEĆ / ZAZNACZYĆ:

### Dla "Trafność i wartość rozwiązania" (max 10 pkt):
- ✅ Problem jest REALNY – odpływ młodych z gmin wiejskich
- ✅ Rozwiązanie jest ADEKWATNE – nie wymyślamy problemu, odpowiadamy na konkretne braki
- ✅ WPŁYW SPOŁECZNY – budowanie kapitału społecznego, aktywizacja obywatelska
- ✅ UŻYTECZNOŚĆ – każda grupa wiekowa (duże fonty, głos zamiast pisania, prosty UX)

### Dla "Innowacyjność" (max 10 pkt):
- ✅ Sołtys AI – proaktywny asystent (nie chatbot czekający na pytanie)
- ✅ Grywalizacja obywatelska z lokalnymi partnerami
- ✅ Organiczne grupy (z wydarzeń, nie odgórnie)
- ✅ Stack: React 18, Framer Motion, Leaflet, Supabase, Tailwind
- ✅ Wyróżnienie: ŻADNA istniejąca apka nie łączy tych elementów dla gmin wiejskich

### Dla "Zespół i realizacja" (max 10 pkt):
- ✅ Działający prototyp (nie mockup, nie Figma – DZIAŁAJĄCY KOD)
- ✅ Czysty, modularny kod (komponenty, context, utils)
- ✅ Backend gotowy (Supabase z fallback)
- ✅ Pitch musi być ENERGICZNY i KONKRETNY – nie czytać z kartki

---

## BŁĘDY DO UNIKANIA:
- ❌ Nie mówić "to jest jak Facebook ale lepszy" – mówić "to jest narzędzie którego Facebook NIE DAJE"
- ❌ Nie tłumaczyć kodu – pokazać EFEKT
- ❌ Nie przepraszać za braki – mówić co JEST
- ❌ Nie mówić "moglibyśmy dodać..." – mówić "mamy X, a w roadmapie jest Y"
