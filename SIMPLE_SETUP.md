# 📧 Prosta instrukcja uruchomienia aplikacji Gmail-Todoist

Ta instrukcja przeprowadzi Cię krok po kroku przez proces konfiguracji i uruchomienia aplikacji, która **automatycznie tworzy zadania w Todoist** na podstawie oznaczonych gwiazdką wiadomości w Gmailu. Instrukcja jest napisana w prosty sposób, nawet jeśli nie masz doświadczenia technicznego.

## 🛠️ Co będziesz potrzebować

![Wymagania](https://example.com/requirements.png)

1. **Konto Gmail** - to konto, z którego będą pobierane wiadomości
2. **Konto Todoist** - tu będą tworzone zadania
3. **Konto Anthropic** - do analizy treści e-maili (możesz założyć darmowe konto)
4. **Konto Google Cloud** - do uruchomienia aplikacji w chmurze (możesz założyć darmowe konto)

## 🔑 Krok 1: Uzyskaj klucze API

### Klucz API Anthropic (Claude)

![Anthropic Console](https://example.com/anthropic.png)

1. Wejdź na stronę [console.anthropic.com](https://console.anthropic.com/)
2. Zarejestruj się lub zaloguj
3. Przejdź do sekcji "API Keys"
4. Kliknij "Create API Key"
5. Zapisz wygenerowany klucz w bezpiecznym miejscu (np. w notatniku)

### Token API Todoist

![Todoist Settings](https://example.com/todoist.png)

1. Zaloguj się do [todoist.com](https://todoist.com/)
2. Kliknij swoje inicjały w prawym górnym rogu
3. Wybierz "Ustawienia"
4. Przejdź do zakładki "Integracje"
5. Przewiń w dół do sekcji "API"
6. Skopiuj swój token API i zapisz go w bezpiecznym miejscu

## ☁️ Krok 2: Skonfiguruj projekt Google Cloud

![Google Cloud Console](https://example.com/google-cloud.png)

1. Wejdź na stronę [console.cloud.google.com](https://console.cloud.google.com/)
2. Utwórz nowy projekt (np. "Gmail-Todoist")
3. Włącz Gmail API:
   - W menu bocznym wybierz "APIs & Services" > "Library"
   - Wyszukaj "Gmail API" i kliknij na wynik
   - Kliknij "Enable"
4. Utwórz poświadczenia OAuth:
   - W menu bocznym wybierz "APIs & Services" > "Credentials"
   - Kliknij "Create Credentials" > "OAuth client ID"
   - Wybierz typ aplikacji "Desktop app"
   - Nadaj nazwę (np. "Gmail-Todoist App")
   - Kliknij "Create"
   - Pobierz plik JSON z poświadczeniami (przycisk "Download JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

## 🚀 Krok 3: Wdrożenie aplikacji (bez potrzeby własnego serwera!)

Najłatwiejszym sposobem uruchomienia aplikacji jest skorzystanie z usługi Google Cloud Run, która jest **darmowa** dla małego ruchu i nie wymaga zarządzania serwerem.

### Opcja A: Wdrożenie za pomocą przycisku (najłatwiejsza)

1. Kliknij przycisk "Deploy to Cloud Run" poniżej:
   
   [![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

2. Zaloguj się do swojego konta Google Cloud
3. Wybierz swój projekt
4. Uzupełnij wymagane zmienne środowiskowe:
   - `ANTHROPIC_API_KEY`: Twój klucz API Anthropic
   - `TODOIST_API_KEY`: Twój token API Todoist
5. Kliknij "Deploy"

### Opcja B: Wdrożenie ręczne (dla zaawansowanych)

Jeśli wolisz wdrożyć aplikację ręcznie:

1. Zainstaluj [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) na swoim komputerze
2. Otwórz terminal/wiersz poleceń i zaloguj się do Google Cloud:
   ```
   gcloud auth login
   ```
3. Ustaw swój projekt jako domyślny:
   ```
   gcloud config set project NAZWA_TWOJEGO_PROJEKTU
   ```
4. Pobierz kod aplikacji z repozytorium GitHub:
   ```
   git clone https://github.com/twoje-repo/gmail-todoist-app.git
   cd gmail-todoist-app
   ```
5. Utwórz plik `.env` na podstawie `.env.example` i uzupełnij swoje klucze API
6. Umieść plik `credentials.json` w głównym katalogu aplikacji
7. Zbuduj i wdróż aplikację za pomocą jednej komendy:
   ```
   gcloud run deploy gmail-todoist --source . --platform managed --region europe-west1 --allow-unauthenticated
   ```
8. Postępuj zgodnie z instrukcjami w terminalu

## 🔐 Krok 4: Autoryzacja Gmail

Przy pierwszym uruchomieniu aplikacja poprosi o autoryzację dostępu do Twojego konta Gmail:

![Gmail Authorization](https://example.com/gmail-auth.png)

1. W logach aplikacji (dostępnych w Google Cloud Console) znajdziesz link do autoryzacji
2. Otwórz link w przeglądarce
3. Zaloguj się na swoje konto Gmail
4. Zatwierdź dostęp dla aplikacji (pojawi się ostrzeżenie, że aplikacja nie jest zweryfikowana - to normalne, ponieważ to Twoja prywatna aplikacja)
5. Skopiuj kod autoryzacyjny
6. Wklej kod w odpowiednie miejsce w aplikacji (jeśli wymagane)

## ✅ Krok 5: Testowanie

Aby przetestować działanie aplikacji:

![Testing](https://example.com/testing.png)

1. Oznacz gwiazdką dowolną wiadomość w swojej skrzynce Gmail
2. Poczekaj kilka minut (aplikacja sprawdza nowe wiadomości co 5 minut)
3. Sprawdź swoje konto Todoist - powinno pojawić się nowe zadanie!

## ❓ Rozwiązywanie problemów

### Aplikacja nie tworzy zadań

1. Sprawdź, czy wiadomość jest poprawnie oznaczona gwiazdką
2. Upewnij się, że wszystkie klucze API są poprawne
3. Sprawdź logi aplikacji w Google Cloud Console

### Problem z autoryzacją Gmail

1. Usuń plik `token.json` (jeśli istnieje)
2. Uruchom aplikację ponownie
3. Przejdź przez proces autoryzacji jeszcze raz

### Jak sprawdzić logi aplikacji?

Jeśli napotkasz problemy, sprawdź logi aplikacji w Google Cloud Console:

1. Wejdź na [console.cloud.google.com](https://console.cloud.google.com/)
2. Przejdź do "Cloud Run" w menu bocznym
3. Kliknij na swoją usługę "gmail-todoist"
4. Przejdź do zakładki "Logs"

## ⚙️ Dostosowywanie aplikacji

Możesz dostosować działanie aplikacji, edytując zmienne środowiskowe w Google Cloud Console:

- `POLLING_INTERVAL` - jak często aplikacja sprawdza nowe e-maile (w sekundach, domyślnie 300 = 5 minut)
- `ANTHROPIC_MODEL` - model Claude do użycia (domyślnie "claude-3-sonnet-20240229")
- `ANTHROPIC_TEMPERATURE` - kreatywność odpowiedzi Claude (0.0-1.0, domyślnie 0.7)

## 💰 Koszty

- **Google Cloud Run**: Darmowa warstwa dla małego ruchu (do 2 milionów wywołań miesięcznie)
- **Secret Manager**: Darmowa warstwa dla podstawowego użycia
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

Typowy koszt dla użytkownika przetwarzającego 100 e-maili miesięcznie: około $3.

## 📞 Wsparcie

Jeśli potrzebujesz pomocy, skontaktuj się z autorem aplikacji lub skorzystaj z dokumentacji online.
