# Gmail do Todoist - Automatyczne Tworzenie Zadań

Prosta aplikacja, która automatycznie tworzy zadania w Todoist na podstawie oznaczonych gwiazdką wiadomości w Gmailu. Idealna dla lekarzy i innych profesjonalistów, którzy chcą efektywnie zarządzać zadaniami z poczty e-mail.

## Co robi ta aplikacja?

1. **Monitoruje Twoją skrzynkę Gmail** - sprawdza nowe wiadomości oznaczone gwiazdką
2. **Przetwarza treść e-maili** - usuwa zbędne formatowanie HTML
3. **Analizuje treść za pomocą AI (Claude)** - rozumie kontekst i cel wiadomości
4. **Tworzy zadania w Todoist** - z odpowiednim tytułem, opisem, priorytetem i terminem

## Korzyści

- **Oszczędność czasu** - nie musisz ręcznie tworzyć zadań z e-maili
- **Spójny format zadań** - wszystkie zadania mają jednolity format
- **Automatyczna kategoryzacja** - zadania są automatycznie oznaczane etykietami
- **Działa w tle** - nie wymaga Twojej uwagi po skonfigurowaniu

## Jak zacząć?

### Potrzebujesz:

- Konto Gmail
- Konto Todoist
- Konto Anthropic (dla API Claude)
- Konto Google Cloud (darmowe)

### Najłatwiejszy sposób uruchomienia:

Przejdź do dokumentu [PROSTA INSTALACJA](SIMPLE_SETUP.md), który przeprowadzi Cię krok po kroku przez cały proces.

### Wdrożenie w Google Cloud (zalecane):

Przejdź do dokumentu [WDROŻENIE GCP](DEPLOYMENT_GCP.md), który zawiera szczegółowe instrukcje wdrożenia aplikacji w Google Cloud Platform.

## Jak to działa?

1. **Oznaczasz e-mail gwiazdką w Gmail** - to sygnał dla aplikacji, że chcesz utworzyć z niego zadanie
2. **Aplikacja pobiera treść e-maila** - w tym temat, nadawcę, datę i treść
3. **Claude analizuje e-mail** - używając specjalnego szablonu w języku polskim
4. **Powstaje zadanie w Todoist** - z tytułem wygenerowanym przez Claude i szczegółami z e-maila

## Przykłady zadań

Aplikacja tworzy zadania według określonych reguł:

- Dla pacjentów: "Zadzwoń do Jana K. w sprawie wyników"
- Dla faktur: "Zapłać fakturę T-Mobile: 120 PLN"
- Dla spotkań: "Potwierdź spotkanie: 15.04"
- Dla zamówień: "Zamówienie: hmv.de winyl Sabrina Carpenter"

## Konfiguracja

Aplikacja jest łatwa w konfiguracji:

- **Częstotliwość sprawdzania** - jak często aplikacja ma sprawdzać nowe e-maile (domyślnie co 5 minut)
- **Szablon analizy** - jak Claude ma interpretować e-maile
- **Etykiety i priorytety** - jakie etykiety i priorytety przypisywać do zadań

Szczegółowe instrukcje konfiguracji znajdziesz w dokumentacji wdrożeniowej.

## Pomoc i rozwiązywanie problemów

Jeśli napotkasz problemy:

1. Sprawdź, czy e-mail jest poprawnie oznaczony gwiazdką
2. Upewnij się, że wszystkie klucze API są poprawne
3. Sprawdź logi aplikacji w Google Cloud Console

Więcej informacji znajdziesz w sekcji "Rozwiązywanie problemów" w dokumentacji wdrożeniowej.

## Bezpieczeństwo

- Aplikacja używa bezpiecznego uwierzytelniania OAuth dla Gmaila
- Klucze API są przechowywane w Google Secret Manager
- Aplikacja ma dostęp tylko do odczytu Twojej skrzynki Gmail

## Koszty

- **Google Cloud Run**: Darmowa warstwa dla małego ruchu (do 2 milionów wywołań miesięcznie)
- **Secret Manager**: Darmowa warstwa dla podstawowego użycia
- **Anthropic Claude API**: Opłaty według cennika Anthropic (około $0.03 za e-mail)
- **Gmail i Todoist API**: Bezpłatne

Typowy koszt dla użytkownika przetwarzającego 100 e-maili miesięcznie: około $3.

## Potrzebujesz pomocy?

Jeśli potrzebujesz pomocy w konfiguracji lub masz pytania, skontaktuj się z autorem aplikacji.
