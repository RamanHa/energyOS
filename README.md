# EnergyOS: Precision Biological Management System

EnergyOS is a high-performance bio-hacking dashboard designed for high-performers to monitor, analyze, and optimize their biological states. Inspired by precision medicine and the "quantified self" movement, EnergyOS provides a scientific interface for managing metabolic health, cognitive focus, and longevity biomarkers.

## 🧬 Core Philosophies
- **N=1 Experimentation**: Treat yourself as a laboratory.
- **Protocol Adherence**: Focus on sequence-based nutrition and tactical interventions.
- **Biomarker Visibility**: Bring deep-tissue data (blood work) to the surface.
- **Real-time Optimization**: Immediate physiological overrides for acute states (Brain Fog, Fatigue).

---

## 🚀 Key Features

### 1. Biological State Feed
A real-time stream of your physiological logs. Track metrics like energy levels (0-10), synaptic focus, and metabolic load with a high-fidelity visual interface.

### 2. Precision Logger
A state-of-the-art input system that enforces nutritional sequencing logic:
- **Liquid-First**: Hydration and electrolyte checks.
- **Cellular Loading**: High-density vegetables.
- **Structural Integrity**: Protein & Healthy Fats.
- **Substrate Loading**: Strategically timed carbohydrates.

### 3. SOS Interventions: Biological Overrides
Tactical protocols for immediate state correction:
- **Hypoglycemic/Brain Fog**: Salt-water hydration + strategic fats.
- **Acute Stress**: Physiological Sigh (Double Inhale) + Vagus nerve reset.
- **Post-Lunch Lethargy**: Strategic Adenosine clearance and movement.

### 4. Biomarker Vault (Lab Records)
A digital archive for your laboratory results. Track Fasting Insulin, ApoB, HbA1c, and other critical biomarkers over time to visualize long-term hardware health.

### 5. Gemini-Powered Bio-Insights
AI-driven analysis that provides context-aware recommendations based on your logs and biomarker trends, ensuring your protocols evolve with your body.

### 6. Multi-Language Intelligence
Full support for English and German, designed with a consistent "Biological Architecture" aesthetic.

---

## 🛠 Tech Stack
- **Frontend**: React 18+ (TSX), Vite, Tailwind CSS.
- **Animations**: `motion/react` (framer-motion).
- **Backend / DB**: Firebase Auth & Firestore.
- **AI**: Google Gemini Pro (via `@google/genai`).
- **Icons**: Lucide-React.
- **State Management**: React Hooks + Context API.

---

## 📦 Getting Started

### Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Configuration
EnergyOS requires a Firebase project for authentication and data storage.
- Ensure `firebase-applet-config.json` is populated with valid credentials.
- Security rules are defined in `firestore.rules`.

### Environment Variables
For AI analysis, ensure the Gemini API key is available in your environment:
- `GEMINI_API_KEY`: Your Google GenAI API key.

---

## 🛡 Security & Privacy
EnergyOS uses a strict **Attribute-Based Access Control (ABAC)** model via Firestore Security Rules. 
- Data is strictly partitioned by `userId`.
- No cross-user data leaks are possible at the database layer.
- PII (emails) are guarded by verification checks.

---

## 📊 Roadmap
- [ ] Oura/Whoop/Apple Health direct integration.
- [ ] CGM (Continuous Glucose Monitor) live streaming.
- [ ] Advanced lipidomics dashboard.
- [ ] Collaborative "Squad" protocols for teams.

---

*Note: EnergyOS is a biological monitoring tool and does not provide medical advice. Consult with a qualified health professional before starting new supplementation or fasting protocols.*
