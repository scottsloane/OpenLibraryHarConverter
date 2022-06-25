import * as fs from "fs";
import * as path from "path";
import commandLineArgs from "command-line-args";
import makeDir from "make-dir";

import { extract } from "./har-extract/index.js";
import PDFJoinImage from "./pdf-join-image/index.js";

const optionDefinitions = [{ name: "src", type: String, defaultOption: true }];
const options = commandLineArgs(optionDefinitions);

// if no source is passed exit
if (!options.src) {
  console.error("Please provide a har source file.");
  process.exit(1);
}

// Function to find a needle in a file folder
const findInFolder = (p, search) => {
  let dir_contents = fs.readdirSync(p);

  for (let dir of dir_contents) {
    if (search(dir)) return path.join(p, dir);
  }
};

// A promisfied fs.rm function
const rm = (p, options) => {
  return new Promise((resolve) => {
    fs.rm(p, options, () => {
      resolve();
    });
  });
};

// MAIN function is async
(async () => {
  // Ensure temp dir structure is setup
  await makeDir("./temp_dir/");
  await makeDir("./temp_dir/pages/");
  await makeDir("./temp_dir/current/");

  const imageList = [];
  let bookname;

  // Extract supplied HAR to temp_dir/current
  try {
    const harContent = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), options.src), "utf-8")
    );
    extract(harContent, {
      verbose: false,
      dryRun: false,
      removeQueryString: false,
      outputDir: "./temp_dir/current",
    });
  } catch (error) {
    console.error(error);
  }

  // navigate temp_dir to archive.org/ia902904.us.archive.org/BookReader/
  let iaFolder = path.join(
    findInFolder("./temp_dir/current", (d) => d.indexOf("ia") === 0),
    "BookReader"
  );

  // find BookReaderImages in iaFolder
  let brImagesFolder = findInFolder(
    iaFolder,
    (d) => d.indexOf("BookReaderImages") === 0
  );

  // Loop through BookReaderImages directory obtaining each folder
  let contents = fs.readdirSync(brImagesFolder);
  for (let folder of contents) {
    let pages = path.join(
      brImagesFolder,
      folder,
      fs.readdirSync(path.join(brImagesFolder, folder))[0],
      "items"
    );

    // Enter each folder and navigate to the zip file
    let pageDir = fs.readdirSync(pages)[0];
    let filename = path.join(
      pages,
      pageDir,
      fs.readdirSync(path.join(pages, pageDir))[0]
    );

    // Store the zip file as {name}{page(two digit)}pack_jp2.zip --> {name}-{page}.png in the temp_dir/pages
    let imagename = folder.split(".")[0] + ".png";
    bookname = imagename.split("_")[0];
    let newimage = path.join("./temp_dir/pages/", imagename);
    imageList.push(newimage);
    fs.renameSync(filename, newimage);
  }

  // Combine the png files in temp_dir/pages into a PDF
  PDFJoinImage(imageList, path.join("./", `${bookname}.pdf`));

  //cleanup
  await rm("./temp_dir/", { recursive: true });
})();
