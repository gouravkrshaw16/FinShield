# FinShield

### AI-Powered Financial Health Tracker

FinShield is an AI-powered financial health and alternative credit
assessment platform designed to help users understand, improve, and
manage their financial health.

The application combines financial profile analysis, explainable
scoring, cash-flow insights, debt simulation, AI-powered financial
guidance, and alternative credit information into a single platform.

## Website Link:
https://finshield-sih.web.app

## ✨ Features

-   **Financial Health Score** --- Generates an easy-to-understand
    assessment of a user's financial health.
-   **Explainable Score Analysis** --- Breaks down the factors
    influencing the financial score and provides actionable feedback.
-   **AI Financial Coach** --- Provides personalized financial guidance
    and recommendations.
-   **Cash Flow Analytics** --- Helps users understand income, expenses,
    savings, and cash-flow patterns.
-   **Financial Profile & Intake** --- Collects and manages relevant
    financial information for assessment.
-   **Debt Simulator** --- Allows users to explore different debt and
    repayment scenarios.
-   **Non-Credit Alternatives** --- Highlights alternative financial
    options for users who may have limited traditional credit history.
-   **Public Schemes Directory** --- Provides information about relevant
    public financial schemes and assistance programs.
-   **Report Export** --- Allows financial assessment information to be
    prepared for reporting/export.

## 🛠️ Tech Stack

-   **React**
-   **TypeScript**
-   **Vite**
-   **Firebase**
-   **Google Gemini API**
-   **Bun**
-   **CSS**

## 📁 Project Structure

``` text
FinShield/
├── assets/
├── src/
│   ├── components/
│   │   ├── AIFinancialCoach.tsx
│   │   ├── AIExplainScoreModal.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CashflowAnalytics.tsx
│   │   ├── ConsentCenter.tsx
│   │   ├── DebtSimulator.tsx
│   │   ├── DisputeModal.tsx
│   │   ├── ExportReportModal.tsx
│   │   ├── FinancialIntakeModal.tsx
│   │   ├── Navbar.tsx
│   │   ├── NonCreditAlternatives.tsx
│   │   ├── PublicSchemesDirectory.tsx
│   │   └── ScoreBreakdown.tsx
│   ├── data/
│   ├── lib/
│   │   ├── databaseService.ts
│   │   ├── firebase.ts
│   │   └── scoreEngine.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── firestore.rules
├── firebase-applet-config.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

Make sure you have:

-   Node.js or Bun installed
-   A Firebase project
-   A Google Gemini API key
-   Access to the required Firebase services

### Installation

Clone the repository:

``` bash
git clone https://github.com/gouravkrshaw16/FinShield.git
cd FinShield
```

Install dependencies:

``` bash
bun install
```

Or, if using npm:

``` bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

``` bash
cp .env.example .env
```

Configure the required environment variables:

``` env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=your_app_url
```

**Never commit real API keys, passwords, service-account credentials, or
other secrets to GitHub.**

For Google AI Studio deployments, configure the Gemini API key through
the platform's Secrets configuration rather than hard-coding it in
source code.

## 🔥 Firebase

FinShield uses Firebase for application data and related backend
functionality.

Before running the application in another environment, make sure the
required Firebase project and services are configured correctly.

The repository may contain Firebase web-app configuration values. These
are client-side configuration values and should still be protected with
proper Firebase Security Rules and API restrictions.

Review `firestore.rules` before deploying a production instance.

## ▶️ Run Locally

Start the development server with Bun:

``` bash
bun run dev
```

Or with npm:

``` bash
npm run dev
```

Then open the local development URL shown in the terminal.

## 🏗️ Build for Production

``` bash
bun run build
```

Or:

``` bash
npm run build
```


## 🎯 Project Vision

FinShield aims to make financial health assessment more accessible and
understandable by combining traditional financial indicators with
alternative financial information and AI-powered explanations.

The goal is to help users:

1.  Understand their current financial health.
2.  Identify factors affecting their financial score.
3.  Discover practical ways to improve their financial position.
4.  Explore alternatives when traditional credit information is limited.
5.  Make more informed financial decisions.

## 📌 Project Status

**Development / Prototype**

This project is being developed as an AI-powered financial technology
solution and may require additional security, privacy, compliance,
testing, and infrastructure work before production use.

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Make your changes.
4.  Test the application.
5.  Submit a pull request.

## ⚠️ Disclaimer

FinShield is intended for educational, research, and prototype purposes.
Financial scores, recommendations, simulations, and AI-generated
guidance should not be treated as professional financial, lending,
legal, or investment advice.

## 📄 License

This project is licensed under the MIT License.
See the LICENSE file for details.
