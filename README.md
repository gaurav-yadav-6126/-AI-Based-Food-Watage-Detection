# 🍽️ AI-Based Food Wastage Detection

An AI-powered web application designed to detect and analyze food waste from images, estimate the quantity of wasted food, and provide actionable recommendations to help reduce food wastage.

The project uses **Google Gemini Vision capabilities** to analyze uploaded food images and generate meaningful waste-analysis insights through an interactive web interface.

---

## 🚀 Features

* 📸 **Food Image Analysis**

  * Upload an image of leftover or wasted food.
  * AI analyzes the uploaded image to identify the food type.

* 📊 **Food Waste Estimation**

  * Provides an estimated quantity of food waste based on the uploaded image.

* 🤖 **AI-Powered Analysis**

  * Uses Google's Gemini AI capabilities for image understanding and analysis.

* 💡 **Waste Reduction Tips**

  * Generates practical suggestions to reduce food wastage.

* 📈 **Waste Dashboard**

  * Provides an overview of food-waste data and trends.

* 📅 **Weekly Waste Summary**

  * Generates summarized insights from recorded waste data.

* 🌓 **Responsive UI**

  * Clean and responsive interface for desktop and mobile users.

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### AI & Backend

* Google Gemini
* Genkit
* Server Actions

### Development Tools

* Node.js
* npm
* VS Code
* Git & GitHub

---

## 🧠 How It Works

```text
User
  │
  ▼
Upload Food Image
  │
  ▼
Next.js Application
  │
  ▼
Gemini AI Image Analysis
  │
  ▼
Food Type + Estimated Quantity
  │
  ▼
Waste Analysis
  │
  ▼
Dashboard & Recommendations
```

---

## 📂 Project Structure

```text
AI-Based-Food-Waste-Detection/
│
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   ├── analyze-uploaded-food-image.ts
│   │   │   ├── generate-waste-reduction-tips.ts
│   │   │   └── summarize-weekly-waste-data.ts
│   │   │
│   │   └── genkit.ts
│   │
│   ├── app/
│   │   ├── dashboard/
│   │   ├── tips/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── theme-provider.tsx
│   │
│   ├── hooks/
│   └── lib/
│
├── public/
├── package.json
├── package-lock.json
├── next.config.ts
├── metadata.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gaurav-yadav-6126/-AI-Based-Food-Watage-Detection.git
```

### 2. Navigate to the Project

```bash
cd -AI-Based-Food-Watage-Detection
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace `your_gemini_api_key` with your Google Gemini API key.

> ⚠️ Never commit `.env.local` or your API key to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable         | Description                             |
| ---------------- | --------------------------------------- |
| `GEMINI_API_KEY` | API key used to access Google Gemini AI |

---

## 📸 Application Workflow

### Step 1 — Upload Food Image

The user uploads an image containing leftover or wasted food.

### Step 2 — AI Analysis

The image is processed using Gemini's vision capabilities.

### Step 3 — Food Identification

The application identifies the type of food present in the image.

### Step 4 — Quantity Estimation

The AI provides an estimated quantity of the wasted food.

### Step 5 — Waste Insights

The analyzed information can be used to understand waste patterns and generate useful insights.

### Step 6 — Reduction Recommendations

The system provides suggestions that can help users reduce future food wastage.

---

## 🌱 Future Scope

* 🔍 Improved food recognition accuracy
* ⚖️ More accurate quantity estimation
* 📱 Mobile application
* 📊 Advanced analytics and visualization
* 🏪 Restaurant-level food waste monitoring
* 📈 Historical waste tracking
* 🔔 Waste reduction alerts
* 🌐 Multi-language support
* 🤖 Integration with specialized food-waste detection models
* ☁️ Cloud deployment and scalable data storage

---

## 🎯 Objective

The main objective of this project is to use artificial intelligence to make food-waste monitoring easier and more actionable.

By analyzing food waste through images and providing meaningful recommendations, the application aims to help individuals and food-service businesses better understand their waste patterns and take steps toward reducing unnecessary food waste.

---

## 💻 Development

This project was developed using modern web technologies with an AI-powered image analysis workflow.

The application combines:

```text
Next.js
   +
React / TypeScript
   +
Gemini AI
   +
Genkit
   =
AI-Powered Food Waste Analysis Platform
```

---

## 👨‍💻 Author

**Gaurav Yadav**

* GitHub: https://github.com/gaurav-yadav-6126
* LinkedIn: https://www.linkedin.com/in/gaurav-yadav-31510129a/

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is intended for educational and development purposes.
