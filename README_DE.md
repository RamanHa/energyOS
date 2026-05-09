# EnergyOS: Präzisionssystem für biologisches Management

EnergyOS ist ein Hochleistungs-Biohacking-Dashboard, das für High-Performer entwickelt wurde, um ihre biologischen Zustände zu überwachen, zu analysieren und zu optimieren. Inspiriert von der Präzisionsmedizin und der „Quantified Self“-Bewegung bietet EnergyOS eine wissenschaftliche Schnittstelle für das Management der metabolischen Gesundheit, des kognitiven Fokus und der Langlebigkeits-Biomarker.

## 🧬 Kernphilosophien
- **N=1 Experimente**: Betrachten Sie sich selbst als Labor.
- **Protokolltreue**: Fokus auf sequenzbasierte Ernährung und taktische Interventionen.
- **Sichtbarkeit von Biomarkern**: Bringen Sie tief sitzende Daten (Blutwerte) an die Oberfläche.
- **Echtzeit-Optimierung**: Unmittelbare physiologische Overrides für akute Zustände (Brain Fog, Müdigkeit).

---

## 🚀 Hauptmerkmale

### 1. Biologischer Zustands-Feed
Ein Echtzeit-Stream Ihrer physiologischen Protokolle. Verfolgen Sie Metriken wie Energieniveau (0-10), synaptischen Fokus und metabolische Last mit einer hochpräzisen visuellen Oberfläche.

### 2. Präzisions-Logger
Ein hochmodernes Eingabesystem, das die Logik der Ernährungssequenzierung durchsetzt:
- **Flüssigkeit zuerst**: Hydratations- und Elektrolyt-Checks.
- **Zelluläre Ladung**: Gemüse mit hoher Dichte.
- **Strukturelle Integrität**: Proteine & gesunde Fette.
- **Substrat-Ladung**: Strategisch getimte Kohlenhydrate.

### 3. SOS-Interventionen: Biologische Overrides
Taktische Protokolle zur sofortigen Zustandskorrektur:
- **Hypoglykämie/Brain Fog**: Salzwasser-Hydratation + strategische Fette.
- **Akuter Stress**: Physiologischer Seufzer (doppeltes Einatmen) + Vagusnerv-Reset.
- **Mittagstief**: Strategischer Adenosin-Abbau und Bewegung.

### 4. Biomarker-Tresor (Laborberichte)
Ein digitales Archiv für Ihre Laborergebnisse. Verfolgen Sie Nüchterninsulin, ApoB, HbA1c und andere kritische Biomarker im Zeitverlauf, um die langfristige Hardware-Gesundheit zu visualisieren.

### 5. Gemini-gestützte Bio-Insights
KI-gesteuerte Analysen, die kontextbezogene Empfehlungen basierend auf Ihren Protokollen und Biomarker-Trends liefern, um sicherzustellen, dass sich Ihre Protokolle mit Ihrem Körper weiterentwickeln.

### 6. Mehrsprachige Intelligenz
Vollständige Unterstützung für Englisch und Deutsch, entworfen mit einer konsistenten „Biological Architecture“-Ästhetik.

---

## 🛠 Tech Stack
- **Frontend**: React 18+ (TSX), Vite, Tailwind CSS.
- **Animationen**: `motion/react` (framer-motion).
- **Backend / DB**: Firebase Auth & Firestore.
- **KI**: Google Gemini Pro (via `@google/genai`).
- **Icons**: Lucide-React.
- **State Management**: React Hooks + Context API.

---

## 📦 Erste Schritte

### Lokale Entwicklung
1. Klonen Sie das Repository.
2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```
3. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   ```

### Konfiguration
EnergyOS erfordert ein Firebase-Projekt für die Authentifizierung und Datenspeicherung.
- Stellen Sie sicher, dass `firebase-applet-config.json` mit gültigen Anmeldedaten gefüllt ist.
- Sicherheitsregeln sind in `firestore.rules` definiert.

### Umgebungsvariablen
Stellen Sie für die KI-Analyse sicher, dass der Gemini-API-Schlüssel in Ihrer Umgebung verfügbar ist:
- `GEMINI_API_KEY`: Ihr Google GenAI-API-Schlüssel.

---

## 🛡 Sicherheit & Datenschutz
EnergyOS verwendet ein strenges **Attribute-Based Access Control (ABAC)** Modell über Firestore Security Rules.
- Daten werden strikt nach `userId` partitioniert.
- Datenlecks zwischen Benutzern sind auf der Datenbankebene ausgeschlossen.
- Personenbezogene Daten (E-Mails) werden durch Verifizierungsprüfungen geschützt.

---

## 📊 Roadmap
- [ ] Direkte Integration von Oura/Whoop/Apple Health.
- [ ] CGM (Continuous Glucose Monitor) Live-Streaming.
- [ ] Erweitertes Lipidomics-Dashboard.
- [ ] Kollaborative „Squad“-Protokolle für Teams.

---

*Hinweis: EnergyOS ist ein biologisches Überwachungstool und bietet keine medizinische Beratung an. Konsultieren Sie einen qualifizierten Gesundheitsexperten, bevor Sie neue Supplementierungs- oder Fastenprotokolle beginnen.*
