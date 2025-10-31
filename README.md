# Student Result Generator

Automatically generate personalized Google Docs result documents from Google Sheets data.

## Features

- 📊 Read student data from Google Sheets
- 📄 Use customizable Google Docs templates with placeholders
- 🔄 Automatically replace placeholders with student data
- 💾 Save generated documents to Google Drive
- 🔗 Add document links back to the original spreadsheet
- 📑 Export documents as PDFs

## Setup

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Docs API
   - Google Drive API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and click "Create"
   - Skip the optional steps
   - Click on the created service account
   - Go to "Keys" tab > "Add Key" > "Create New Key"
   - Choose JSON format and download the file

### 2. Google Drive Setup

1. Create a Google Sheet with columns like:
   - Name
   - RollNumber (or Roll Number)
   - Marks
   - Grade
   - Remarks
   - Any other custom fields

2. Create a Google Docs template with placeholders:
   ```
   Student Name: {{Name}}
   Roll Number: {{RollNumber}}
   Marks Obtained: {{Marks}}
   Grade: {{Grade}}
   Remarks: {{Remarks}}
   ```

3. Create a folder in Google Drive called "Student Results"

4. Share all three (Sheet, Template Doc, and Folder) with the service account email:
   - Open the service account JSON file
   - Copy the "client_email" value
   - Share each resource with this email (Editor permission)

### 3. Get Required IDs

**Spreadsheet ID:**
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
- Copy the `SPREADSHEET_ID` part

**Template Doc ID:**
- Open your template Google Doc
- Look at the URL: `https://docs.google.com/document/d/[DOCUMENT_ID]/edit`
- Copy the `DOCUMENT_ID` part

**Folder ID:**
- Open your Google Drive folder
- Look at the URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`
- Copy the `FOLDER_ID` part

## Usage

1. Open the web application
2. Fill in:
   - Spreadsheet ID
   - Template Doc ID
   - Folder ID
   - Upload your service account JSON credentials
3. Click "Generate Result Documents"
4. Wait for processing to complete
5. Check your Google Drive folder for the generated documents
6. The spreadsheet will be updated with links to each document

## Template Placeholders

Use double curly braces for placeholders that match your column headers:

- `{{Name}}` - Student name
- `{{RollNumber}}` - Roll number
- `{{Marks}}` - Marks obtained
- `{{Grade}}` - Grade received
- `{{Remarks}}` - Additional remarks
- `{{AnyColumnName}}` - Any custom column

Column names are case-sensitive, so make sure placeholders match your sheet headers exactly.

## File Naming

Generated documents will be named:
```
Result - [Student Name] ([Roll Number]).docx
```

## Result Links

After generation, a new column "Result Link" will be added to your spreadsheet (if it doesn't exist) with direct links to each student's document.
