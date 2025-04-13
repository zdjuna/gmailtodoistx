# 🚀 Prosta instrukcja wdrożenia aplikacji Gmail-Todoist na własnym serwerze

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na Twoim własnym serwerze. Jest to dobra opcja, jeśli masz już swoją domenę i miejsce na serwerze.

## 🛠️ Wymagania serwera

Aby uruchomić aplikację na własnym serwerze, potrzebujesz:

1. **Node.js** - wersja 16 lub nowsza
2. **npm** - menedżer pakietów Node.js
3. **Dostęp SSH** do serwera (lub panel administracyjny z możliwością uruchamiania aplikacji Node.js)
4. **Domena** - skonfigurowana do wskazywania na Twój serwer

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
   - W sekcji "Authorized redirect URIs" dodaj: `https://twoja-domena.pl/oauth2callback`
     (zastąp "twoja-domena.pl" swoją rzeczywistą domeną)
   - Kliknij "Create"
   - Pobierz plik JSON z poświadczeniami (przycisk "Download JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

## 📦 Krok 3: Przygotowanie aplikacji

1. Rozpakuj plik ZIP z aplikacją na swoim komputerze
2. Otwórz plik `.env.example` i zapisz go jako `.env`
3. Uzupełnij plik `.env` swoimi kluczami API:
   ```
   ANTHROPIC_API_KEY=twoj_klucz_anthropic
   TODOIST_API_KEY=twoj_token_todoist
   ```
4. Umieść plik `credentials.json` w głównym katalogu aplikacji

## 🖥️ Krok 4: Wdrożenie na serwerze

### Opcja A: Serwer z dostępem SSH

1. Połącz się z serwerem przez SSH:
   ```
   ssh uzytkownik@twoj-serwer.pl
   ```
2. Zainstaluj Node.js i npm (jeśli jeszcze nie są zainstalowane):
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Utwórz katalog dla aplikacji:
   ```
   mkdir -p ~/gmail-todoist-app
   ```
4. Prześlij pliki aplikacji na serwer (z komputera lokalnego):
   ```
   scp -r ./gmail-todoist-app/* uzytkownik@twoj-serwer.pl:~/gmail-todoist-app/
   ```
5. Wróć do połączenia SSH i przejdź do katalogu aplikacji:
   ```
   cd ~/gmail-todoist-app
   ```
6. Zainstaluj zależności:
   ```
   npm install
   ```
7. Zbuduj aplikację:
   ```
   npm run build
   ```
8. Uruchom aplikację:
   ```
   npm start
   ```

### Opcja B: Serwer współdzielony (shared hosting) z panelem administracyjnym

Jeśli masz serwer współdzielony z panelem administracyjnym (np. cPanel, Plesk):

1. Sprawdź, czy Twój hosting obsługuje Node.js (skontaktuj się z dostawcą hostingu)
2. Zaloguj się do panelu administracyjnego
3. Znajdź sekcję "Menedżer plików" lub podobną
4. Utwórz nowy katalog dla aplikacji (np. "gmail-todoist-app")
5. Prześlij pliki aplikacji do tego katalogu
6. Znajdź sekcję "Node.js" lub "Aplikacje" w panelu administracyjnym
7. Utwórz nową aplikację Node.js, wskazując na katalog z aplikacją
8. Ustaw komendę startową: `npm start`
9. Ustaw zmienne środowiskowe (ANTHROPIC_API_KEY, TODOIST_API_KEY)
10. Uruchom aplikację

## 🔄 Krok 5: Uruchamianie aplikacji w tle

Aby aplikacja działała w tle nawet po zamknięciu połączenia SSH, możesz użyć narzędzia PM2:

1. Zainstaluj PM2:
   ```
   npm install -g pm2
   ```
2. Uruchom aplikację za pomocą PM2:
   ```
   pm2 start npm --name "gmail-todoist" -- start
   ```
3. Skonfiguruj automatyczne uruchamianie po restarcie serwera:
   ```
   pm2 startup
   pm2 save
   ```

## 🌐 Krok 6: Konfiguracja domeny (opcjonalnie)

Jeśli chcesz, aby aplikacja była dostępna pod Twoją domeną:

1. Skonfiguruj serwer WWW (np. Nginx) jako proxy dla aplikacji Node.js:

   Przykładowa konfiguracja Nginx:
   ```
   server {
       listen 80;
       server_name twoja-domena.pl;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. Zainstaluj certyfikat SSL (np. za pomocą Let's Encrypt):
   ```
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d twoja-domena.pl
   ```

## ✅ Krok 7: Autoryzacja Gmail

Przy pierwszym uruchomieniu aplikacja poprosi o autoryzację dostępu do Twojego konta Gmail:

1. Otwórz aplikację w przeglądarce: `https://twoja-domena.pl`
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
   ```
   pm2 logs gmail-todoist
   ```

### Problem z autoryzacją Gmail

1. Upewnij się, że URI przekierowania w konsoli Google Cloud jest poprawny
2. Spróbuj ponownie autoryzować aplikację

## 💰 Koszty

- **Własny serwer**: Koszt zależy od Twojego dostawcy hostingu
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

## 📞 Wsparcie

Jeśli potrzebujesz pomocy, skontaktuj się z autorem aplikacji lub skorzystaj z dokumentacji online.
