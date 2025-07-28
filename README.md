# 🛍️ Ecomly.ai

**Ecomly.ai** is a live AI-powered platform that helps e-commerce sellers automate product branding, listing, customer support, and shipping logistics using cutting-edge AI tools.

🌐 **Live Site:** [https://ecomly.vercel.app](https://ecomly.vercel.app)

---

## 🚀 Features

### 🧠 AI Chatbot
Get product recommendations and answers to e-commerce-related questions using a smart chatbot interface.

- 🤖 Natural language support  
- 🛒 Product discovery and recommendations  
- ❓ Answers to e-commerce-related queries  

---

### 🖼️ AI Image Generator
Create high-quality marketing and product images using text prompts.

- ✏️ Input: "Red running shoes on a wooden background"  
- 🖼️ Output: Realistic, AI-generated product photo  
- Powered by Gemini API

---

### 🧽 Background Remover
Automatically removes the background from any uploaded product image and lets you apply any background color.

- Upload any product photo  
- Choose custom background color or transparent/white  
- Ideal for professional listings  

---

### 🏷️ Make My Brand
Visualize your brand's logo on mockup products.

- Upload your **logo**  
- Describe the **product** (e.g., mug, t-shirt, hoodie)  
- Generates a product mockup with your logo  
- Great for branding previews and marketing

---

### 📃 Product Lister
Instantly generate optimized product listings from a single product image.

- Upload product photo  
- Get:
  - 📌 Product Title  
  - 📝 Description  
  - 🔖 Trending Hashtags  
- Saves time & boosts e-commerce visibility

---

### ✂️ Shipping Label Cropper
Crop shipping labels from invoice PDFs for platforms like Amazon, Flipkart, Meesho, etc.

- Select your platform  
- Upload PDF invoice  
- Automatically detect and crop shipping labels  
- Download ready-to-print labels

---

### 📧 OTP Verification (Email)
Implements secure user registration via OTP sent to the user’s email.

- 📤 Sends OTP using **EmailJS**  
- ✅ OTP verification handled on a separate page  
- 🔐 Used during the registration process  

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS  
- **Routing & State:** React Router, Context API  
- **Authentication:** Firebase Auth, OTP via EmailJS  
- **Storage & DB:** Firebase Firestore  
- **Image AI:** Google Gemini API, remove.bg, custom services  
- **Email Service:** EmailJS (for OTP sending)  
- **PDF Handling:** PDF.js / Custom utilities

---

## 📂 Project Structure (Highlights)

```
/components       → UI components (Header, Footer, Toast, etc.)
/pages            → Main tools & feature routes
/services         → API logic (auth, Gemini, remove.bg, EmailJS)
/hooks            → Custom React hooks
/contexts         → Auth context & protected routing
App.tsx           → Main application entry point
vite.config.ts    → Build configuration
```

---

## 📌 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

> 🔑 Be sure to configure your `.env` file with:
> - Firebase credentials  
> - Gemini API key
> - remove.bg API key
> - EmailJS Service ID, Template ID, and Public Key

---

## 👤 Author

**Divya Khunt**   
🔗 [GitHub](https://github.com/divyakhunt)  
🌐 [Live Site](https://ecomly.vercel.app)

---

## 📄 License

This project is licensed under the MIT License.
