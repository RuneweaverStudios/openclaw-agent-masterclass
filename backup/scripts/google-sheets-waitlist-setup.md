# Google Sheets Waitlist Backend - Quick Setup

## Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Name it "Polysauce Waitlist"
4. Add headers in row 1:
   - A1: Email
   - B1: Timestamp
   - C1: Source
   - D1: IP Address

## Step 2: Add Apps Script

1. In Google Sheets, go to **Extensions → Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Add row to sheet
    sheet.appendRow([
      data.email || '',
      new Date(),
      data.source || 'website',
      e.parameter.ip || 'unknown'
    ]);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Added to waitlist'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // For testing
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Polysauce Waitlist API'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (Ctrl+S or Cmd+S)
5. Name the project "Polysauce Waitlist"

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → Select **Web app**
3. Set:
   - **Description:** "Polysauce Waitlist API"
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web app URL** (looks like: `https://script.google.com/macros/s/XXXXX/exec`)

## Step 4: Update waitlist.html

Find this line in `/polysauce/waitlist.html`:

```javascript
// Simulate API call (replace with real endpoint)
await new Promise(resolve => setTimeout(resolve, 1000));
```

Replace with:

```javascript
// Submit to Google Sheets
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

await fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors', // Required for Google Apps Script
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: email,
    source: 'waitlist'
  })
});
```

## Step 5: Test It

1. Open https://polysauce.xyz/waitlist.html
2. Enter your email
3. Click "Join Waitlist"
4. Check your Google Sheet
5. You should see the email appear!

## Step 6: View Waitlist

Your waitlist is now in the Google Sheet:
- All emails in column A
- Timestamps in column B
- Source in column C
- Export anytime as CSV

## Security Notes

- The script allows anyone to submit (no auth)
- This is fine for a public waitlist
- Google handles rate limiting
- Emails are stored in your Google account (private)

## Cost

**$0** - Google Sheets and Apps Script are free

## Limits

- Google Sheets: 10 million cells
- Apps Script: 20,000 calls/day (plenty for waitlist)

## Troubleshooting

**"Authorization required" error:**
- Make sure "Who has access" is set to "Anyone"
- Redeploy if needed

**Emails not appearing:**
- Check the Apps Script logs (View → Logs)
- Verify the URL is correct
- Check browser console for errors

**CORS errors:**
- Use `mode: 'no-cors'` in fetch
- This is normal for Google Apps Script

## Alternative: Use Google Forms

If the script is too complex:

1. Create a Google Form (1 question: Email)
2. Link to Google Sheet
3. Embed form in waitlist.html
4. Emails auto-save to sheet

**Easier but less customizable.**

---

**Setup time:** 10 minutes
**Cost:** $0
**Capacity:** Unlimited emails

**Ready to start collecting emails!** 🚀
