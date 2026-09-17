const SPREADSHEET_ID = '1yj1z-cWGt0kwpSxrFGvWoIFacldZM9Ew-BcNZzQRFoU';

function testSpreadsheetConnection() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  console.log(spreadsheet.getName());
}



function testSheetConnection() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetNames = [
    'Tickets',
    'Comments',
    'History',
    'Members'
  ];

  sheetNames.forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    console.log(`${sheetName}: ${sheet ? 'OK' : 'NOT FOUND'}`);
  });
}

