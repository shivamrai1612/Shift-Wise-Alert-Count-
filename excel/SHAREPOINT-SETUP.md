# Use Your SharePoint Excel File

Your file:
https://testmaq-my.sharepoint.com/:x:/g/personal/shivamr_maqsoftware_com/IQBHq39dms2CR6WrJcWL7NgtAZ0bc9HI__XY0O-J7BvtEsY?e=J6egYj

The app cannot log in to SharePoint automatically without Microsoft Azure setup. Use **one** of these options:

---

## Option A — OneDrive sync (recommended)

This keeps the **same file** on SharePoint updated when you save entries in the app.

1. Open the link above in your browser and click **Sync** (or open in OneDrive).
2. Find the local path, for example:
   ```
   C:\Users\v-shivam.rai\OneDrive - Maq Software\...\YourFile.xlsx
   ```
3. Edit `backend\.env`:

```env
EXCEL_SYNC_ENABLED=true
EXCEL_TEMPLATE_PATH=C:\Users\v-shivam.rai\OneDrive - Maq Software\...\YourFile.xlsx
EXCEL_OUTPUT_PATH=C:\Users\v-shivam.rai\OneDrive - Maq Software\...\YourFile.xlsx
SHAREPOINT_EXCEL_URL=https://testmaq-my.sharepoint.com/:x:/g/personal/shivamr_maqsoftware_com/IQBHq39dms2CR6WrJcWL7NgtAZ0bc9HI__XY0O-J7BvtEsY?e=J6egYj
```

4. Set `EXCEL_DATA_SHEET` to your worksheet name if it is not the first tab.
5. Set `EXCEL_HEADER_ROW` / `EXCEL_DATA_START_ROW` if headers are not in row 1.
6. Restart the backend.

OneDrive will upload changes back to SharePoint automatically.

---

## Option B — Download once, upload in the app

1. Open the SharePoint link → **Download** the `.xlsx`.
2. In the app, click **Upload your template** and select the file.
3. The app saves it as `excel/custom-template.xlsx` and syncs data into matching columns.
4. Use **Download live Excel** to get the updated copy. Re-upload to SharePoint manually if needed.

---

## Column headers in your sheet

The app matches headers by name (any order), for example:

| Your header | Mapped field |
|-------------|--------------|
| Shift Name / Shift / Region | APAC, EMEA, US East, US West |
| Date | Entry date |
| P0 – P5 | Priority counts |
| Escalated, Silenced | Counts |
| Total Alerts / Total | Sum of P0–P5 |

---

## Need fully automatic cloud sync?

That requires **Microsoft Graph API** (Azure app registration). Say if you want that added later.
