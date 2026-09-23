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

  // 蠢・磯・岼縺ｮ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (!ticketData.title || !ticketData.description || !ticketData.type ||
      !ticketData.priority || !ticketData.acceptanceCriteria) {
    throw new Error('蠢・磯・岼繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
  }

  // Type / Priority 縺ｮ險ｱ蜿ｯ蛟､
  const allowedTypes = ['Feature', 'Bug', 'Task'];
  const allowedPriorities = ['High', 'Medium', 'Low'];

  if (!allowedTypes.includes(ticketData.type)) {
    throw new Error('Type縺ｮ蛟､縺御ｸ肴ｭ｣縺ｧ縺吶・);
  }

  if (!allowedPriorities.includes(ticketData.priority)) {
    throw new Error('Priority縺ｮ蛟､縺御ｸ肴ｭ｣縺ｧ縺吶・);
  }

  // Due Date 縺ｮ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  let dueDate = '';

  if (ticketData.dueDate) {
    const parsedDate = new Date(ticketData.dueDate);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Due Date縺ｮ蛟､縺御ｸ肴ｭ｣縺ｧ縺吶・);
    }

    dueDate = parsedDate;
  }

  // GitHub Issue逡ｪ蜿ｷ縺ｮ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  let githubIssue = '';

  if (ticketData.githubIssue) {
    const issueNumber = Number(ticketData.githubIssue);

    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      throw new Error('GitHub Issue逡ｪ蜿ｷ縺ｯ1莉･荳翫・謨ｴ謨ｰ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
    }

    githubIssue = issueNumber;
  }

  // Ticket ID繧定・蜍墓治逡ｪ
  const lastRow = ticketsSheet.getLastRow();
  const ticketId = `T${String(lastRow).padStart(3, '0')}`;

  // 迴ｾ蝨ｨ譎ょ綾
  const now = new Date();

  // Reporter ID
  const reporterId = 'U001';

  // Tickets繧ｷ繝ｼ繝医∈菫晏ｭ・  ticketsSheet.appendRow([
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

  // History繧ｷ繝ｼ繝医∈菴懈・螻･豁ｴ繧剃ｿ晏ｭ・  const historyLastRow = historySheet.getLastRow();
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

  // 繝倥ャ繝繝ｼ陦後□縺代・蝣ｴ蜷医・遨ｺ驟榊・繧定ｿ斐☆
  if (values.length <= 1) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map((row) => {
    const ticket = {};

    headers.forEach((header, index) => {
      let value = row[index];

      // Date蝙九・譁・ｭ怜・縺ｫ螟画鋤縺励※繝悶Λ繧ｦ繧ｶ縺ｸ霑斐☆
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

      headers.forEach((header, index) => {
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
