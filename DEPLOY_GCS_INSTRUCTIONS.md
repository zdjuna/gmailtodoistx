# Instrukcja wdrożenia aplikacji Gmail-Todoist na Google Cloud Storage (GCS)

Drogi Adamie,

Zgodnie z obietnicą, przygotowałem kompletną aplikację z poprawionymi wszystkimi błędami TypeScript oraz instrukcję wdrożenia na Google Cloud Storage (GCS). Poniżej znajdziesz szczegółowe kroki, które pozwolą Ci wdrożyć aplikację bez żadnych problemów.

## Przygotowanie środowiska Google Cloud

1. **Utwórz konto Google Cloud Platform**:
   - Jeśli jeszcze nie masz konta, przejdź do [cloud.google.com](https://cloud.google.com) i utwórz nowe konto
   - Możesz skorzystać z darmowego okresu próbnego, który daje $300 kredytu na 90 dni

2. **Utwórz nowy projekt**:
   - Przejdź do [console.cloud.google.com](https://console.cloud.google.com)
   - Kliknij na nazwę projektu w górnym pasku i wybierz "Nowy projekt"
   - Nadaj nazwę projektu (np. "gmail-todoist-app") i kliknij "Utwórz"
   - Po utworzeniu projektu, wybierz go z listy projektów

3. **Włącz rozliczenia dla projektu**:
   - W menu bocznym wybierz "Rozliczenia"
   - Połącz projekt z kontem rozliczeniowym (wymagane dla GCS)
   - Możesz skorzystać z darmowego okresu próbnego

4. **Zainstaluj Google Cloud SDK**:
   - Pobierz i zainstaluj [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
   - Po instalacji, otwórz terminal i zaloguj się:
     ```
     gcloud auth login
     ```
   - Ustaw projekt jako domyślny:
     ```
     gcloud config set project NAZWA_TWOJEGO_PROJEKTU
     ```

## Wdrażanie aplikacji

### Krok 1: Przygotowanie plików aplikacji

1. Rozpakuj załączony plik `gmail-todoist-app-fixed.zip` do wybranego katalogu na swoim komputerze.

2. Otwórz terminal i przejdź do katalogu z rozpakowaną aplikacją:
   ```
   cd ścieżka/do/gmail-todoist-app
   ```

3. Zainstaluj zależności i zbuduj aplikację:
   ```
   npm install
   npm run build
   ```

### Krok 2: Konfiguracja Google Cloud Storage

1. Włącz API Google Cloud Storage:
   ```
   gcloud services enable storage-api.googleapis.com
   ```

2. Utwórz bucket GCS:
   ```
   gsutil mb -l europe-west3 gs://NAZWA_TWOJEGO_BUCKETA
   ```
   Zastąp `NAZWA_TWOJEGO_BUCKETA` unikalną nazwą (np. `gmail-todoist-app-adam`).

3. Skonfiguruj bucket jako witrynę statyczną:
   ```
   gsutil web set -m index.html gs://NAZWA_TWOJEGO_BUCKETA
   ```

4. Ustaw uprawnienia dostępu:
   ```
   gsutil iam ch allUsers:objectViewer gs://NAZWA_TWOJEGO_BUCKETA
   ```

### Krok 3: Konfiguracja Cloud Run dla backendu

1. Włącz API Cloud Run:
   ```
   gcloud services enable run.googleapis.com
   ```

2. Włącz API Container Registry:
   ```
   gcloud services enable containerregistry.googleapis.com
   ```

3. Zbuduj i wdróż kontener Docker:
   ```
   gcloud builds submit --tag gcr.io/NAZWA_TWOJEGO_PROJEKTU/gmail-todoist-app
   ```

4. Wdróż aplikację na Cloud Run:
   ```
   gcloud run deploy gmail-todoist-app --image gcr.io/NAZWA_TWOJEGO_PROJEKTU/gmail-todoist-app --platform managed --region europe-west3 --allow-unauthenticated
   ```

5. Po wdrożeniu, zapisz URL aplikacji, który zostanie wyświetlony w terminalu.

### Krok 4: Konfiguracja zmiennych środowiskowych

1. Skonfiguruj zmienne środowiskowe dla aplikacji:
   ```
   gcloud run services update gmail-todoist-app --set-env-vars="ANTHROPIC_API_KEY=TWÓJ_KLUCZ_ANTHROPIC,TODOIST_API_KEY=TWÓJ_TOKEN_TODOIST"
   ```

2. Zastąp `TWÓJ_KLUCZ_ANTHROPIC` i `TWÓJ_TOKEN_TODOIST` swoimi rzeczywistymi kluczami API.

### Krok 5: Konfiguracja OAuth dla Gmail

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

2. Włącz Gmail API:
   - W menu bocznym wybierz "API i usługi" > "Biblioteka"
   - Wyszukaj "Gmail API" i kliknij na wynik
   - Kliknij "Włącz"

3. Utwórz poświadczenia OAuth:
   - W menu bocznym wybierz "API i usługi" > "Poświadczenia"
   - Kliknij "Utwórz poświadczenia" > "ID klienta OAuth"
   - Wybierz typ aplikacji "Aplikacja internetowa"
   - Nadaj nazwę (np. "Gmail-Todoist App")
   - W sekcji "Autoryzowane URI przekierowania" dodaj: `https://TWÓJ_URL_CLOUD_RUN/oauth2callback`
   - Kliknij "Utwórz"
   - Pobierz plik JSON z poświadczeniami (przycisk "Pobierz JSON")
   - Zmień nazwę pobranego pliku na `credentials.json`

4. Dodaj poświadczenia OAuth jako sekret:
   ```
   gcloud secrets create gmail-credentials --data-file=credentials.json
   ```

5. Nadaj uprawnienia dostępu do sekretu:
   ```
   gcloud secrets add-iam-policy-binding gmail-credentials --member=serviceAccount:NAZWA_TWOJEGO_PROJEKTU@appspot.gserviceaccount.com --role=roles/secretmanager.secretAccessor
   ```

6. Zaktualizuj aplikację, aby korzystała z sekretu:
   ```
   gcloud run services update gmail-todoist-app --set-env-vars="GMAIL_CREDENTIALS_SECRET=projects/NAZWA_TWOJEGO_PROJEKTU/secrets/gmail-credentials/versions/latest"
   ```

## Testowanie aplikacji

1. Otwórz URL aplikacji w przeglądarce (URL, który został wyświetlony po wdrożeniu na Cloud Run).

2. Kliknij przycisk "Autoryzuj Gmail" i postępuj zgodnie z instrukcjami, aby autoryzować aplikację.

3. Oznacz gwiazdką dowolną wiadomość w swojej skrzynce Gmail.

4. Poczekaj kilka minut (aplikacja sprawdza nowe wiadomości co 5 minut).

5. Sprawdź swoje konto Todoist - powinno pojawić się nowe zadanie!

## Szacowane koszty

- Google Cloud Storage: ~$0.026/GB/miesiąc (pierwsze 5GB za darmo)
- Cloud Run: ~$0.00002/100ms (pierwsze 2 miliony zapytań za darmo)
- Secret Manager: ~$0.06/sekret/miesiąc

Typowy koszt dla małego ruchu: $0-5/miesiąc

## Rozwiązywanie problemów

Jeśli napotkasz problemy podczas wdrażania, możesz sprawdzić logi aplikacji:

```
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gmail-todoist-app"
```

W przypadku jakichkolwiek pytań lub problemów, jestem do Twojej dyspozycji.

Powodzenia!
