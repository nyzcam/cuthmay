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

## Importing Guests from CSV

You can convert a CSV file of guests into the TypeScript `guestList` mapping with the included script.

- Create a CSV (see `data/guestList.csv` for example) with headers: `slug,khmerName,englishName,title,relationship,plusOnes`.
- Run the converter and capture output to a file (or copy-paste into `data/guestList.ts`):

```bash
# Print TypeScript mapping to stdout
node scripts/import-csv.js data/guestList.csv > tmpGuestList.ts

# Review `tmpGuestList.ts`, then paste the object contents into `data/guestList.ts` (replace the `guestList` object body)
```

Notes:
- The converter is a simple script and does a naive CSV split on commas — avoid embedding commas inside fields or pre-quote and adapt the script to use a proper CSV parser if needed.
- The script prints a `guestList` export you can paste into your TypeScript file.

## Exporting Guest List With Full URLs

You can append a full invite `url` for each guest (based on their `slug`) using the included export script.

- The script: `scripts/export-guestlist.js`
- Default usage (reads `data/guestList.csv` and writes `data/guestList_with_urls.csv`):

```bash
# Use a base URL for the invite (e.g., your deployed site URL)
npm run export:guests
```

- The output CSV will contain all original columns plus a `url` column with values like `https://yourdomain.com/invite/<slug>`.
- The exporter supports quoted fields and will escape values as needed.

After running the exporter, open `data/guestList_with_urls.csv` to view or share the invite links.
