import PDFKit from "pdfkit";
import fs from "fs";

export default (images, output) => {
  const pdf = new PDFKit({
    autoFirstPage: false,
  });
  pdf.pipe(fs.createWriteStream(output));
  for (let image of images) {
    let img = pdf.openImage(image);
    pdf.addPage({ size: [img.width, img.height] });
    pdf.image(img, 0, 0);
  }
  pdf.end();
};
