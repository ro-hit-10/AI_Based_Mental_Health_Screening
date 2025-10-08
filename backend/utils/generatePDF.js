const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePDF = (userData, reportData, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text("Mental Health Progress Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${userData.name}`);
    doc.text(`Email: ${userData.email}`);
    doc.text(`Age: ${userData.age}`);
    doc.text(`Gender: ${userData.gender}`);
    doc.text(`Occupation: ${userData.occupation}`);
    doc.text(`Location: ${userData.location}`);
    doc.moveDown();

    reportData.forEach((entry, index) => {
      doc.text(`Session ${index + 1}:`);
      doc.text(`Date: ${entry.date}`);
      doc.text(`Depression Level: ${entry.depression_level}`);
      doc.text(`Suggestions: ${entry.suggestions}`);
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generatePDF;