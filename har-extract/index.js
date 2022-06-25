import * as fs from "fs";
import * as path from "path";

// const { Har, Entry } = require("har-format");

import filenamify from "filenamify";
import humanizeUrl from "humanize-url";
import makeDir from "make-dir";

export const getEntryContentAsBuffer = (entry) => {
  const content = entry.response.content;
  const text = content.text;
  if (text === undefined) {
    return;
  }
  if (content.encoding === "base64") {
    return Buffer.from(text, "base64");
  } else {
    return Buffer.from(text);
  }
};

export const convertEntryAsFilePathFormat = (
  entry,
  removeQueryString = false
) => {
  const requestURL = entry.request.url;
  const stripSchemaURL = humanizeUrl(
    removeQueryString ? requestURL.split("?")[0] : requestURL
  );
  const dirnames = stripSchemaURL.split("/").map((pathname) => {
    return filenamify(pathname, { maxLength: 255 });
  });
  const fileName = dirnames[dirnames.length - 1];
  if (
    fileName &&
    !fileName.includes(".html") &&
    entry.response.content.mimeType &&
    entry.response.content.mimeType.includes("text/html")
  ) {
    return dirnames.join("/") + "/index.html";
  }
  return dirnames.join("/");
};

export const extract = (harContent, options) => {
  harContent.log.entries.forEach((entry) => {
    const buffer = getEntryContentAsBuffer(entry);
    if (!buffer) {
      return;
    }
    const outputPath = path.join(
      options.outputDir,
      convertEntryAsFilePathFormat(entry, options.removeQueryString)
    );
    if (!options.dryRun) {
      makeDir.sync(path.dirname(outputPath));
    }
    if (options.verbose) {
      console.log(outputPath);
    }
    if (!options.dryRun) {
      fs.writeFileSync(outputPath, buffer);
    }
  });
};
