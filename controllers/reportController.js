const expenses = require("../models/expense");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
const { Op } = require("sequelize");
const fs = require("fs");

exports.generateExpenseReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const format = req.query.format || "pdf";
    const monthNumber = parseInt(req.query.month) || new Date().getMonth() + 1;
    const monthName = getMonthName(monthNumber);

    const startOfMonth = new Date(new Date().getFullYear(), monthNumber - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), monthNumber, 0);

    const Expenses = await expenses.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth,
        },
      },
      attributes: ["expenseAmount", "description", "category", "createdAt"],
    });

    const data = Expenses.map((e) => e.get({ plain: true }));

    switch (format.toLowerCase()) {
      case "xlsx":
        await generateExcelReport(data, res, monthName);
        break;
      case "csv":
        generateCSVReport(data, res);
        break;
      default:
        generatePDFReport(data, res, monthName);
        break;
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Failed to generate report");
  }
};

function generatePDFReport(monthlyData, res, month) {
  const doc = new PDFDocument();
  const filename = `ExpenseReport_${month}_${Date.now()}.pdf`;
  res.setHeader("Content-disposition", "attachment; filename=" + filename);
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  doc
    .fontSize(16)
    .text(`Monthly Expense Report - ${month}`, { align: "center" })
    .moveDown()
    .lineWidth(1)
    .moveTo(100, doc.y)
    .lineTo(500, doc.y)
    .stroke();

  doc.moveDown().fontSize(12);
  const headersY = doc.y;
  doc
    .text("Amount", 100, headersY, { width: 90, align: "left" })
    .text("Description", 190, headersY, { width: 150, align: "left" })
    .text("Category", 340, headersY, { width: 100, align: "left" })
    .text("Date", 440, headersY, { width: 100, align: "left" });

  monthlyData.forEach((expense) => {
    const startY = doc.y + 10; // Adjust the space between rows here
    doc.fontSize(10);
    doc
      .text(expense.expenseAmount, 100, startY, { width: 90, align: "left" })
      .moveUp()
      .text(expense.description, 190, startY, { width: 150, align: "left" })
      .moveUp()
      .text(expense.category, 340, startY, { width: 100, align: "left" })
      .moveUp()
      .text(expense.createdAt, 440, startY, { width: 100, align: "left" });
  });

  doc.end();
}
async function generateExcelReport(data, res, month) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Expenses");

  // Adding Month Name as a Title
  worksheet.mergeCells("A1:D1");
  worksheet.getCell("A1").value = `Monthly Expense Report - ${month}`;
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // Define columns with headers
  worksheet.columns = [
    { header: "Amount", key: "expenseAmount", width: 10 },
    { header: "Description", key: "description", width: 30 },
    { header: "Category", key: "category", width: 15 },
    { header: "Date", key: "createdAt", width: 20 },
  ];

  // Add data to worksheet
  worksheet.addRows(data);

  // Styling headers
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: "center" };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `ExpenseReport_${month}_${Date.now()}.xlsx`
  );
  await workbook.xlsx.write(res);
  res.end();
}
function generateCSVReport(data, res) {
  const parser = new Parser({
    fields: ["expenseAmount", "description", "category", "createdAt"],
  });
  const csv = parser.parse(data);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `ExpenseReport_${Date.now()}.csv`
  );
  res.send(csv);
}

function getMonthName(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthNumber - 1];
}
