# Project Setup Guide (React / Shadcn / Tailwind)

To migrate this project from Vanilla JS to a modern React ecosystem:

## 1. Initialize Next.js
Run the following in the project root:
```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint
```

## 2. Initialize Shadcn UI
```bash
npx shadcn-ui@latest init
```

## 3. Install Peer Dependencies
```bash
npm install simplex-noise
```

## 4. Components Directory
Shadcn components should reside in `/components/ui/`. This folder is critical for maintaining consistency and using the Shadcn CLI to add more pre-built components (e.g., `npx shadcn-ui@latest add button`).

## 5. Using the Wavy Background
Import the component as shown in `waves-demo.tsx`:
```tsx
import { Waves } from "@/components/ui/wave-background"
```
