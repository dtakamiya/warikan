This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## アプリの特徴

- 役職ごとにポイントを設定し、傾斜割り勘が可能
- 参加者ごとに特別支払額の指定もOK
- 割り勘金額は**500円単位で切り上げ**（端数は上位役職から順に配分）
- 役職・参加者リストのテンプレ保存・呼び出し機能
- shadcn/uiベースのモダンなUI/UX・アクセシビリティ対応

## 割り勘ロジックについて

- 合計金額から特別支払額を差し引き、残りを役職ポイントで按分します。
- 支払額は**500円単位で切り上げ**されます。
- 500円未満の端数は、上位役職から順に500円ずつ加算して配分されます。
- 例：合計金額が割り切れない場合、幹事や上位役職が多めに支払う形になります。
