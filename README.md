# 🪪 Hox Infotech - Premium ID Card Builder

A sleek, state-of-the-art interactive ID Card Builder portal designed for Hox Infotech Private Limited. This tool features a live **3D interactive card preview** with real-time cursor perspective-tilt tracking, high-definition canvas signature capture, offline-first local vaults, and direct real-time synchronization to **Google Sheets**.

---

## 🚀 Active Integration Credentials

Your portal is fully configured out-of-the-box to sync dynamic employee submissions directly to your custom corporate spreadsheet database.

*   **Google Apps Script Web App URL:**  
    `https://script.google.com/macros/s/AKfycbzLyYztRUtvBJbs_ZdJmqb6oyv74defv1KZ-CTa6NO9oMBADaPQ4C-f_HkqjBnlSvOc4g/exec`
*   **Deployment / Macro Token ID:**  
    `AKfycbzLyYztRUtvBJbs_ZdJmqb6oyv74defv1KZ-CTa6NO9oMBADaPQ4C-f_HkqjBnlSvOc4g`

> [!NOTE]
> This deployment ID has been hardcoded into your local controller configurations (`App.jsx` & `offline-portal.html`) to provide an instant **🟢 Connected** status out of the box when launching or refreshing the app!

---

## ✨ Features & Architecture

*   **3D Interactive Holo-Refraction**: Realistic perspective depth tilt mapping using standard Vanilla CSS transitions, shifting dynamic gradient highlights as you move your mouse.
*   **Vector Dynamic QR Code**: Real-time vector-backed validation code generated dynamically on each keypress (fails over gracefully to a native inline vector barcode if offline).
*   **High-Fidelity Canvas Signature Grid**: Smooth canvas board that captures professional digital pen strokes, converting them instantly to a transparent Base64 payload.
*   **Real-Time Google Sheets Gateway**: Secure cross-origin POST pipeline sending core fields, profiles, and signatures straight to Google Drive.
*   **Cross-Device Sheets Sync**: Seamlessly sync and fetch existing records directly from Google Sheets onto any device (including mobile) using a single deployed Apps Script.
*   **Local Browser History Drawer (Vault)**: Persists up to dozens of local cards on device using standard JSON arrays in `localStorage`, letting you re-load card layouts back into memory instantly.
*   **Admin WhatsApp Dispatcher**: Fully automated or manual formatting of employee text templates directly into target WhatsApp threads.
*   **HD Print Stylesheets**: Print-optimized viewport overrides to strip editing drawers and render print-ready margins suitable for physical PVC printer laminations.

---

## 🛠️ Google Apps Script Configuration

The spreadsheet receives data using a simple Google Macro deployment configured on your `hoxinfotech.in@gmail.com` account. For reference, here is the macro script attached to the Sheet:

```javascript
/* 
 * Hox Infotech - ID Card Form Google Sheet Collector Macro
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    // Find the first truly empty row in Column A to bypass pre-allocated tables
    var values = sheet.getRange("A:A").getValues();
    var firstEmptyRow = 1;
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] === "") {
        firstEmptyRow = i + 1;
        break;
      }
    }
    if (firstEmptyRow === 1 && values[0][0] !== "") {
      firstEmptyRow = values.length + 1;
    }
    
    // Set headers if Row 1 is empty
    if (firstEmptyRow === 1) {
      var headers = [
        "Timestamp", 
        "Full Name", 
        "Designation", 
        "Department", 
        "Blood Group", 
        "Valid Until", 
        "Mobile Number", 
        "Emergency Contact", 
        "Company Email", 
        "Custom Back Content", 
        "Employee Photo (Base64)", 
        "Authorized Signature (Base64)"
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      firstEmptyRow = 2;
    }
    
    // Write row values
    var rowData = [
      new Date(),
      data.fullName || "",
      data.designation || "",
      data.department || "",
      data.bloodGroup || "",
      data.validUntil || "",
      data.mobileNo || "",
      data.emergencyContact || "",
      data.companyEmail || "",
      data.backContent || "",
      data.photoBase64 || "",
      data.signatureBase64 || ""
    ];
    
    sheet.getRange(firstEmptyRow, 1, 1, rowData.length).setValues([rowData]);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success", 
      "message": "Row successfully written to Row " + firstEmptyRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

---

## ⚡ File Structure

```text
├── index.html          # Vite Web Entry Point (React mount root)
├── package.json        # Node.json dependency manager configuration
├── vite.config.js      # React-Vite compiler configuration
├── start_server.bat    # Zero-installation offline browser CORS helper script
├── offline-portal.html # 100% self-contained single-file React offline app
├── styles.css          # Core premium stylesheet loaded by the offline portal
├── src/                # Modular React application directory
│   ├── main.jsx        # App entry point mounting root Virtual DOM
│   ├── App.jsx         # Root app shell orchestrator & state manager
│   ├── index.css       # Core compiled premium stylesheet for the Vite app
│   └── components/     # Modular functional components
│       ├── FrontDetails.jsx
│       ├── BackDetails.jsx
│       ├── MediaUploads.jsx
│       ├── GoogleSheetsSetup.jsx
│       ├── VaultDrawer.jsx
│       ├── CardPreview.jsx
│       ├── LoaderModal.jsx
│       └── ToastNotification.jsx
└── legacy/             # Archived legacy single-file codebase directory
    └── app.js          # Legacy JS controller
```

---

## 💻 Local Execution

To run the application locally on your machine, you have two flexible, premium options:

### Option A: The Desktop Offline Portal (No Node/Terminal Setup)
Simply double-click the **[offline-portal.html](file:///c:/id%20card/offline-portal.html)** file in your folder! 
* This is a standalone React 18 portal compiled live in your browser via UMD CDNs.
* Ideal for immediate offline use, administrative staff, or quick double-click actions without launching any developer environments.
* Run the **[start_server.bat](file:///c:/id%20card/start_server.bat)** utility beforehand to prevent browser CORS locks on canvas photo downloads.

### Option B: The Modern Developer Vite Server (Vite + React 18)
Ideal for developers scaling the codebase or building production bundles:
1. Open a terminal in the folder `c:\id card\`.
2. Run `npm install` to download dependencies.
3. Run `npm run dev` to launch the lightning-fast Vite developer server!
4. Open the displayed URL (usually `http://localhost:3000`) to test.
