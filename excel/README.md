# Custom Excel Template

Place your Excel file here to use your own layout while data syncs automatically.

## Option 1: Copy file manually

1. Save your workbook as `custom-template.xlsx` in this folder.
2. Ensure a worksheet named **Shift Data** exists (or set `EXCEL_DATA_SHEET` in `backend/.env`).
3. Row 1 = headers (optional — default headers are added if empty).
4. Data rows start at row 2 (change with `EXCEL_DATA_START_ROW` if needed).
5. Restart the backend.

## Option 2: Upload from the app

Use **Upload template** in the dashboard Excel panel.

## Column order (default)

| Column | Field |
|--------|-------|
| A | ID |
| B | Shift Name |
| C | Date |
| D–I | P0–P5 |
| J | Total Alerts |
| K | Escalated |
| L | Silenced |
| M | Created At |
| N | Updated At |

## Live output file

All entries are written to `data/shift-tracker.xlsx` on every add, edit, or delete.

Set a custom path in `backend/.env`:

```env
EXCEL_OUTPUT_PATH=C:\Users\You\OneDrive\shift-tracker.xlsx
```
