# Wdrażanie aplikacji Gmail-Todoist na Google Cloud Storage (GCS)

Ten dokument zawiera instrukcje dotyczące wdrażania aplikacji Gmail-Todoist na Google Cloud Storage (GCS).

## Przygotowanie do wdrożenia

1. Zainstaluj Google Cloud SDK:
   ```bash
   curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-latest-linux-x86_64.tar.gz
   tar -xf google-cloud-sdk-latest-linux-x86_64.tar.gz
   ./google-cloud-sdk/install.sh
   ```

2. Zaloguj się do Google Cloud:
   ```bash
   gcloud auth login
   ```

3. Utwórz projekt Google Cloud (jeśli jeszcze nie istnieje):
   ```bash
   gcloud projects create gmail-todoist-app
   gcloud config set project gmail-todoist-app
   ```

4. Włącz rozliczenia dla projektu (wymagane dla GCS):
   - Przejdź do [Google Cloud Console](https://console.cloud.google.com/billing)
   - Połącz projekt z kontem rozliczeniowym

5. Włącz API Google Cloud Storage:
   ```bash
   gcloud services enable storage-api.googleapis.com
   ```

## Wdrażanie aplikacji

1. Zbuduj aplikację:
   ```bash
   npm run build
   ```

2. Utwórz bucket GCS:
   ```bash
   gsutil mb -l europe-west3 gs://gmail-todoist-app
   ```

3. Skonfiguruj bucket jako witrynę statyczną:
   ```bash
   gsutil web set -m index.html gs://gmail-todoist-app
   ```

4. Ustaw uprawnienia dostępu:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://gmail-todoist-app
   ```

5. Wdróż aplikację na GCS:
   ```bash
   gsutil -m cp -r dist/* gs://gmail-todoist-app/
   ```

## Konfiguracja Cloud Run dla backendu

Ponieważ GCS obsługuje tylko statyczne pliki, musimy użyć Cloud Run dla backendu:

1. Włącz API Cloud Run:
   ```bash
   gcloud services enable run.googleapis.com
   ```

2. Zbuduj i wdróż kontener Docker:
   ```bash
   gcloud builds submit --tag gcr.io/gmail-todoist-app/backend
   gcloud run deploy gmail-todoist-backend --image gcr.io/gmail-todoist-app/backend --platform managed --region europe-west3 --allow-unauthenticated
   ```

3. Skonfiguruj zmienne środowiskowe:
   ```bash
   gcloud run services update gmail-todoist-backend --set-env-vars="ANTHROPIC_API_KEY=your_key,TODOIST_API_KEY=your_key"
   ```

## Konfiguracja Secret Manager

Dla bezpiecznego przechowywania kluczy API:

1. Włącz API Secret Manager:
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

2. Utwórz sekrety:
   ```bash
   echo -n "your_anthropic_key" | gcloud secrets create anthropic-api-key --data-file=-
   echo -n "your_todoist_key" | gcloud secrets create todoist-api-key --data-file=-
   ```

3. Nadaj uprawnienia dostępu do sekretów:
   ```bash
   gcloud secrets add-iam-policy-binding anthropic-api-key --member=serviceAccount:gmail-todoist-app@appspot.gserviceaccount.com --role=roles/secretmanager.secretAccessor
   gcloud secrets add-iam-policy-binding todoist-api-key --member=serviceAccount:gmail-todoist-app@appspot.gserviceaccount.com --role=roles/secretmanager.secretAccessor
   ```

## Konfiguracja OAuth dla Gmail

1. Utwórz poświadczenia OAuth w Google Cloud Console:
   - Przejdź do [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Utwórz ID klienta OAuth
   - Dodaj URI przekierowania: `https://YOUR_CLOUD_RUN_URL/oauth2callback`

2. Zapisz poświadczenia jako sekret:
   ```bash
   echo -n '{"web":{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET"}}' | gcloud secrets create gmail-credentials --data-file=-
   ```

## Dostęp do aplikacji

Po wdrożeniu, aplikacja będzie dostępna pod adresem:
- Frontend: `https://storage.googleapis.com/gmail-todoist-app/index.html`
- Backend: `https://gmail-todoist-backend-XXXX.run.app`

## Monitorowanie i logi

Aby monitorować aplikację:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gmail-todoist-backend"
```

## Szacowane koszty

- Google Cloud Storage: ~$0.026/GB/miesiąc (pierwsze 5GB za darmo)
- Cloud Run: ~$0.00002/100ms (pierwsze 2 miliony zapytań za darmo)
- Secret Manager: ~$0.06/sekret/miesiąc

Typowy koszt dla małego ruchu: $0-5/miesiąc
