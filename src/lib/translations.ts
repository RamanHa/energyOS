
export type Language = 'en' | 'de';

export const translations = {
  en: {
    nav: {
      systems: 'Systems',
      logData: 'Log Data',
      biomarkers: 'Biomarkers',
      interventions: 'Interventions',
      synthesis: 'Synthesis',
      profile: 'Profile',
      disconnect: 'Disconnect',
      entityConnected: 'Entity Connected'
    },
    dashboard: {
      energy: 'Current Energy',
      focus: 'Synaptic Focus',
      metabolic: 'Metabolic State',
      recovery: 'System Recovery',
      sleepQuality: 'Quality Index',
      stable: 'Stable',
      timelineTitle: 'Biological State Timeline',
      timelineSub: 'Cause & Effect Analysis: Today',
      insightEngine: 'Bio-Insight Engine',
      syncEngine: 'Sync AI Engine',
      calibrating: 'Calibrating...',
      feedTitle: 'Live State Feed',
      awaitingCheckin: 'Awaiting check-in',
      awaitingData: 'Awaiting local datasets',
      analysis: 'Analysis',
      log: 'Log'
    },
    logger: {
      title: 'Input Biological Data',
      subTitle: 'Quantifying N=1 physiological state',
      types: {
        state: 'state',
        meal: 'meal',
        event: 'event'
      },
      aiFeedbackTitle: 'Bio-Optimization Signal',
      aiSynthesizing: 'Synthesizing Insight...',
      aiFallback: 'Log contextually processed for long-term health trajectory.',
      returnButton: 'Return to Console',
      protocols: {
        morning: 'Morning Protocol',
        interval: 'Interval Analysis'
      },
      labels: {
        energy: 'Energy (ATP)',
        focus: 'Synaptic Focus',
        sleep: 'Sleep Duration (h)',
        sleepQuality: 'Sleep Quality (1-10)',
        rem: 'REM Sleep (h)',
        deep: 'Deep Sleep (h)',
        light: 'Light Sleep (h)',
        hr: 'Basal HR (bpm)',
        gut: 'Internal Biomarkers (Gut)',
        mood: 'Neurotransmissive State (Mood)',
        sequence: 'Biological Sequencing Logic',
        hydration: 'Hydration Buffer Protocol',
        context: 'Qualitative Context',
        stressor: 'Environment / Stressor',
        intensity: 'Intervention Intensity',
        scanning: 'Extracting sleep metrics...',
        scanSuccess: 'Biometrics successfully extracted',
        scanError: 'Extraction failed',
        uploadSleep: 'Scan Sleep Data'
      },
      placeholders: {
        notes: 'Reactive load analysis: e.g. glucose spike mitigation sequence followed...',
        stress: 'e.g., Cortisol event: high stakes negotiation'
      },
      submit: 'Commit to Dataset',
      submitting: 'Transmitting...',
      success: 'Biological Data Synced',
      successSub: 'Local state committed to N=1 dataset',
      footer: 'Precision logging enables the Bio-Insight Engine to calibrate your local physiological model.'
    },
    vault: {
      title: 'Biomarker Vault',
      subTitle: 'Long-term physiological hardware tracking',
      register: 'Register Lab',
      cancel: 'Cancel',
      target: 'Target',
      labels: {
        marker: 'Select Biomarker',
        custom: 'Marker Name',
        value: 'Numerical Value',
        date: 'Laboratory Date',
        observation: 'Observation',
        refValid: 'Reference Valid',
        details: 'Biomarker Intelligence',
        refRange: 'Reference Range',
        trend: 'Historical Trajectory',
        back: 'Back to Vault'
      },
      submit: 'Commit Result',
      noHistory: 'No biomarker history recorded',
      correlationExplorer: 'Correlation Explorer',
      correlationSub: 'Analyzing relationships between biological markers',
      selectX: 'Select X Axis (Source)',
      selectY: 'Select Y Axis (Target)',
      minPairs: 'Minimum 2 pairs required for analysis',
      correlationStrength: 'Statistical Association',
      weak: 'Weak',
      moderate: 'Moderate',
      strong: 'Strong',
      protocolNoteTitle: 'Protocol Note',
      protocolNote: 'Optimization logic: If active on supplemental B12 protocols, synchronize testing with a 90-day clearance window to ensure intracellular saturation accuracy vs transient serum levels.',
      uploadImage: 'Scan Lab Report',
      extracting: 'Extracting Bio-Data...',
      uploadError: 'Extraction failed. Please ensure the image is clear.',
      scanResults: 'Analyzed Biomarkers'
    },
    profile: {
      title: 'Biological Identity',
      subTitle: 'Management of the N=1 core profile',
      personal: 'Personal Information',
      goals: 'Biomarker Targets',
      integrations: 'Wearable Sync',
      connectGoogleFit: 'Connect Google Fit',
      connectedGoogleFit: 'Google Fit Connected',
      syncGoogleFit: 'Sync Wearable Data',
      syncingGoogleFit: 'Syncing...',
      save: 'Update Profile',
      saving: 'Updating...',
      success: 'Profile Updated',
      labels: {
        name: 'Display Name',
        email: 'Email (Identity)',
        goalFor: 'Target for'
      }
    },
    onboarding: {
      welcome: 'Welcome to EnergyOS',
      welcomeSub: 'Your biological operating system initialized.',
      step1: 'Biological Feed',
      step1Desc: 'Monitor your real-time states. Data is the foundation of optimization.',
      step2: 'Precision Logger',
      step2Desc: 'Enforce nutritional sequencing and track metabolic shifts with high fidelity.',
      step3: 'SOS Protocols',
      step3Desc: 'Immediate physiological overrides for Brain Fog, Stress, and Lethargy.',
      step4: 'Biomarker Vault',
      step4Desc: 'Archive your lab records and track long-term hardware health.',
      next: 'Continue Protocol',
      startFirstLog: 'Initialize First Log',
      complete: 'System Online'
    },
    sos: {
      title: 'Biological Override Protocols',
      subTitle: 'Direct physiological counter-measures for state optimization',
      recommended: 'Recommended Overrides',
      activate: 'Activate Timer',
      terminate: 'Terminate Protocol',
      standby: 'Standby: Select scenario for immediate physiological deployment',
      logged: 'Contextually logged to biological state',
      bioReset: 'Bio-Reset Sequence Active',
      protocols: {
        brainFog: {
          title: 'Hypoglycemic / Brain Fog',
          desc: 'Feeling dizzy, hangry, or mental clarity is dropping RAPIDLY.',
          s1: 'Drink 250ml water with 1/2 tsp Himalayan salt immediately.',
          s2: 'Eat a small protein + healthy fat snack (e.g., macadamias).',
          s3: 'AVOID more caffeine - it will spike cortisol and crash blood sugar further.'
        },
        stress: {
          title: 'Acute Stress / Tightness',
          desc: 'Sympathetic nervous system has taken over (Fight/Flight).',
          s1: 'Physiological Sigh: Double inhale through nose, long audible exhale.',
          s2: 'Repeat 5-10 times to reset vagus nerve.',
          s3: 'Splash cold water on face for Mammalian Dive Reflex.'
        },
        fatigue: {
          title: 'Post-Lunch Lethargy',
          desc: 'Post-prandial dip or adenosine pressure.',
          s1: '10-minute light walk (Natural light preferred) to push glucose into muscles.',
          s2: 'Strategic Power Nap: 20 minutes to clear Adenosine.',
          s3: 'Do not consume carbs for at least 3 hours.'
        }
      }
    },
    common: {
      active: 'Active',
      syncing: 'Syncing...',
      optimized: 'Biomarkers Optimized',
      user: 'User'
    },
    synthesis: {
      title: 'Biological Synthesis',
      subTitle: 'AI-authored weekly state breakdown',
      generateBtn: 'Generate Weekly Synthesis',
      generating: 'Synthesizing Neural & Meta Data...',
      summarySection: 'Trajectory Summary',
      challengesSection: 'Primary Challenges',
      winsSection: 'Metabolic & Mental Wins',
      moodSection: 'Dominant Vectors',
      gamePlanSection: 'Week Ahead Game Plan',
      noData: 'Insufficient data points to generate synthesis. Keep logging.'
    }
  },
  de: {
    nav: {
      systems: 'Systeme',
      logData: 'Daten loggen',
      biomarkers: 'Biomarker',
      interventions: 'Interventionen',
      synthesis: 'Synthese',
      profile: 'Profil',
      disconnect: 'Verbindung trennen',
      entityConnected: 'Entität verbunden'
    },
    dashboard: {
      energy: 'Aktuelle Energie',
      focus: 'Synaptischer Fokus',
      metabolic: 'Stoffwechselzustand',
      recovery: 'System-Regeneration',
      sleepQuality: 'Qualitäts-Index',
      stable: 'Stabil',
      timelineTitle: 'Biologische Zeitlinie',
      timelineSub: 'Ursache-Wirkungs-Analyse: Heute',
      insightEngine: 'Bio-Insight-Engine',
      syncEngine: 'KI-Engine synchronisieren',
      calibrating: 'Kalibrierung...',
      feedTitle: 'Live-Zustands-Feed',
      awaitingCheckin: 'Warte auf Check-in',
      awaitingData: 'Warte auf lokale Datensätze',
      analysis: 'Analyse',
      log: 'Protokoll'
    },
    logger: {
      title: 'Biologische Daten eingeben',
      subTitle: 'Quantifizierung des physiologischen N=1 Zustands',
      types: {
        state: 'Zustand',
        meal: 'Mahlzeit',
        event: 'Ereignis'
      },
      aiFeedbackTitle: 'Bio-Optimierungssignal',
      aiSynthesizing: 'Synthetisiere Erkenntnisse...',
      aiFallback: 'Protokoll kontextbezogen für die langfristige Gesundheitsentwicklung verarbeitet.',
      returnButton: 'Zurück zur Konsole',
      protocols: {
        morning: 'Morgen-Protokoll',
        interval: 'Intervall-Analyse'
      },
      labels: {
        energy: 'Energie (ATP)',
        focus: 'Synaptic Fokus',
        sleep: 'Schlafdauer (h)',
        sleepQuality: 'Schlafqualität (1-10)',
        rem: 'REM-Schlaf (h)',
        deep: 'Tiefschlaf (h)',
        light: 'Leichtschlaf (h)',
        hr: 'Ruhepuls (bpm)',
        gut: 'Interne Biomarker (Darm)',
        mood: 'Neurotransmissiver Zustand (Stimmung)',
        sequence: 'Biologische Sequenzierungslogik',
        hydration: 'Hydrationspuffer-Protokoll',
        context: 'Qualitativer Kontext',
        stressor: 'Umgebung / Stressor',
        intensity: 'Interventionsintensität',
        scanning: 'Schlafmetriken werden extrahiert...',
        scanSuccess: 'Biometrie erfolgreich extrahiert',
        scanError: 'Extraktion fehlgeschlagen',
        uploadSleep: 'Schlafdaten scannen'
      },
      placeholders: {
        notes: 'Reaktive Lastanalyse: z.B. Glukosespitzen-Minderungssequenz gefolgt...',
        stress: 'z.B. Cortisol-Ereignis: Verhandlungen mit hohem Einsatz'
      },
      submit: 'Zum Datensatz hinzufügen',
      submitting: 'Übertragung...',
      success: 'Biologische Daten synchronisiert',
      successSub: 'Lokaler Zustand in N=1 Datensatz übernommen',
      footer: 'Präzises Logging ermöglicht der Bio-Insight-Engine, Ihr lokales physiologisches Modell zu kalibrieren.'
    },
    vault: {
      title: 'Biomarker-Tresor',
      subTitle: 'Langfristige physiologische Hardware-Verfolgung',
      register: 'Labor registrieren',
      cancel: 'Abbrechen',
      target: 'Zielwert',
      labels: {
        marker: 'Biomarker auswählen',
        custom: 'Marker-Name',
        value: 'Numerischer Wert',
        date: 'Labordatum',
        observation: 'Beobachtung',
        refValid: 'Referenz gültig',
        details: 'Biomarker-Intelligenz',
        refRange: 'Referenzbereich',
        trend: 'Historischer Verlauf',
        back: 'Zurück zum Tresor'
      },
      submit: 'Ergebnis speichern',
      noHistory: 'Keine Biomarker-Historie aufgezeichnet',
      correlationExplorer: 'Korrelations-Explorer',
      correlationSub: 'Analyse der Beziehungen zwischen biologischen Markern',
      selectX: 'X-Achse auswählen (Quelle)',
      selectY: 'Y-Achse auswählen (Ziel)',
      minPairs: 'Mindestens 2 Paare für die Analyse erforderlich',
      correlationStrength: 'Statistische Assoziation',
      weak: 'Schwach',
      moderate: 'Moderat',
      strong: 'Stark',
      protocolNoteTitle: 'Protokoll-Hinweis',
      protocolNote: 'Optimierungslogik: Bei aktiven B12-Supplementierungsprotokollen synchronisieren Sie die Tests mit einem 90-Tage-Fenster, um die Genauigkeit der intrazellulären Sättigung gegenüber transienten Serumspiegeln zu gewährleisten.',
      uploadImage: 'Laborbericht scannen',
      extracting: 'Biomarker extrahieren...',
      uploadError: 'Extraktion fehlgeschlagen. Bitte auf gute Bildqualität achten.',
      scanResults: 'Analysierte Biomarker'
    },
    profile: {
      title: 'Biologische Identität',
      subTitle: 'Verwaltung des N=1 Kernprofils',
      personal: 'Persönliche Informationen',
      goals: 'Biomarker-Zielwerte',
      integrations: 'Wearable Sync',
      connectGoogleFit: 'Google Fit verbinden',
      connectedGoogleFit: 'Google Fit verbunden',
      syncGoogleFit: 'Wearable Daten synchronisieren',
      syncingGoogleFit: 'Synchronisierung...',
      save: 'Profil aktualisieren',
      saving: 'Aktualisierung...',
      success: 'Profil aktualisiert',
      labels: {
        name: 'Anzeigename',
        email: 'E-Mail (Identität)',
        goalFor: 'Zielwert für'
      }
    },
    onboarding: {
      welcome: 'Willkommen bei EnergyOS',
      welcomeSub: 'Ihr biologisches Betriebssystem wurde initialisiert.',
      step1: 'Biologischer Feed',
      step1Desc: 'Überwachen Sie Ihre Zustände in Echtzeit. Daten sind die Grundlage der Optimierung.',
      step2: 'Präzisions-Logger',
      step2Desc: 'Erzwingen Sie die Ernährungssequenzierung und verfolgen Sie Stoffwechselveränderungen mit hoher Präzision.',
      step3: 'SOS-Protokolle',
      step3Desc: 'Unmittelbare physiologische Overrides bei Brain Fog, Stress und Müdigkeit.',
      step4: 'Biomarker-Tresor',
      step4Desc: 'Archivieren Sie Ihre Laborberichte und verfolgen Sie die langfristige Hardware-Gesundheit.',
      next: 'Protokoll fortsetzen',
      startFirstLog: 'Erstes Protokoll initialisieren',
      complete: 'System Online'
    },
    sos: {
      title: 'Biologische Override-Protokolle',
      subTitle: 'Direkte physiologische Gegenmaßnahmen zur Zustandsoptimierung',
      recommended: 'Empfohlene Overrides',
      activate: 'Timer aktivieren',
      terminate: 'Protokoll beenden',
      standby: 'Standby: Szenario für sofortigen physiologischen Einsatz wählen',
      logged: 'Kontextuell im biologischen Zustand protokolliert',
      bioReset: 'Bio-Reset-Sequenz aktiv',
      protocols: {
        brainFog: {
          title: 'Hypoglykämie / Brain Fog',
          desc: 'Schwindelgefühl, Heißhunger oder rapides Schwinden der geistigen Klarheit.',
          s1: 'Sofort 250 ml Wasser mit 1/2 Teelöffel Himalaya-Salz trinken.',
          s2: 'Einen kleinen Snack mit Protein und gesunden Fetten essen (z.B. Macadamias).',
          s3: 'Weiteres Koffein VERMEIDEN - es erhöht das Cortisol und führt zu einem weiteren Blutzuckerabsturz.'
        },
        stress: {
          title: 'Akuter Stress / Verspannung',
          desc: 'Das sympathische Nervensystem hat übernommen (Kampf/Flucht).',
          s1: 'Physiologischer Seufzer: Doppelt durch die Nase einatmen, lange hörbar ausatmen.',
          s2: '5-10 Mal wiederholen, um den Vagusnerv zurückzusetzen.',
          s3: 'Gesicht mit kaltem Wasser bespritzen für den Säugetier-Tauchreflex.'
        },
        fatigue: {
          title: 'Müdigkeit nach dem Mittagessen',
          desc: 'Mittagstief oder Adenosindruck.',
          s1: '10-minütiger leichter Spaziergang (idealerweise im Tageslicht), um Glukose in die Muskeln zu schleusen.',
          s2: 'Strategisches Power-Nickerchen: 20 Minuten, um Adenosin abzubauen.',
          s3: 'Mindestens 3 Stunden lang keine Kohlenhydrate zu sich nehmen.'
        }
      }
    },
    common: {
      active: 'Aktiv',
      syncing: 'Synchronisierung...',
      optimized: 'Biomarker optimiert',
      user: 'Benutzer'
    },
    synthesis: {
      title: 'Biologische Synthese',
      subTitle: 'KI-erstellte wöchentliche Zustandsaufschlüsselung',
      generateBtn: 'Wöchentliche Synthese generieren',
      generating: 'Synthetisiere neuronale & Metadaten...',
      summarySection: 'Verlauf Zusammenfassung',
      challengesSection: 'HauptHerausforderungen',
      winsSection: 'Stoffwechsel & Mentale Erfolge',
      moodSection: 'Dominante Vektoren',
      gamePlanSection: 'Spielplan für nächste Woche',
      noData: 'Unzureichende Datenpunkte zur Generierung der Synthese. Bitte weiter loggen.'
    }
  }
};
