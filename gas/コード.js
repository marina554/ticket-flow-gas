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

  sheetNames.forEach(function(sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    console.log(sheetName + ': ' + (sheet ? 'OK' : 'NOT FOUND'));
  });
}

function doGet(e) {
  if (e && e.parameter.page === 'detail') {
    const template = HtmlService.createTemplateFromFile('detail');
    template.ticketId = e.parameter.ticketId || '';
    return template.evaluate();
  }

  if (e && e.parameter.page === 'edit') {
    const template = HtmlService.createTemplateFromFile('edit');
    template.ticketId = e.parameter.ticketId || '';
    return template.evaluate();
  }

  return HtmlService.createTemplateFromFile('index').evaluate();
}

function createTicket(ticketData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');
  const historySheet = spreadsheet.getSheetByName('History');

  if (
    !ticketData.title ||
    !ticketData.description ||
    !ticketData.type ||
    !ticketData.priority ||
    !ticketData.acceptanceCriteria
  ) {
    throw new Error('必須項目を入力してください。');
  }

  const allowedTypes = ['Feature', 'Bug', 'Task'];
  const allowedPriorities = ['High', 'Medium', 'Low'];

  if (!allowedTypes.includes(ticketData.type)) {
    throw new Error('Typeの値が不正です。');
  }

  if (!allowedPriorities.includes(ticketData.priority)) {
    throw new Error('Priorityの値が不正です。');
  }

  let dueDate = '';

  if (ticketData.dueDate) {
    const parsedDate = new Date(ticketData.dueDate);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Due Dateの値が不正です。');
    }

    dueDate = parsedDate;
  }

  let githubIssue = '';

  if (ticketData.githubIssue) {
    const issueNumber = Number(ticketData.githubIssue);

    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      throw new Error(
        'GitHub Issue番号は1以上の整数で入力してください。'
      );
    }

    githubIssue = issueNumber;
  }

  const lastRow = ticketsSheet.getLastRow();
  const ticketId =
    'T' + String(lastRow).padStart(3, '0');

  const now = new Date();
  const reporterId = 'U001';

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

  const historyLastRow = historySheet.getLastRow();
  const historyId =
    'H' + String(historyLastRow).padStart(3, '0');

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
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

function getTickets() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');

  const values = ticketsSheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(function(row) {
    const ticket = {};

    headers.forEach(function(header, index) {
      let value = row[index];

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

function testDetailTemplate() {
  const html = HtmlService
    .createHtmlOutputFromFile('detail')
    .getContent();

  console.log(html);
}

function getTicketById(ticketId) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');

  const values = ticketsSheet.getDataRange().getValues();

  if (values.length <= 1) {
    return null;
  }

  const headers = values[0];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (row[0] === ticketId) {
      const ticket = {};

      headers.forEach(function(header, index) {
        let value = row[index];

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
    }
  }

  return null;
}

function updateTicket(ticketData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ticketsSheet = spreadsheet.getSheetByName('Tickets');
  const historySheet = spreadsheet.getSheetByName('History');

  // 必須項目のバリデーション
  if (
    !ticketData.title ||
    !ticketData.description ||
    !ticketData.type ||
    !ticketData.priority ||
    !ticketData.acceptanceCriteria
  ) {
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

  // GitHub Issue のバリデーション
  let githubIssue = '';

  if (ticketData.githubIssue) {
    const issueNumber = Number(ticketData.githubIssue);

    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      throw new Error(
        'GitHub Issue番号は1以上の整数で入力してください。'
      );
    }

    githubIssue = issueNumber;
  }

  // GitHub PR のバリデーション
  let githubPr = '';

  if (ticketData.githubPr) {
    const prNumber = Number(ticketData.githubPr);

    if (!Number.isInteger(prNumber) || prNumber < 1) {
      throw new Error(
        'GitHub PR番号は1以上の整数で入力してください。'
      );
    }

    githubPr = prNumber;
  }

  // Ticket IDの存在確認
  const values = ticketsSheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error('指定されたチケットが見つかりません。');
  }

  const headers = values[0];
  let targetRow = -1;
  let oldTicket = null;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === ticketData.ticketId) {
      targetRow = i + 1;

      oldTicket = {};

      headers.forEach(function(header, index) {
        oldTicket[header] = values[i][index];
      });

      break;
    }
  }

  if (targetRow === -1) {
    throw new Error('指定されたチケットが見つかりません。');
  }

  // 編集対象の値
  const newValues = {
    'Title': ticketData.title,
    'Description': ticketData.description,
    'Type': ticketData.type,
    'Priority': ticketData.priority,
    'Assignee ID': ticketData.assigneeId || '',
    'Reviewer ID': ticketData.reviewerId || '',
    'Acceptance Criteria': ticketData.acceptanceCriteria,
    'Due Date': dueDate,
    'GitHub Issue': githubIssue,
    'GitHub PR': githubPr
  };

  const actorId = 'U001';
  const now = new Date();

  // 変更された項目をHistoryへ記録
  Object.keys(newValues).forEach(function(field) {
    const oldValue = oldTicket[field];
    const newValue = newValues[field];

    let oldCompareValue = oldValue;
    let newCompareValue = newValue;

    if (oldValue instanceof Date) {
      oldCompareValue = Utilities.formatDate(
        oldValue,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss'
      );
    }

    if (newValue instanceof Date) {
      newCompareValue = Utilities.formatDate(
        newValue,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss'
      );
    }

    if (String(oldCompareValue || '') !== String(newCompareValue || '')) {
      const historyLastRow = historySheet.getLastRow();
      const historyId =
        'H' + String(historyLastRow).padStart(3, '0');

      historySheet.appendRow([
        historyId,
        ticketData.ticketId,
        'Updated',
        field,
        oldCompareValue || '',
        newCompareValue || '',
        actorId,
        now
      ]);
    }
  });

  // Ticketsシートを更新
  ticketsSheet.getRange(targetRow, 2).setValue(newValues['Title']);
  ticketsSheet.getRange(targetRow, 3).setValue(newValues['Description']);
  ticketsSheet.getRange(targetRow, 4).setValue(newValues['Type']);
  ticketsSheet.getRange(targetRow, 5).setValue(newValues['Priority']);
  ticketsSheet.getRange(targetRow, 7).setValue(newValues['Assignee ID']);
  ticketsSheet.getRange(targetRow, 9).setValue(newValues['Reviewer ID']);
  ticketsSheet.getRange(targetRow, 10).setValue(newValues['Acceptance Criteria']);
  ticketsSheet.getRange(targetRow, 11).setValue(newValues['Due Date']);
  ticketsSheet.getRange(targetRow, 12).setValue(newValues['GitHub Issue']);
  ticketsSheet.getRange(targetRow, 13).setValue(newValues['GitHub PR']);
  ticketsSheet.getRange(targetRow, 15).setValue(now);

  return {
    ticketId: ticketData.ticketId
  };
}

function testUpdateTicket() {
  const result = updateTicket({
    ticketId: 'T001',
    title: 'Test Ticket Updated',
    description: 'This is an update test.',
    type: 'Task',
    priority: 'Low',
    assigneeId: 'U001',
    reviewerId: 'U001',
    acceptanceCriteria: 'Update test is completed.',
    dueDate: '',
    githubIssue: '',
    githubPr: ''
  });

  console.log(result);
}

function testUpdateTicketInvalidPriority() {
  try {
    updateTicket({
      ticketId: 'T001',
      title: 'T001 Edit Test',
      description: 'This is an update test.',
      type: 'Task',
      priority: 'Invalid',
      assigneeId: 'U001',
      reviewerId: 'U001',
      acceptanceCriteria: 'Update test is completed.',
      dueDate: '',
      githubIssue: '',
      githubPr: ''
    });

    console.log('ERROR: 不正なPriorityが受け付けられました。');
  } catch (error) {
    console.log('SUCCESS: ' + error.message);
  }
}

function testUpdateTicketInvalidType() {
  try {
    updateTicket({
      ticketId: 'T001',
      title: 'T001 Edit Test',
      description: 'This is an update test.',
      type: 'Invalid',
      priority: 'High',
      assigneeId: 'U001',
      reviewerId: 'U001',
      acceptanceCriteria: 'Update test is completed.',
      dueDate: '',
      githubIssue: '',
      githubPr: ''
    });

    console.log('ERROR: 不正なTypeが受け付けられました。');
  } catch (error) {
    console.log('SUCCESS: ' + error.message);
  }
}

function testUpdateTicketInvalidGithubIssue() {
  try {
    updateTicket({
      ticketId: 'T001',
      title: 'T001 Edit Test',
      description: 'This is an update test.',
      type: 'Task',
      priority: 'High',
      assigneeId: 'U001',
      reviewerId: 'U001',
      acceptanceCriteria: 'Update test is completed.',
      dueDate: '',
      githubIssue: 'abc',
      githubPr: ''
    });

    console.log('ERROR: 不正なGitHub Issue番号が受け付けられました。');
  } catch (error) {
    console.log('SUCCESS: ' + error.message);
  }
}

function testUpdateTicketNotFound() {
  try {
    updateTicket({
      ticketId: 'T999',
      title: 'Not Found Test',
      description: 'This ticket does not exist.',
      type: 'Task',
      priority: 'High',
      assigneeId: 'U001',
      reviewerId: 'U001',
      acceptanceCriteria: 'Not Found test.',
      dueDate: '',
      githubIssue: '',
      githubPr: ''
    });

    console.log('ERROR: 存在しないTicket IDが受け付けられました。');
  } catch (error) {
    console.log('SUCCESS: ' + error.message);
  }
}