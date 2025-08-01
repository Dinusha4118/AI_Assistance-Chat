// Main Code.gs file
const SPREADSHEET_ID = '1k1obMTJYjNmihXK9tL8d4oUHNQIzEcVZfnm3jAL6RzE';

/**
 * Helper function to safely get a sheet by name
 * @param {string} name The name of the sheet to get.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The sheet object or null if not found.
 */
function getSheet(name) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      Logger.log(`Sheet "${name}" not found`);
      return null;
    }
    return sheet;
  } catch (e) {
    Logger.log(`Error accessing sheet "${name}": ${e.toString()}`);
    return null;
  }
}

// Helper functions to get specific sheets
function getTicketsSheet() {
  return getSheet('Tickets');
}

function getUsersSheet() {
  return getSheet('Users');
}

function getInquiryTypesSheet() {
  return getSheet('InquiryTypes');
}

function getEmailTemplatesSheet() {
  return getSheet('EmailTemplates');
}

function getAllTickets() {
  try {
    const sheet = getSheet('Tickets');
    if (!sheet) {
      Logger.log('Tickets sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      Logger.log('No ticket data found');
      return [];
    }
    
    const tickets = [];
    
    // Skip header row (index 0), start from row 1
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip completely empty rows
      if (!row[0] && !row[1] && !row[2]) continue;
      
      // Only process rows that have at least an ID
      if (row[0]) {
        tickets.push({
          id: row[0] || '',
          date: row[1] || new Date(),
          name: row[2] || 'Unknown',
          email: row[3] || '',
          faculty: row[4] || '',
          department: row[5] || '',
          inquiryType: row[6] || '',
          subject: row[7] || '',
          description: row[8] || '',
          status: row[9] || 'Open',
          priority: row[10] || 'Medium',
          assignee: row[11] || '',
          resolutionNotes: row[12] || ''
        });
      }
    }
    
    Logger.log('Retrieved ' + tickets.length + ' tickets');
    return tickets.reverse(); // Show newest first
  } catch (error) {
    Logger.log('Error in getAllTickets: ' + error.toString());
    return [];
  }
}

function getDashboardData() {
  try {
    const sheetTickets = getSheet('Tickets');
    const sheetUsers = getSheet('Users');
    
    if (!sheetTickets || !sheetUsers) {
      Logger.log('Required sheets not found');
      return {
        totalTickets: 0,
        pendingTickets: 0,
        resolvedTickets: 0,
        registeredUsers: 0,
        statusCounts: { 'Open': 0, 'In Progress': 0, 'Resolved': 0 },
        typeCounts: [],
        recentTickets: []
      };
    }

    const tickets = sheetTickets.getDataRange().getValues();
    const users = sheetUsers.getDataRange().getValues();
    
    const statusCounts = { 'Open': 0, 'In Progress': 0, 'Resolved': 0 };
    const typeCounts = {};
    
    // Process tickets (skip header row)
    for (let i = 1; i < tickets.length; i++) {
      const row = tickets[i];
      if (!row[0]) continue; // Skip empty rows
      
      const status = row[9] || 'Open'; // Column J (index 9)
      const type = row[6] || 'General'; // Column G (index 6)
      
      // Count by status
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts['Open']++; // Default to Open if status not recognized
      }
      
      // Count by type
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
    
    const typeCountsArray = Object.keys(typeCounts).map(type => ({ 
      type: type, 
      count: typeCounts[type] 
    }));
    
    // Get recent tickets (last 5)
    const recentTickets = [];
    const startRow = Math.max(1, tickets.length - 5);
    for (let i = tickets.length - 1; i >= startRow; i--) {
      const row = tickets[i];
      if (row[0]) { // Has ticket ID
        recentTickets.push({
          id: row[0],
          subject: row[7] || 'No Subject',
          status: row[9] || 'Open',
          date: row[1] || new Date()
        });
      }
    }
    
    const result = {
      totalTickets: Math.max(0, tickets.length - 1), // Subtract header row
      pendingTickets: statusCounts['Open'] + statusCounts['In Progress'],
      resolvedTickets: statusCounts['Resolved'],
      registeredUsers: Math.max(0, users.length - 1), // Subtract header row
      statusCounts: statusCounts,
      typeCounts: typeCountsArray,
      recentTickets: recentTickets
    };
    
    Logger.log('Dashboard data retrieved successfully');
    return result;
    
  } catch (error) {
    Logger.log('Error in getDashboardData: ' + error.toString());
    return {
      totalTickets: 0,
      pendingTickets: 0,
      resolvedTickets: 0,
      registeredUsers: 0,
      statusCounts: { 'Open': 0, 'In Progress': 0, 'Resolved': 0 },
      typeCounts: [],
      recentTickets: []
    };
  }
}

// =================================================================
// MAIN APPLICATION ENTRY POINT
// =================================================================
function doGet(e) {
  var page = e.parameter.page;
  
  // Explicitly check if we should show login/signup pages
  if (!page || page === 'Login') {
    return HtmlService.createTemplateFromFile('Login')
      .evaluate()
      .setTitle('Login')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } 
  else if (page === 'Signup') {
    return HtmlService.createTemplateFromFile('Signup')
      .evaluate()
      .setTitle('Sign Up')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  else if (page === 'AdminView') {
    return HtmlService.createTemplateFromFile('AdminView')
      .evaluate()
      .setTitle('Admin Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  else if (page === 'Index') {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Help Desk')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  else if (page === 'ResetPassword') {
    var template = HtmlService.createTemplateFromFile('ResetPassword');
    template.token = e.parameter.token || '';
    return template.evaluate()
      .setTitle('Reset Password')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Default to login page if no valid page specified
  return HtmlService.createTemplateFromFile('Login')
    .evaluate()
    .setTitle('Login')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function logNavigation(sectionId) {
  Logger.log("Navigated to: " + sectionId);
  return true;
}

// =================================================================
// USER MANAGEMENT FUNCTIONS
// =================================================================
function getCurrentUser() {
  const userEmail = Session.getActiveUser().getEmail();
  const usersSheet = getUsersSheet();
  
  if (!usersSheet) {
    return { name: 'Admin', email: userEmail, role: 'admin' };
  }
  
  const users = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < users.length; i++) {
    if (users[i][1] === userEmail) {
      return {
        name: users[i][0],
        email: users[i][1],
        role: users[i][3]
      };
    }
  }
  
  return { name: 'Admin', email: userEmail, role: 'admin' };
}

function getAllUsers() {
  const usersSheet = getUsersSheet();
  if (!usersSheet) return [];
  
  const users = usersSheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < users.length; i++) {
    if (users[i][0]) { // Has name
      result.push({
        name: users[i][0], 
        email: users[i][1], 
        role: users[i][3],
        active: users[i][4], 
        created: users[i][5], 
        lastLogin: users[i][6]
      });
    }
  }
  
  return result;
}

function getUsers() {
  const usersSheet = getUsersSheet();
  if (!usersSheet) {
    Logger.log('Warning: "Users" sheet not found.');
    return [];
  }
  
  const data = usersSheet.getDataRange().getValues();
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) { // Skip rows without a name or email
      users.push({
        name: data[i][0],
        email: data[i][1] 
      });
    }
  }
  return users;
}

function addUser(userData) {
  const usersSheet = getUsersSheet();
  if (!usersSheet) {
    throw new Error('Users sheet not found');
  }
  
  const hashedPassword = Utilities.base64Encode(userData.password);
  
  usersSheet.appendRow([
    userData.name, 
    userData.email, 
    hashedPassword, 
    userData.role,
    true, 
    new Date(), 
    null, 
    userData.role 
  ]);
  
  return { success: true };
}

function deleteUser(email) {
  const usersSheet = getUsersSheet();
  if (!usersSheet) {
    throw new Error('Users sheet not found');
  }
  
  const users = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < users.length; i++) {
    if (users[i][1] === email) {
      usersSheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  return { success: false, message: 'User not found' };
}

// =================================================================
// TICKET MANAGEMENT FUNCTIONS
// =================================================================
function getTicketDetails(ticketId) {
  const ticketsSheet = getTicketsSheet();
  if (!ticketsSheet) return null;
  
  const tickets = ticketsSheet.getDataRange().getValues();
  const cleanTicketId = ticketId.trim().toUpperCase();
  
  for (let i = 1; i < tickets.length; i++) {
    if (String(tickets[i][0]).trim().toUpperCase() === cleanTicketId) {
      return {
        id: tickets[i][0], 
        date: tickets[i][1], 
        name: tickets[i][2],
        email: tickets[i][3], 
        faculty: tickets[i][4], 
        department: tickets[i][5],
        inquiryType: tickets[i][6], 
        subject: tickets[i][7], 
        description: tickets[i][8],
        status: tickets[i][9], 
        priority: tickets[i][10], 
        assignee: tickets[i][11],
        resolutionNotes: tickets[i][12]
      };
    }
  }
  
  return null;
}

function updateTicketDetails(ticketData) {
  const ticketsSheet = getTicketsSheet();
  if (!ticketsSheet) {
    throw new Error('Tickets sheet not found');
  }
  
  const tickets = ticketsSheet.getDataRange().getValues();
  
  for (let i = 1; i < tickets.length; i++) {
    if (String(tickets[i][0]).trim().toUpperCase() === ticketData.ticketId.trim().toUpperCase()) {
      const row = i + 1;
      const originalStatus = tickets[i][9];

      ticketsSheet.getRange(row, 10).setValue(ticketData.status);
      ticketsSheet.getRange(row, 11).setValue(ticketData.priority);
      ticketsSheet.getRange(row, 12).setValue(ticketData.assignee);
      ticketsSheet.getRange(row, 13).setValue(ticketData.resolutionNotes);
      
      if (ticketData.status === 'Resolved' && !tickets[i][13]) {
        ticketsSheet.getRange(row, 14).setValue(new Date());
      }
      
      return { success: true };
    }
  }
  
  return { success: false, message: 'Ticket not found' };
}

function getTicketStatus(ticketId) {
  try {
    const ticketsSheet = getTicketsSheet();
    if (!ticketsSheet) return null;
    
    const data = ticketsSheet.getDataRange().getValues();
    if (data.length <= 1) return null;
    
    const headers = data[0];
    
    // Find column indexes dynamically
    const idIndex = headers.indexOf("ID");
    const dateIndex = headers.indexOf("Date");
    const statusIndex = headers.indexOf("Status");
    const subjectIndex = headers.indexOf("Subject");
    const descriptionIndex = headers.indexOf("Description");
    const resolutionNotesIndex = headers.indexOf("Resolution Notes");
    
    // Clean the input from the user
    const cleanTicketId = ticketId.trim().toUpperCase();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[idIndex]) continue; // Skip empty rows
      
      // Compare ticket IDs (case-insensitive)
      if (String(row[idIndex]).trim().toUpperCase() === cleanTicketId) {
        return {
          id: row[idIndex],
          date: row[dateIndex],
          status: row[statusIndex],
          subject: row[subjectIndex],
          description: row[descriptionIndex],
          resolutionNotes: row[resolutionNotesIndex] || ""
        };
      }
    }
    
    return null; // Return null if no match is found
  } catch (e) {
    Logger.log("Error in getTicketStatus: " + e.toString());
    return null;
  }
}

// =================================================================
// INQUIRY TYPES AND TEMPLATES
// =================================================================
function getInquiryTypes() {
  const inquiryTypesSheet = getInquiryTypesSheet();
  if (!inquiryTypesSheet) return [];
  
  const data = inquiryTypesSheet.getDataRange().getValues();
  const types = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; // Skip empty rows
    types.push({
      id: data[i][0],
      name: data[i][1],
      description: data[i][2],
      defaultAssignee: data[i][3]
    });
  }
  
  return types;
}

function getEmailTemplates() {
  const emailTemplatesSheet = getEmailTemplatesSheet();
  if (!emailTemplatesSheet) return [];
  
  const data = emailTemplatesSheet.getDataRange().getValues();
  const templates = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Has ID
      templates.push({
        id: data[i][0],
        trigger: data[i][1],
        subject: data[i][2],
        body: data[i][3]
      });
    }
  }
  
  return templates;
}

function saveEmailTemplate(template) {
  const emailTemplatesSheet = getEmailTemplatesSheet();
  if (!emailTemplatesSheet) {
    throw new Error('EmailTemplates sheet not found');
  }
  
  const data = emailTemplatesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === template.id) {
      emailTemplatesSheet.getRange(i + 1, 3).setValue(template.subject);
      emailTemplatesSheet.getRange(i + 1, 4).setValue(template.body);
      return { success: true };
    }
  }
  
  // If not found, add new template
  emailTemplatesSheet.appendRow([
    template.id,
    template.trigger,
    template.subject,
    template.body
  ]);
  return { success: true };
}

function addInquiryType(typeData) {
  const inquiryTypesSheet = getInquiryTypesSheet();
  if (!inquiryTypesSheet) {
    throw new Error('InquiryTypes sheet not found');
  }
  
  const id = Utilities.getUuid().substring(0, 8).toUpperCase();
  
  inquiryTypesSheet.appendRow([
    id,
    typeData.name,
    typeData.description,
    typeData.defaultAssignee
  ]);
  
  return { success: true };
}

// =================================================================
// SETTINGS AND SYSTEM FUNCTIONS
// =================================================================
function getSystemSettings() {
  // For a real app, store these in PropertiesService or a dedicated sheet
  return {
    systemName: 'University Help Desk',
    adminEmail: 'helpdesk@kln.ac.lk',
    ticketPrefix: 'TKT'
  };
}

function saveSystemSettings(settings) {
  // Logic to save settings would go here
  return { success: true };
}

function logout() {
  // In Apps Script, server-side logout is not possible.
  // This function simply returns the URL for the client to redirect.
  return ScriptApp.getService().getUrl();
}