# Wdrożenie aplikacji Gmail-Todoist na Google Cloud Platform

Ta instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji Gmail-Todoist na Google Cloud Platform (GCP), co jest optymalnym rozwiązaniem dla użytkowników Google Workspace.

## Dlaczego Google Cloud Platform?

- **Integracja z Google Workspace**: Łatwiejsza konfiguracja OAuth i dostępu do Gmail API
- **Model cenowy**: Darmowa warstwa dla Cloud Run i innych usług
- **Skalowalność**: Automatyczne skalowanie w zależności od obciążenia
- **Bezpieczeństwo**: Bezpieczne przechowywanie poświadczeń i kluczy API
- **Niskie koszty utrzymania**: Minimalna konfiguracja i zarządzanie

## Komponenty GCP

1. **Cloud Run** - główny serwis hostujący aplikację
2. **Secret Manager** - bezpieczne przechowywanie kluczy API
3. **Cloud Logging** - monitorowanie i debugowanie
4. **Cloud Scheduler** (opcjonalnie) - wyzwalanie aplikacji w określonych odstępach czasu

## Wymagania wstępne

- Konto Google Cloud Platform (możesz użyć swojego konta Google Workspace)
- Zainstalowany [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Zainstalowany [Docker](https://docs.docker.com/get-docker/)
- Klucze API dla Anthropic i Todoist
- Poświadczenia OAuth dla Gmail API

## Krok 1: Przygotowanie projektu GCP

1. Zaloguj się do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt:
   ```
   gcloud projects create gmail-todoist-app --name="Gmail Todoist App"
   ```
3. Ustaw projekt jako domyślny:
   ```
   gcloud config set project gmail-todoist-app
   ```
4. Włącz wymagane API:
   ```
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable gmail.googleapis.com
   ```

## Krok 2: Konfiguracja poświadczeń OAuth dla Gmail

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Wybierz swój projekt
3. Przejdź do "APIs & Services" > "Credentials"
4. Kliknij "Create Credentials" > "OAuth client ID"
5. Wybierz typ aplikacji "Web application"
6. Dodaj URI przekierowania: `http://localhost:3000/oauth2callback`
7. Kliknij "Create" i pobierz plik JSON z poświadczeniami
8. Zapisz plik jako `credentials.json` w katalogu głównym aplikacji

## Krok 3: Przechowywanie sekretów w Secret Manager

1. Utwórz sekrety dla kluczy API:
   ```
   echo -n "twój_klucz_anthropic" | gcloud secrets create anthropic-api-key --data-file=-
   echo -n "twój_token_todoist" | gcloud secrets create todoist-api-key --data-file=-
   ```
2. Dodaj plik credentials.json jako sekret:
   ```
   gcloud secrets create gmail-credentials --data-file=credentials.json
   ```

## Krok 4: Przygotowanie aplikacji do wdrożenia

1. Utwórz plik `Dockerfile` w katalogu głównym aplikacji:

```
FROM node:16-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

2. Utwórz plik `.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
```

3. Zmodyfikuj plik `src/config.ts`, aby obsługiwał sekrety GCP:

```typescript
// Dodaj na początku pliku:
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// Dodaj funkcję do pobierania sekretów:
async function getSecret(secretName: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({name});
    return version.payload.data.toString();
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    return '';
  }
}
```

4. Zainstaluj dodatkową zależność:
   ```
   npm install @google-cloud/secret-manager
   ```

## Krok 5: Budowanie i wdrażanie na Cloud Run

1. Zbuduj obraz Docker:
   ```
   gcloud builds submit --tag gcr.io/gmail-todoist-app/gmail-todoist
   ```

2. Wdróż na Cloud Run:
   ```
   gcloud run deploy gmail-todoist \
     --image gcr.io/gmail-todoist-app/gmail-todoist \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest,TODOIST_API_KEY=todoist-api-key:latest,GMAIL_CREDENTIALS=gmail-credentials:latest
   ```

## Krok 6: Konfiguracja ciągłego działania

Masz dwie opcje:

### Opcja A: Wbudowany polling w aplikacji (prostsze)

Aplikacja już zawiera wbudowany mechanizm pollingu za pomocą `node-cron`. Upewnij się, że w pliku `src/app.ts` masz skonfigurowany odpowiedni interwał.

### Opcja B: Cloud Scheduler + Pub/Sub (bardziej efektywne)

1. Utwórz temat Pub/Sub:
   ```
   gcloud pubsub topics create gmail-check
   ```

2. Utwórz subskrypcję dla usługi Cloud Run:
   ```
   gcloud run services add-iam-policy-binding gmail-todoist \
     --member=serviceAccount:service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com \
     --role=roles/run.invoker
   ```

3. Utwórz harmonogram w Cloud Scheduler:
   ```
   gcloud scheduler jobs create pubsub check-gmail \
     --schedule="*/5 * * * *" \
     --topic=gmail-check \
     --message-body="check" \
     --time-zone="Europe/Warsaw"
   ```

4. Zmodyfikuj aplikację, aby obsługiwała żądania Pub/Sub (wymaga dodatkowych zmian w kodzie)

## Krok 7: Monitorowanie i debugowanie

1. Przeglądaj logi aplikacji:
   ```
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gmail-todoist"
   ```

2. Skonfiguruj alerty dla błędów:
   ```
   gcloud alpha monitoring policies create --policy-from-file=alert-policy.json
   ```

## Szacowane koszty

- **Cloud Run**: Darmowa warstwa obejmuje:
  - 2 miliony żądań miesięcznie
  - 360,000 GB-sekund pamięci
  - 180,000 vCPU-sekund
  - Po przekroczeniu: ~$0.00002384/żądanie + $0.00001431/GB-s + $0.0000719/vCPU-s

- **Secret Manager**: Darmowa warstwa obejmuje:
  - 6 aktywnych wersji sekretów miesięcznie
  - Po przekroczeniu: $0.06/aktywna wersja sekretu/miesiąc

- **Cloud Scheduler**: Darmowa warstwa obejmuje:
  - 3 zadania miesięcznie
  - Po przekroczeniu: $0.10/zadanie/miesiąc

Przy typowym użyciu (sprawdzanie co 5 minut), aplikacja powinna zmieścić się w darmowej warstwie lub kosztować kilka dolarów miesięcznie.

## Rozwiązywanie problemów

### Problem z autoryzacją Gmail

Jeśli masz problemy z autoryzacją Gmail:

1. Uruchom aplikację lokalnie, aby wygenerować `token.json`
2. Dodaj token jako sekret w Secret Manager:
   ```
   gcloud secrets create gmail-token --data-file=token.json
   ```
3. Zaktualizuj wdrożenie, aby używało tego sekretu:
   ```
   gcloud run services update gmail-todoist \
     --set-secrets=GMAIL_TOKEN=gmail-token:latest
   ```

### Problemy z połączeniem API

Jeśli aplikacja nie może połączyć się z API:

1. Sprawdź logi aplikacji:
   ```
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gmail-todoist"
   ```
2. Upewnij się, że sekrety są poprawnie skonfigurowane:
   ```
   gcloud secrets list
   ```

## Podsumowanie

Wdrożenie na Google Cloud Platform zapewnia:
- Niskie koszty (potencjalnie darmowe w ramach darmowej warstwy)
- Minimalne wymagania konserwacyjne
- Bezpieczne przechowywanie poświadczeń
- Łatwą integrację z usługami Google
- Automatyczne skalowanie

Ta konfiguracja jest idealna dla użytkowników Google Workspace, którzy potrzebują niezawodnego, ale niskokosztowego rozwiązania do automatyzacji zadań.
