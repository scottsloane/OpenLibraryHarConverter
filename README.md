# OpenLibraryHarConverter

OpenLibraryHarConverter converts HAR files saved from archive.org's openlibrary.org to PDF. This project is a proof of concept and is not intended to be used to save any media that you do not own the rights to.

## Usage

`olhc.exe pathto.har`

olhc.exe is found in the ./dist folder

## Creating a HAR

1. Navigate to the OpenLibrary
2. Selete a book to check out
3. Open Developer Tools and open the Network tab
4. Check out the book you selected
5. Page through all pages of the book with Developer Tools open
6. Right mouse click on the content in the Network Tab of the Developer Tools and select "Save all as HAR with content"
7. Save the file

## Building from source

This project uses **caxa** to build windows executables.

`yarn run build`
