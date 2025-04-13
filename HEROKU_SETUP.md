# 🚀 Prosta instrukcja wdrożenia aplikacji Gmail-Todoist na Heroku

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na platformie Heroku, która jest znacznie prostsza w użyciu niż Google Cloud Platform.

## 🌟 Dlaczego Heroku?

- **Bardzo prosty proces wdrażania** - wystarczy kilka kliknięć
- **Darmowy plan** - dla małego ruchu
- **Brak potrzeby konfiguracji serwerów** - wszystko działa automatycznie
- **Łatwe zarządzanie zmiennymi środowiskowymi** - bez skomplikowanych konfiguracji

## 🛠️ Co będziesz potrzebować

1. **Konto Heroku** - możesz założyć darmowe konto na [heroku.com](https://heroku.com)
2. **Konto Gmail** - to konto, z którego będą pobierane wiadomości
3. **Konto Todoist** - tu będą tworzone zadania
4. **Konto Anthropic** - do analizy treści e-maili (możesz założyć darmowe konto)

## 🔑 Krok 1: Uzyskaj klucze API

### Klucz API Anthropic (Claude)

1. Wejdź na stronę [console.anthropic.com](https://console.anthropic.com/)
2. Zarejestruj się lub zaloguj
3. Przejdź do sekcji "API Keys"
4. Kliknij "Create API Key"
5. Zapisz wygenerowany klucz w bezpiecznym miejscu

### Token API Todoist

1. Zaloguj się do [todoist.com](https://todoist.com/)
2. Kliknij swoje inicjały w prawym górnym rogu
3. Wybierz "Ustawienia"
4. Przejdź do zakładki "Integracje"
5. Przewiń w dół do sekcji "API"
6. Skopiuj swój token API i zapisz go w bezpiecznym miejscu

## 🔐 Krok 2: Skonfiguruj poświadczenia OAuth dla Gmail

1. Wejdź na stronę [console.cloud.google.com](https://console.cloud.google.com/)
2. Utwórz nowy projekt (np. "Gmail-Todoist")
3. Włącz Gmail API:
   - W menu bocznym wybierz "APIs & Services" > "Library"
   - Wyszukaj "Gmail API" i kliknij na wynik
   - Kliknij "Enable"
4. Utwórz poświadczenia OAuth:
   - W menu bocznym wybierz "APIs & Services" > "Credentials"
   - Kliknij "Create Credentials" > "OAuth client ID"
   - Wybierz typ aplikacji "Web application"
   - Nadaj nazwę (np. "Gmail-Todoist App")
   - W sekcji "Authorized redirect URIs" dodaj: `https://twoja-aplikacja.herokuapp.com/oauth2callback`
     (zastąp "twoja-aplikacja" nazwą, którą wybierzesz dla swojej aplikacji na Heroku)
   - Kliknij "Create"
   - Pobierz plik JSON z poświadczeniami (przycisk "Download JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

## 🚀 Krok 3: Wdrożenie na Heroku

### Opcja A: Wdrożenie za pomocą przycisku (najłatwiejsza)

1. Kliknij przycisk "Deploy to Heroku" poniżej:
   
   [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/twoje-repo/gmail-todoist-app)

2. Zaloguj się do swojego konta Heroku
3. Nadaj nazwę swojej aplikacji (np. "gmail-todoist-app")
4. Uzupełnij wymagane zmienne środowiskowe:
   - `ANTHROPIC_API_KEY`: Twój klucz API Anthropic
   - `TODOIST_API_KEY`: Twój token API Todoist
5. Kliknij "Deploy App"
6. Po zakończeniu wdrażania, kliknij "View" aby przejść do aplikacji

### Opcja B: Wdrożenie ręczne (dla zaawansowanych)

1. Zainstaluj [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) na swoim komputerze
2. Otwórz terminal/wiersz poleceń i zaloguj się do Heroku:
   ```
   heroku login
   ```
3. Utwórz nową aplikację Heroku:
   ```
   heroku create twoja-aplikacja
   ```
4. Dodaj zmienne środowiskowe:
   ```
   heroku config:set ANTHROPIC_API_KEY=twoj_klucz_anthropic
   heroku config:set TODOIST_API_KEY=twoj_token_todoist
   heroku config:set POLLING_INTERVAL=300
   ```
5. Dodaj dodatek Heroku Scheduler (do cyklicznego uruchamiania aplikacji):
   ```
   heroku addons:create scheduler:standard
   ```
6. Wdróż aplikację:
   ```
   git push heroku main
   ```
7. Skonfiguruj Heroku Scheduler:
   - Wejdź na stronę [dashboard.heroku.com](https://dashboard.heroku.com)
   - Wybierz swoją aplikację
   - Przejdź do zakładki "Resources"
   - Kliknij na "Heroku Scheduler"
   - Kliknij "Add Job"
   - Ustaw komendę: `npm start`
   - Ustaw częstotliwość: "Every 10 minutes" (lub inną według potrzeb)
   - Kliknij "Save"

## 🔐 Krok 4: Dodaj plik credentials.json

1. Wejdź na stronę [dashboard.heroku.com](https://dashboard.heroku.com)
2. Wybierz swoją aplikację
3. Przejdź do zakładki "Settings"
4. Przewiń w dół do sekcji "Config Vars"
5. Kliknij "Reveal Config Vars"
6. Dodaj nową zmienną:
   - Klucz: `GMAIL_CREDENTIALS`
   - Wartość: skopiuj i wklej całą zawartość pliku `credentials.json`
7. Kliknij "Add"

## ✅ Krok 5: Autoryzacja Gmail

Przy pierwszym uruchomieniu aplikacja poprosi o autoryzację dostępu do Twojego konta Gmail:

1. Wejdź na stronę swojej aplikacji: `https://twoja-aplikacja.herokuapp.com`
2. Kliknij przycisk "Autoryzuj Gmail"
3. Zaloguj się na swoje konto Gmail
4. Zatwierdź dostęp dla aplikacji
5. Zostaniesz przekierowany z powrotem do aplikacji

## 🧪 Krok 6: Testowanie

Aby przetestować działanie aplikacji:

1. Oznacz gwiazdką dowolną wiadomość w swojej skrzynce Gmail
2. Poczekaj kilka minut (aplikacja sprawdza nowe wiadomości co 5-10 minut)
3. Sprawdź swoje konto Todoist - powinno pojawić się nowe zadanie!

## ❓ Rozwiązywanie problemów

### Aplikacja nie tworzy zadań

1. Sprawdź, czy wiadomość jest poprawnie oznaczona gwiazdką
2. Upewnij się, że wszystkie klucze API są poprawne
3. Sprawdź logi aplikacji w Heroku:
   - Wejdź na stronę [dashboard.heroku.com](https://dashboard.heroku.com)
   - Wybierz swoją aplikację
   - Przejdź do zakładki "More" > "View logs"

### Problem z autoryzacją Gmail

1. Upewnij się, że URI przekierowania w konsoli Google Cloud jest poprawny
2. Spróbuj ponownie autoryzować aplikację

## 💰 Koszty

- **Heroku**: Darmowy plan dla małego ruchu (do 1000 godzin miesięcznie)
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

Typowy koszt dla użytkownika przetwarzającego 100 e-maili miesięcznie: około $3 (tylko za API Claude).

## 📞 Wsparcie

Jeśli potrzebujesz pomocy, skontaktuj się z autorem aplikacji lub skorzystaj z dokumentacji online.
