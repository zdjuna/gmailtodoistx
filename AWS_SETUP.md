# 🚀 Prosta instrukcja wdrożenia aplikacji Gmail-Todoist na AWS Elastic Beanstalk

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na platformie AWS Elastic Beanstalk, która oferuje prosty interfejs graficzny do wdrażania aplikacji.

## 🌟 Dlaczego AWS Elastic Beanstalk?

- **Interfejs graficzny** - nie wymaga znajomości terminala
- **Darmowa warstwa AWS** - 750 godzin miesięcznie przez pierwszy rok
- **Automatyczne skalowanie** - aplikacja dostosowuje się do obciążenia
- **Łatwe zarządzanie** - bez konieczności konfiguracji serwerów

## 🛠️ Co będziesz potrzebować

1. **Konto AWS** - możesz założyć darmowe konto na [aws.amazon.com](https://aws.amazon.com)
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
   - W sekcji "Authorized redirect URIs" dodaj: `http://twoja-aplikacja.region.elasticbeanstalk.com/oauth2callback`
     (zastąp "twoja-aplikacja" i "region" odpowiednimi wartościami, które wybierzesz później)
   - Kliknij "Create"
   - Pobierz plik JSON z poświadczeniami (przycisk "Download JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

## 🚀 Krok 3: Przygotowanie aplikacji do wdrożenia

1. Rozpakuj plik ZIP z aplikacją na swoim komputerze
2. Otwórz plik `.env.example` i zapisz go jako `.env`
3. Uzupełnij plik `.env` swoimi kluczami API:
   ```
   ANTHROPIC_API_KEY=twoj_klucz_anthropic
   TODOIST_API_KEY=twoj_token_todoist
   ```
4. Umieść plik `credentials.json` w głównym katalogu aplikacji
5. Utwórz plik ZIP zawierający wszystkie pliki aplikacji (bez folderu `node_modules`)

## 🌐 Krok 4: Wdrożenie na AWS Elastic Beanstalk

1. Zaloguj się do [konsoli AWS](https://console.aws.amazon.com/)
2. Wyszukaj "Elastic Beanstalk" i kliknij, aby otworzyć usługę
3. Kliknij "Create application"
4. Wprowadź nazwę aplikacji (np. "gmail-todoist-app")
5. W sekcji "Platform", wybierz:
   - Platform: Node.js
   - Platform branch: Node.js 16
   - Platform version: wybierz najnowszą wersję
6. W sekcji "Application code", wybierz "Upload your code"
7. Kliknij "Choose file" i wybierz utworzony wcześniej plik ZIP
8. Kliknij "Create application"

## ⚙️ Krok 5: Konfiguracja zmiennych środowiskowych

1. Po utworzeniu aplikacji, przejdź do jej strony w konsoli Elastic Beanstalk
2. W menu po lewej stronie, kliknij "Configuration"
3. W sekcji "Software", kliknij "Edit"
4. Przewiń w dół do sekcji "Environment properties"
5. Dodaj następujące zmienne:
   - `ANTHROPIC_API_KEY`: Twój klucz API Anthropic
   - `TODOIST_API_KEY`: Twój token API Todoist
   - `POLLING_INTERVAL`: 300 (lub inna wartość w sekundach)
   - `NODE_ENV`: production
6. Kliknij "Apply" na dole strony

## 🔄 Krok 6: Konfiguracja cyklicznego uruchamiania

Aby aplikacja sprawdzała e-maile co określony czas, musimy skonfigurować cykliczne zadanie:

1. W menu po lewej stronie, kliknij "Configuration"
2. W sekcji "Software", kliknij "Edit"
3. Przewiń w dół do sekcji "Worker" i włącz tę opcję
4. Ustaw "Worker Queue URL" na `SQS_QUEUE_URL` (AWS utworzy kolejkę automatycznie)
5. Ustaw "Worker Queue Name" na `gmail-todoist-queue`
6. Ustaw "HTTP Path" na `/process-emails`
7. Kliknij "Apply" na dole strony

## ✅ Krok 7: Autoryzacja Gmail

Przy pierwszym uruchomieniu aplikacja poprosi o autoryzację dostępu do Twojego konta Gmail:

1. Po zakończeniu wdrażania, kliknij URL aplikacji, aby otworzyć ją w przeglądarce
2. Kliknij przycisk "Autoryzuj Gmail"
3. Zaloguj się na swoje konto Gmail
4. Zatwierdź dostęp dla aplikacji
5. Zostaniesz przekierowany z powrotem do aplikacji

## 🧪 Krok 8: Testowanie

Aby przetestować działanie aplikacji:

1. Oznacz gwiazdką dowolną wiadomość w swojej skrzynce Gmail
2. Poczekaj kilka minut (aplikacja sprawdza nowe wiadomości co 5 minut)
3. Sprawdź swoje konto Todoist - powinno pojawić się nowe zadanie!

## ❓ Rozwiązywanie problemów

### Aplikacja nie tworzy zadań

1. Sprawdź, czy wiadomość jest poprawnie oznaczona gwiazdką
2. Upewnij się, że wszystkie klucze API są poprawne
3. Sprawdź logi aplikacji:
   - W konsoli Elastic Beanstalk, przejdź do zakładki "Logs"
   - Kliknij "Request Logs" i pobierz najnowsze logi
   - Przejrzyj logi w poszukiwaniu błędów

### Problem z autoryzacją Gmail

1. Upewnij się, że URI przekierowania w konsoli Google Cloud jest poprawny
2. Spróbuj ponownie autoryzować aplikację

## 💰 Koszty

- **AWS Elastic Beanstalk**: Darmowa warstwa przez pierwszy rok (750 godzin miesięcznie)
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

Typowy koszt dla użytkownika przetwarzającego 100 e-maili miesięcznie po zakończeniu darmowego okresu: około $10-15 miesięcznie.

## 📞 Wsparcie

Jeśli potrzebujesz pomocy, skontaktuj się z autorem aplikacji lub skorzystaj z dokumentacji online.
