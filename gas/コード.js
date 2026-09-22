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

function doGet(e) {
  if (e && e.parameter.page === 'detail') {
    const template = HtmlService.createTemplateFromFile('detail');
    template.ticketId = e.parameter.ticketId || '';
    return template.evaluate();
  }

  return HtmlService.createTemplateFromFile('index').evaluate();
}

function createTicket(ticketData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');
  const historySheet = spreadsheet.getSheetByName('History');

  // 必須項目のバリデーション
  if (!ticketData.title || !ticketData.description || !ticketData.type ||
      !ticketData.priority || !ticketData.acceptanceCriteria) {
    throw new Error('必須項目を入力してください。');
  }

  // Type / Priority の許可値
  const allowedTypes = ['Feature', 'Bug', 'Task'];
  const allowedPriorities = ['High', 'Medium', 'Low'];

  if (!allowedTypes.includes(ticketData.type)) {
    throw new Error('Typeの値が不正です。');
  }

  if (!allowedPriorities.includes(ticketData.priority)) {
    throw new Error('Priorityの値が不正です。');
  }

  // Due Date のバリデーション
  let dueDate = '';

  if (ticketData.dueDate) {
    const parsedDate = new Date(ticketData.dueDate);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Due Dateの値が不正です。');
    }

    dueDate = parsedDate;
  }

  // GitHub Issue番号のバリデーション
  let githubIssue = '';

  if (ticketData.githubIssue) {
    const issueNumber = Number(ticketData.githubIssue);

    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      throw new Error('GitHub Issue番号は1以上の整数で入力してください。');
    }

    githubIssue = issueNumber;
  }

  // Ticket IDを自動採番
  const lastRow = ticketsSheet.getLastRow();
  const ticketId = `T${String(lastRow).padStart(3, '0')}`;

  // 現在時刻
  const now = new Date();

  // Reporter ID
  const reporterId = 'U001';

  // Ticketsシートへ保存
  ticketsSheet.appendRow([
    ticketId,
    ticketData.title,
    ticketData.description,
    ticketData.type,
    ticketData.priority,
    'Open',
    ticketData.assigneeId || '',
    reporterId,
    ticketData.reviewerId || '',
    ticketData.acceptanceCriteria,
    dueDate,
    githubIssue,
    '',
    now,
    now
  ]);

  // Historyシートへ作成履歴を保存
  const historyLastRow = historySheet.getLastRow();
  const historyId = `H${String(historyLastRow).padStart(3, '0')}`;

  historySheet.appendRow([
    historyId,
    ticketId,
    'Created',
    '',
    '',
    '',
    reporterId,
    now
  ]);

  return {
    ticketId: ticketId
  };
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

function getTickets() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');

  const values = ticketsSheet.getDataRange().getValues();

  // ヘッダー行だけの場合は空配列を返す
  if (values.length <= 1) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map((row) => {
    const ticket = {};

    headers.forEach((header, index) => {
      let value = row[index];

      // Date型は文字列に変換してブラウザへ返す
      if (value instanceof Date) {
        value = Utilities.formatDate(
          value,
          Session.getScriptTimeZone(),
          'yyyy-MM-dd HH:mm:ss'
        );
      }

      ticket[header] = value;
    });

    return ticket;
  });
}

function testGetTickets() {
  const tickets = getTickets();
  console.log(tickets);
}