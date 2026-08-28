# AMJ Enterprises Invoice Generator

A production-ready client-side invoice generator built for AMJ Enterprises, focusing on margin-scheme GST calculations, TDS tracking, and offline-capable PDF generation. 

This version runs entirely locally in your browser using `localStorage`. No cloud accounts or database configurations are required.

## How to change GST/TDS Rates or Invoice Numbering
Open `src/config/constants.js`. You will find:
- `GST_ON_PROFIT_RATE`: Change `0.18` if GST rates change.
- `TDS_ON_PURCHASE_RATE`: Change `0.02` if TDS rates change.
- `INVOICE_SETTINGS.PREFIX`: Change from `'AMJ'` to anything else.
- `INVOICE_SETTINGS.STARTING_NUMBER`: Adjust the sequence starting point for the new financial year.

## Deployment (Vite + React)
You can deploy this to any static hosting provider (Vercel, Netlify, GitHub Pages, Firebase Hosting):
1. Build the project: `npm run build`
2. Deploy the generated `dist` folder to your hosting provider.

## Local Development
- `npm install` to install dependencies.
- `npm run dev` to start the local server.
