# FightClub Manager  
### System informatyczny do zarządzania klubem sportów walki

Projekt stanowi część **pracy magisterskiej** realizowanej na kierunku informatycznym.  
Celem systemu jest wsparcie zarządzania klubem sportów walki poprzez cyfryzację procesów
związanych z grafikiem zajęć, zapisami użytkowników, pracą trenerów oraz analizą danych
zarządczych.

---

## 1. Cel projektu

Głównym celem projektu było zaprojektowanie i implementacja **kompletnego systemu
informatycznego** wspierającego funkcjonowanie klubu sportowego, który:

- porządkuje proces zapisów na zajęcia,
- umożliwia efektywne zarządzanie grafikiem,
- wspiera trenerów w prowadzeniu zajęć i ewidencji obecności,
- dostarcza administracji **mierzalnych danych** do podejmowania decyzji.

System został zaprojektowany jako aplikacja webowa typu **client–server**,
z wyraźnym podziałem odpowiedzialności pomiędzy frontend i backend.

---

## 2. Zakres funkcjonalny systemu

### 2.1 Użytkownik (Client)
- przegląd harmonogramu zajęć,
- zapisy i wypisy na zajęcia zgodnie z obowiązującymi regułami,
- podgląd własnych zapisów i historii uczestnictwa.

### 2.2 Trener
- podgląd prowadzonych zajęć,
- tworzenie zajęć w oparciu o zdefiniowaną ofertę klubu,
- zarządzanie listą obecności,
- dostęp do raportów dotyczących prowadzonych zajęć.

### 2.3 Administrator
- zarządzanie użytkownikami i trenerami,
- definiowanie oferty klubu (szablony zajęć),
- konfiguracja reguł funkcjonowania klubu,
- dostęp do raportów zarządczych obejmujących cały klub.

---

## 3. Raporty zarządcze

System udostępnia administratorowi raporty w ujęciu tygodniowym, obejmujące m.in.:

- liczbę przeprowadzonych zajęć,
- łączną liczbę godzin treningowych,
- poziom obłożenia zajęć,
- frekwencję uczestników,
- analizę danych według dni tygodnia i typów zajęć,
- identyfikację zajęć o najwyższym i najniższym obłożeniu.

Raporty mają charakter **operacyjno-decyzyjny** i nie wymagają zaawansowanej konfiguracji.

---

## 4. Architektura systemu

System został zaprojektowany zgodnie z architekturą **client–server**.

```
/client   – warstwa prezentacji (frontend)
/server   – warstwa logiki biznesowej i dostępu do danych (backend)
```

### 4.1 Frontend
- React + TypeScript
- Vite
- Material UI
- TanStack Query
- routing oparty o role użytkowników

### 4.2 Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (autoryzacja)
- kontrola dostępu oparta o role (RBAC)
- warstwowy podział: routes / controllers / services / models

---

## 5. Role i uprawnienia

| Rola | Zakres odpowiedzialności |
|----|-------------------------|
| user | zapisy na zajęcia |
| trainer | zajęcia, obecności, raporty |
| admin | pełne zarządzanie systemem |

System zapewnia separację dostępu do danych oraz funkcji zgodnie z rolą użytkownika.

---

## 6. Reguły funkcjonowania klubu

Administrator może konfigurować globalne reguły, m.in.:

- maksymalną liczbę zapisów użytkownika w tygodniu,
- czas graniczny zapisu na zajęcia,
- czas graniczny wypisu z zajęć.

Reguły te są **egzekwowane po stronie backendu**, co zapewnia spójność działania systemu.

---

## 7. Uruchomienie systemu

### 7.1 Środowisko lokalne
Backend:
```
cd server
npm install
npm run dev
```

Frontend:
```
cd client
npm install
npm run dev
```

### 7.2 Docker
Projekt wspiera uruchomienie w kontenerach:
```
docker-compose up --build
```

---

## 8. Status realizacji

- system w pełni funkcjonalny (MVP),
- kompletna obsługa ról użytkowników,
- wdrożone raporty zarządcze,
- przygotowana architektura do dalszej rozbudowy.

---

## 9. Charakter pracy

Projekt został wykonany jako **część pracy magisterskiej** i ma charakter
edukacyjno-badawczy. Może stanowić podstawę do dalszych prac rozwojowych,
takich jak integracja płatności, system pakietów czy powiadomienia.

---

## 10. Licencja

Projekt edukacyjny – przeznaczony do użytku niekomercyjnego.
