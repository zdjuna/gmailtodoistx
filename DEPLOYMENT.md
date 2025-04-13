# Instrukcja wdrożenia aplikacji Gmail-Todoist

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na różnych platformach. Wybierz opcję, która najlepiej odpowiada Twoim potrzebom.

## Opcja 1: Wdrożenie na własnym komputerze (najprostsze)

Jeśli chcesz uruchomić aplikację na swoim komputerze, który jest regularnie włączony:

### Wymagania
- Node.js (wersja 16 lub nowsza)
- Dostęp do internetu

### Kroki
1. Zainstaluj Node.js ze strony [nodejs.org](https://nodejs.org/)
2. Pobierz pliki aplikacji
3. Otwórz terminal/wiersz poleceń w folderze aplikacji
4. Zainstaluj zależności:
   ```
   npm install
   ```
5. Skonfiguruj plik `.env` lub `config.json` (skopiuj z plików przykładowych i uzupełnij swoje klucze API)
6. Skompiluj aplikację:
   ```
   npm run build
   ```
7. Uruchom aplikację:
   ```
   npm start
   ```

Przy pierwszym uruchomieniu zostaniesz poproszony o autoryzację dostępu do Gmaila. Postępuj zgodnie z instrukcjami w przeglądarce.

Aby aplikacja uruchamiała się automatycznie po starcie komputera:
- **Windows**: Utwórz skrót do pliku startowego w folderze autostartu
- **Mac**: Dodaj aplikację do elementów logowania
- **Linux**: Utwórz skrypt startowy w autostart

## Opcja 2: Wdrożenie na tanim VPS (najlepszy stosunek ceny do jakości)

Jeśli potrzebujesz, aby aplikacja działała 24/7:

### Wymagania
- Konto u dostawcy VPS (np. DigitalOcean, Linode, Vultr)
- Podstawowa znajomość terminala Linux

### Kroki
1. Utwórz najtańszy serwer VPS (np. DigitalOcean Droplet za $5/miesiąc) z Ubuntu
2. Połącz się z serwerem przez SSH
3. Zainstaluj Node.js:
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Sklonuj repozytorium lub prześlij pliki aplikacji na serwer
5. Przejdź do katalogu aplikacji i zainstaluj zależności:
   ```
   npm install
   ```
6. Skonfiguruj plik `.env` lub `config.json`
7. Skompiluj aplikację:
   ```
   npm run build
   ```
8. Zainstaluj PM2 do zarządzania procesem:
   ```
   sudo npm install -g pm2
   ```
9. Uruchom aplikację za pomocą PM2:
   ```
   pm2 start dist/index.js --name gmail-todoist
   ```
10. Skonfiguruj automatyczne uruchamianie po restarcie serwera:
    ```
    pm2 startup
    pm2 save
    ```

Możesz sprawdzić logi aplikacji za pomocą:
```
pm2 logs gmail-todoist
```

## Opcja 3: Wdrożenie na AWS Lambda (serverless, płatność za użycie)

Jeśli chcesz zminimalizować koszty i nie potrzebujesz ciągłego działania:

### Wymagania
- Konto AWS
- AWS CLI zainstalowane lokalnie

### Kroki
1. Zainstaluj AWS CLI i skonfiguruj je swoimi danymi uwierzytelniającymi
2. Przygotuj aplikację lokalnie:
   ```
   npm install
   npm run build
   ```
3. Utwórz plik `lambda.js` w głównym katalogu z następującą zawartością:
   ```javascript
   const { main } = require('./dist/index');
   
   exports.handler = async (event) => {
     await main();
     return { statusCode: 200, body: 'Success' };
   };
   ```
4. Utwórz paczkę wdrożeniową:
   ```
   zip -r deployment.zip dist node_modules credentials.json token.json .env lambda.js
   ```
5. Utwórz rolę IAM dla Lambda w konsoli AWS
6. Utwórz funkcję Lambda za pomocą AWS CLI:
   ```
   aws lambda create-function \
     --function-name GmailTodoistApp \
     --zip-file fileb://deployment.zip \
     --handler lambda.handler \
     --runtime nodejs16.x \
     --role arn:aws:iam::TWOJE_ID_KONTA:role/NAZWA_ROLI
   ```
7. Skonfiguruj zmienne środowiskowe w konsoli AWS Lambda
8. Utwórz regułę EventBridge (CloudWatch Events) do uruchamiania funkcji co X minut

Uwaga: W przypadku AWS Lambda, autoryzacja Gmail może być trudniejsza. Zalecane jest wygenerowanie tokenu dostępu lokalnie, a następnie przesłanie go do Lambda.

## Opcja 4: Wdrożenie na Heroku (proste, ale płatne)

Jeśli preferujesz prostą platformę PaaS:

### Wymagania
- Konto Heroku
- Heroku CLI zainstalowane lokalnie

### Kroki
1. Zainstaluj Heroku CLI i zaloguj się
2. W katalogu aplikacji utwórz aplikację Heroku:
   ```
   heroku create gmail-todoist-app
   ```
3. Dodaj plik `Procfile` z zawartością:
   ```
   worker: npm start
   ```
4. Skonfiguruj zmienne środowiskowe:
   ```
   heroku config:set ANTHROPIC_API_KEY=twoj_klucz_api
   heroku config:set TODOIST_API_KEY=twoj_token_api
   # itd. dla wszystkich zmiennych z .env
   ```
5. Wdróż aplikację:
   ```
   git add .
   git commit -m "Ready for deployment"
   git push heroku main
   ```
6. Uruchom worker:
   ```
   heroku ps:scale worker=1
   ```

Uwaga: Podobnie jak w przypadku AWS Lambda, autoryzacja Gmail może wymagać wstępnego wygenerowania tokenu dostępu.

## Rozwiązywanie problemów

### Problem z autoryzacją Gmail
Jeśli masz problemy z autoryzacją Gmail na serwerze bez interfejsu graficznego:
1. Uruchom aplikację lokalnie, aby wygenerować `token.json`
2. Prześlij wygenerowany plik `token.json` na serwer

### Problemy z połączeniem API
Jeśli aplikacja nie może połączyć się z API:
1. Sprawdź, czy serwer ma dostęp do internetu
2. Upewnij się, że klucze API są poprawne
3. Sprawdź logi aplikacji pod kątem szczegółowych błędów

### Problemy z pamięcią
Jeśli aplikacja zużywa zbyt dużo pamięci:
1. Dostosuj `ANTHROPIC_MAX_TOKENS` w konfiguracji
2. Ogranicz liczbę przetwarzanych e-maili w jednym cyklu

## Bezpieczeństwo

- Przechowuj pliki konfiguracyjne z kluczami API w bezpiecznym miejscu
- Regularnie aktualizuj aplikację i jej zależności
- Używaj silnych haseł dla wszystkich kont
- Rozważ użycie zmiennych środowiskowych zamiast plików konfiguracyjnych
