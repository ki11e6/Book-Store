const PDFDocument = require('pdfkit');
const fs = require('fs');

function invoiceGenerator(res, invoiceName, invoicePath, order) {
  const pdfDoc = new PDFDocument();
  res.setHeader('Content-type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + invoiceName + '"'
  );
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.text('This is invoice');
  pdfDoc.fontSize(26).text('Invoice', {
    underline: true,
  });
  pdfDoc.text('-----------------------');
  let totalPrice = 0;
  order.products.forEach((prod) => {
    totalPrice += prod.quantity * prod.product.price;
    pdfDoc
      .fontSize(14)
      .text(
        prod.product.title +
          ' - ' +
          prod.quantity +
          ' x ' +
          '$' +
          prod.product.price
      );
  });
  pdfDoc.text('---');
  pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
  pdfDoc.end();
}

module.exports = invoiceGenerator;
