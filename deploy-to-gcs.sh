

set -e

PROJECT_ID="gmail-todoist-app"
REGION="europe-west3"
BUCKET_NAME="gmail-todoist-app"
SERVICE_NAME="gmail-todoist-backend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

if ! command -v gcloud &> /dev/null; then
  print_error "Google Cloud SDK is not installed. Please install it first."
  exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  print_error "You are not logged in to Google Cloud. Please run 'gcloud auth login' first."
  exit 1
fi

print_message "Setting project to $PROJECT_ID"
gcloud config set project $PROJECT_ID

if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
  print_message "Creating project $PROJECT_ID"
  gcloud projects create $PROJECT_ID
  print_message "Please enable billing for this project in the Google Cloud Console"
  print_message "Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
  read -p "Press Enter once billing is enabled..."
fi

print_message "Enabling required APIs"
gcloud services enable storage-api.googleapis.com run.googleapis.com secretmanager.googleapis.com

print_message "Building the application"
npm run build

if ! gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
  print_message "Creating GCS bucket: gs://$BUCKET_NAME"
  gsutil mb -l $REGION gs://$BUCKET_NAME
  
  print_message "Configuring bucket as a static website"
  gsutil web set -m index.html gs://$BUCKET_NAME
  
  print_message "Setting public access to bucket"
  gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
else
  print_warning "Bucket gs://$BUCKET_NAME already exists"
fi

print_message "Building and deploying Docker image to Cloud Run"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

print_message "Deploying to Cloud Run"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)")

print_message "Updating frontend configuration with backend URL: $SERVICE_URL"
cat > dist/config.js << EOF
window.config = {
  backendUrl: "$SERVICE_URL"
};
EOF

print_message "Deploying frontend to GCS"
gsutil -m cp -r dist/* gs://$BUCKET_NAME/

FRONTEND_URL="https://storage.googleapis.com/$BUCKET_NAME/index.html"
print_message "Deployment completed successfully!"
print_message "Frontend URL: $FRONTEND_URL"
print_message "Backend URL: $SERVICE_URL"

print_message "To set up environment variables for the backend, run:"
print_message "gcloud run services update $SERVICE_NAME --platform managed --region $REGION --set-env-vars=\"ANTHROPIC_API_KEY=your_key,TODOIST_API_KEY=your_key\""

print_message "To view logs, run:"
print_message "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\""
