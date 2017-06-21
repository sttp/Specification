// Gulp file to merge sections into a single document and convert to HTML/PDF
// 06/19/2017 - James Ritchie Carroll
//
// Prerequisties needed for execution:
//   Install Node Package Manager: https://nodejs.org/en/download/
//   Install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html
//   Add "C:\Program Files\wkhtmltopdf\bin" to your path
//   From command line after NPM install:
//     npm install gulp
//     npm install --global gulp-cli
//     npm install gulp-clean
//     npm install gulp-concat
//     npm install showdown
//     npm install --save showdown-emoji
//     npm install gulp-html2pdf
//     npm install gulp-exec
//
// To execute, just type "gulp" from command window

const gulp = require("gulp");
const clean = require('gulp-clean');
const concat = require("gulp-concat");
const showdown = require("showdown");
const emojis = require("showdown-emoji");
const gutil = require("gulp-util");
const through = require("through2");
const html2pdf = require('gulp-html2pdf');
const exec = require("gulp-exec");

// Define the section files in the order that they should appear
// in the target single combined markdown document:
const sections = [
  "Sections/TitlePage.md",
  "Sections/Preface.md",
  "Sections/README.md" /* TOC */,
  "Sections/Introduction.md",
  "Sections/Definitions.md",
  "Sections/Overview.md",
  /* Balance of sections */
  "Sections/References.md",
  "Sections/Contributors.md",
  "Sections/History.md",
  "Sections/APIReference.md",
  "Sections/IEEE_C37.118Mapping.md",
  "Sections/ToDoList.md"
];

// Define map of markdown file links to intra-page section headers, note
// that GitHub makes all header links lowercase and spaces become dashes:
const sectionLinks = [
  [ "(TitlePage.md)", "(#title-page)" ],
  [ "(Preface.md)", "(#disclaimer)" ],
  [ "(README.md)", "(#table-of-contents)" ],
  [ "(Introduction.md)", "(#introduction)" ],
  [ "(Definitions.md)", "(#definitions-and-nomenclature)" ],
  [ "(Overview.md)", "(#protocol-overview)" ],
  [ "(References.md)", "(#references-and-notes)" ],
  [ "(Contributors.md)", "(#contributors)" ],
  [ "(History.md)", "(#major-version-history)" ],
  [ "(APIReference.md)", "(#appendix-a---sttp-api-reference)" ],
  [ "(IEEE_C37.118Mapping.md)", "(#appendix-b---ieee-c37-118-mapping)" ],
  [ "(ToDoList.md)", "(#specification-development-to-do-list)" ],
  [ "(../LICENSE)", "(https://github.com/sttp/Specification/blob/master/LICENSE)" ]
];

const versionPattern = /^\*\*Version:\*\*\s+\d+\.\d+\.\d+.*$/gm;
const reportOptions = {
    err: true,    // default = true, false means don't write err
    stderr: true, // default = true, false means don't write stderr
    stdout: false // default = true, false means don't write stdout
};

var originalVersionNumber = null;

showdown.setFlavor("github");

function replaceAll(sourceText, findText, replaceWith, ignoreCase) {
  return sourceText.replace(new RegExp(
    findText.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      (ignoreCase ? "gi" : "g")), (typeof replaceWith == "string") ?
        replaceWith.replace(/\$/g, "$$$$") : replaceWith);
}

function getLongDate(date) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  if (!date)
    date = new Date();

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return monthNames[monthIndex] + " " + day + ", " + year;
}

function logOutput(err, stdout, stderr) {
  if (stderr && stderr.length > 0)
    console.log("ERROR: ", stderr);
}

function getDocumentVersion(sourceMarkdown) {
  const versionLineMatch = sourceMarkdown.match(versionPattern);

  if (versionLineMatch) {
    const versionNumberMatch = versionLineMatch[0].match(/\d+\.\d+\.\d+/);
    return versionNumberMatch[0];
  }

  return null;
}

function checkDocumentVersion() {
  return through.obj(function(file, encoding, cb) {
    const versionNumber = getDocumentVersion(file.contents.toString());

    if (versionNumber) {
      console.log("Current version number = " + versionNumber);
      originalVersionNumber = versionNumber;
    }
    else {
      console.log("No version number found in \"" + file.path + "\".");
    }

    this.push(file);
    cb(null, file);
  });
}

function incrementDocumentVersion() {
  return through.obj(function(file, encoding, cb) {
    var sourceMarkdown = file.contents.toString();
    const versionNumber = getDocumentVersion(sourceMarkdown);

    if (versionNumber) {
      const lastDotIndex = versionNumber.lastIndexOf(".");
      const revision = parseInt(versionNumber.substring(lastDotIndex + 1)) + 1;

      sourceMarkdown = sourceMarkdown.replace(versionPattern,
        "**Version:** " + versionNumber.substr(0, lastDotIndex) +
        "." + revision + " - " + getLongDate());

      file.contents = new Buffer(sourceMarkdown);
      this.push(file);

      cb(null, file);
    }
    else {
      cb(new Error("Failed to find version pattern: \"**Version:** #.#.#\""));
    }
  });
}

function checkForUpdates() {
  return through.obj(function(file, encoding, cb) {
    const stdout = file.contents.toString();

    if (stdout && stdout.length > 0) {
      gulp.src("Sections/TitlePage.md")
        .pipe(pushUpdates());
    }

    this.push(file);

    cb(null, file);
  });
}

function pushUpdates() {
  return through.obj(function(file, encoding, cb) {
    const versionNumber = getDocumentVersion(file.contents.toString());

    if (versionNumber) {
      console.log("Tagging local repo with new version number...");

      gulp.src("README.md")
        .pipe(exec("\"%git%\" add ."))
        .pipe(exec.reporter(reportOptions))
        .pipe(exec("\"%git%\" commit -m \"Updated compiled document\""))
        .pipe(exec.reporter(reportOptions))
        .pipe(exec("\"%git%\" tag -f v" + versionNumber))
        .pipe(exec.reporter(reportOptions))
        .pipe(exec("\"%git%\" push"))
        .pipe(exec.reporter(reportOptions));

      this.push(file);

      cb(null, file);
    }
  });
}

function updateSectionLinks() {
  return through.obj(function(file, encoding, cb) {
    var sourceMarkdown = file.contents.toString();

    for (let i = 0; i < sectionLinks.length; i++) {
      findText = sectionLinks[i][0];
      replaceWith = sectionLinks[i][1];
      sourceMarkdown = replaceAll(sourceMarkdown, findText, replaceWith);
    }

    file.contents = new Buffer(sourceMarkdown);
    this.push(file);

    cb(null, file);
  });
}

function markdown2html() {
  return through.obj(function(file, encoding, cb) {
    const converter = new showdown.Converter({ extensions: [emojis] });
    const sourceMarkdown = file.contents.toString();
    var destinationHtml = converter.makeHtml(sourceMarkdown);

    // Convert local image links to non-relative permanent paths
    destinationHtml = replaceAll(
      destinationHtml,
      "<img src=\"Images/",
      "<img src=\"https://raw.githubusercontent.com/sttp/Specification/master/Output/Images/"
    );

    file.contents = new Buffer(destinationHtml);
    file.path = gutil.replaceExtension(file.path, ".html");
    this.push(file);

    cb(null, file);
  });
}

gulp.task("check-version", [], function() {
  console.log("Checking document version...");

  return gulp.src("Sections/TitlePage.md")
    .pipe(checkDocumentVersion());
});

gulp.task("clear-output", [ "check-version" ], function() {
  console.log("Clearing output folder...");

  return gulp.src([
      "Output/Images/",
      "Output/Include/",
      "Output/*"
    ], { read: false })
    .pipe(clean());
});

gulp.task("increment-version", [ "clear-output" ], function() {
  console.log("Incrementing document version number...")

  return gulp.src("Sections/TitlePage.md")
    .pipe(incrementDocumentVersion())
    .pipe(gulp.dest("Sections/"));
});

gulp.task("copy-to-output", [ "increment-version" ], function() {
  console.log("Copying target files to output folder...");

  gulp.src("Sections/Images/*")
    .pipe(gulp.dest("Output/Images/"));

  return gulp.src("Sections/Include/*")
    .pipe(gulp.dest("Output/Include/"));
});

gulp.task("merge-markdown", [ "copy-to-output" ], function() {
  console.log("Combining all markdown into a single file...");

  return gulp.src(sections)
    .pipe(concat("README.md"))
    .pipe(updateSectionLinks())
    .pipe(gulp.dest("Output/"));
});

gulp.task("convert-to-html", [ "merge-markdown" ], function() {
  console.log("Converting markdown to HTML...");

  return gulp.src("Output/README.md")
    .pipe(markdown2html())
    .pipe(gulp.dest("Output/"));
});

gulp.task("complete-html", [ "convert-to-html" ], function() {
  console.log("Adding header and footer to HTML...");

  return gulp.src([
      "Output/Include/_header.html",
      "Output/README.html",
      "Output/Include/_footer.html"
    ])
    .pipe(concat("sttp-specification.html"))
    .pipe(gulp.dest("Output/"));
});

gulp.task("convert-to-pdf", [ "complete-html" ], function() {
  console.log("Converting HTML to PDF...");

  return gulp.src("Output/sttp-specification.html")
    .pipe(html2pdf())
    .pipe(gulp.dest("Output/"));
});

gulp.task("clean-up", [ "convert-to-pdf" ], function() {
  console.log("Removing temporary files...");

  return gulp.src([
    "Output/Include/",
    "Output/README.html"
  ], { read: false })
  .pipe(clean());
});

gulp.task("default", [ "clean-up" ]);

gulp.task("push-changes", [ "clean-up" ],  function() {
  console.log("Checking for updates...");

  const options = { pipeStdout: true };

  gulp.src("README.md")
    .pipe(exec("\"%git%\" log v" + originalVersionNumber + "..", options))
    .pipe(checkForUpdates());
});

gulp.task("update-repo", function() {
  console.log("Updating local repo...");

  gulp.src("README.md")
    .pipe(exec("\"%git%\" gc"))
    .pipe(exec.reporter(reportOptions))
    .pipe(exec("\"%git%\" fetch"))
    .pipe(exec.reporter(reportOptions))
    .pipe(exec("\"%git%\" reset --hard origin/master"))
    .pipe(exec.reporter(reportOptions))
    .pipe(exec("\"%git%\" clean -f -d -x"))
    .pipe(exec.reporter(reportOptions));
});
