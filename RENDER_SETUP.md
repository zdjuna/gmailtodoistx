# 🚀 Prosta instrukcja wdrożenia aplikacji Gmail-Todoist na platformie Render

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na platformie Render, która oferuje prosty interfejs graficzny i integrację z GitHub.

## 🌟 Dlaczego Render?

- **Bardzo prosty proces wdrażania** - wystarczy kilka kliknięć
- **Darmowy plan** - dla małego ruchu
- **Integracja z GitHub** - automatyczne wdrażanie po zmianach w repozytorium
- **Łatwe zarządzanie zmiennymi środowiskowymi** - bez skomplikowanych konfiguracji

## 🛠️ Co będziesz potrzebować

1. **Konto GitHub** - do przechowywania kodu aplikacji
2. **Konto Render** - możesz założyć darmowe konto na [render.com](https://render.com)
3. **Konto Gmail** - to konto, z którego będą pobierane wiadomości
4. **Konto Todoist** - tu będą tworzone zadania
5. **Konto Anthropic** - do analizy treści e-maili (możesz założyć darmowe konto)

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
   - W sekcji "Authorized redirect URIs" dodaj: `https://twoja-aplikacja.onrender.com/oauth2callback`
     (zastąp "twoja-aplikacja" nazwą, którą wybierzesz dla swojej aplikacji na Render)
   - Kliknij "Create"
   - Pobierz plik JSON z poświadczeniami (przycisk "Download JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

## 📦 Krok 3: Przygotowanie repozytorium GitHub

### Opcja A: Użyj gotowego repozytorium

1. Wejdź na stronę [github.com/zdjuna/gmail-todoist-app](https://github.com/zdjuna/gmail-todoist-app)
2. Kliknij przycisk "Fork" w prawym górnym rogu
3. Wybierz swoje konto GitHub jako miejsce docelowe forka
4. Poczekaj, aż proces się zakończy

### Opcja B: Utwórz własne repozytorium

1. Zaloguj się do swojego konta GitHub
2. Kliknij przycisk "+" w prawym górnym rogu i wybierz "New repository"
3. Nadaj nazwę repozytorium (np. "gmail-todoist-app")
4. Wybierz opcję "Public"
5. Kliknij "Create repository"
6. Postępuj zgodnie z instrukcjami, aby przesłać pliki aplikacji do repozytorium:
   - Rozpakuj plik ZIP z aplikacją na swoim komputerze
   - Otwórz terminal/wiersz poleceń
   - Przejdź do katalogu z rozpakowaną aplikacją
   - Wykonaj następujące komendy:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/TWOJA-NAZWA-UŻYTKOWNIKA/gmail-todoist-app.git
     git push -u origin main
     ```

## 🚀 Krok 4: Wdrożenie na Render

1. Zaloguj się do [dashboard.render.com](https://dashboard.render.com/)
2. Kliknij "New" > "Web Service"
3. Wybierz opcję "Connect a GitHub repository"
4. Wybierz swoje repozytorium "gmail-todoist-app"
5. Nadaj nazwę usłudze (np. "gmail-todoist-app")
6. Ustaw następujące parametry:
   - Environment: Node
   - Region: wybierz najbliższy region
   - Branch: main
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
7. W sekcji "Environment Variables", dodaj następujące zmienne:
   - `ANTHROPIC_API_KEY`: Twój klucz API Anthropic
   - `TODOIST_API_KEY`: Twój token API Todoist
   - `POLLING_INTERVAL`: 300 (lub inna wartość w sekundach)
   - `NODE_ENV`: production
8. Kliknij "Create Web Service"

## 🔒 Krok 5: Dodaj plik credentials.json

Ponieważ plik `credentials.json` zawiera poufne informacje, najlepiej dodać go jako zmienną środowiskową:

1. Otwórz plik `credentials.json` w edytorze tekstu
2. Skopiuj całą zawartość pliku
3. W dashboardzie Render, przejdź do swojej usługi
4. Kliknij zakładkę "Environment"
5. Dodaj nową zmienną:
   - Key: `GMAIL_CREDENTIALS`
   - Value: wklej zawartość pliku `credentials.json`
6. Kliknij "Save Changes"

## ✅ Krok 6: Autoryzacja Gmail

Przy pierwszym uruchomieniu aplikacja poprosi o autoryzację dostępu do Twojego konta Gmail:

1. Po zakończeniu wdrażania, kliknij URL aplikacji, aby otworzyć ją w przeglądarce
2. Kliknij przycisk "Autoryzuj Gmail"
3. Zaloguj się na swoje konto Gmail
4. Zatwierdź dostęp dla aplikacji
5. Zostaniesz przekierowany z powrotem do aplikacji

## 🧪 Krok 7: Testowanie

Aby przetestować działanie aplikacji:

1. Oznacz gwiazdką dowolną wiadomość w swojej skrzynce Gmail
2. Poczekaj kilka minut (aplikacja sprawdza nowe wiadomości co 5 minut)
3. Sprawdź swoje konto Todoist - powinno pojawić się nowe zadanie!

## ❓ Rozwiązywanie problemów

### Aplikacja nie tworzy zadań

1. Sprawdź, czy wiadomość jest poprawnie oznaczona gwiazdką
2. Upewnij się, że wszystkie klucze API są poprawne
3. Sprawdź logi aplikacji:
   - W dashboardzie Render, przejdź do swojej usługi
   - Kliknij zakładkę "Logs"
   - Przejrzyj logi w poszukiwaniu błędów

### Problem z autoryzacją Gmail

1. Upewnij się, że URI przekierowania w konsoli Google Cloud jest poprawny
2. Spróbuj ponownie autoryzować aplikację

## 💰 Koszty

- **Render**: Darmowy plan dla małego ruchu
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

Typowy koszt dla użytkownika przetwarzającego 100 e-maili miesięcznie: około $3 (tylko za API Claude).

## 📞 Wsparcie

Jeśli potrzebujesz pomocy, skontaktuj się z autorem aplikacji lub skorzystaj z dokumentacji online.
