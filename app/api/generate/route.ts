import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface StudentData {
  Name: string;
  RollNumber: string;
  Marks: string;
  Grade: string;
  Remarks: string;
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const spreadsheetId = formData.get('spreadsheetId') as string;
    const templateDocId = formData.get('templateDocId') as string;
    const folderId = formData.get('folderId') as string;
    const credentialsFile = formData.get('credentials') as File;

    if (!spreadsheetId || !templateDocId || !folderId || !credentialsFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse credentials
    const credentialsText = await credentialsFile.text();
    const credentials = JSON.parse(credentialsText);

    // Initialize Google APIs
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });
    const docs = google.docs({ version: 'v1', auth: authClient as any });
    const drive = google.drive({ version: 'v3', auth: authClient as any });

    // Read data from Google Sheets
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:Z', // Read all columns
    });

    const rows = sheetResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json(
        { error: 'No data found in spreadsheet' },
        { status: 400 }
      );
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Find the index of Result Link column or add it
    let resultLinkIndex = headers.findIndex(
      (h) => h.toLowerCase() === 'result link' || h.toLowerCase() === 'resultlink'
    );

    const results = [];
    const updates: any[] = [];

    // Process each student row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length === 0) continue;

      // Create student data object
      const studentData: StudentData = {} as StudentData;
      headers.forEach((header, index) => {
        studentData[header] = row[index] || '';
      });

      const studentName = studentData.Name || studentData.name || `Student${i + 1}`;
      const rollNumber = studentData.RollNumber || studentData.rollnumber || studentData['Roll Number'] || '';

      // Copy the template document
      const copiedDoc = await drive.files.copy({
        fileId: templateDocId,
        requestBody: {
          name: `Result - ${studentName} (${rollNumber})`,
          parents: [folderId],
        },
      });

      const newDocId = copiedDoc.data.id!;

      // Get the document content
      const document = await docs.documents.get({
        documentId: newDocId,
      });

      // Prepare replacement requests
      const requests: any[] = [];

      // Replace all placeholders
      Object.keys(studentData).forEach((key) => {
        const placeholder = `{{${key}}}`;
        const value = studentData[key] || '';

        requests.push({
          replaceAllText: {
            containsText: {
              text: placeholder,
              matchCase: false,
            },
            replaceText: value,
          },
        });
      });

      // Execute replacements
      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId: newDocId,
          requestBody: {
            requests,
          },
        });
      }

      // Generate PDF export link
      const pdfLink = `https://docs.google.com/document/d/${newDocId}/export?format=pdf`;
      const docLink = `https://docs.google.com/document/d/${newDocId}/edit`;

      // Store result link back to sheet
      if (resultLinkIndex === -1) {
        // Add Result Link column if it doesn't exist
        resultLinkIndex = headers.length;
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + resultLinkIndex)}1`,
          values: [['Result Link']],
        });
      }

      // Update the result link for this row
      const rowNumber = i + 2; // +2 because of 0-index and header row
      updates.push({
        range: `Sheet1!${String.fromCharCode(65 + resultLinkIndex)}${rowNumber}`,
        values: [[docLink]],
      });

      results.push({
        studentName,
        rollNumber,
        docLink,
        pdfLink,
      });
    }

    // Batch update the spreadsheet with result links
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully generated ${results.length} documents`,
    });
  } catch (error: any) {
    console.error('Error generating documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate documents' },
      { status: 500 }
    );
  }
}
