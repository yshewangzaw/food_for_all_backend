const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

async function sendCsv(res, rows, filename, fields) {
  const parser = new Parser({ fields });
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${filename}.csv`);
  return res.send(csv);
}

async function sendXlsx(res, rows, filename, fields) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(filename);
  ws.columns = fields.map((f) => ({ header: f, key: f, width: 20 }));
  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };

  res.header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.attachment(`${filename}.xlsx`);
  await wb.xlsx.write(res);
  return res.end();
}

module.exports = { sendCsv, sendXlsx };