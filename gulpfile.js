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
//     npm install gulp-util
//     npm install gulp-clean
//     npm install gulp-concat
//     npm install showdown
//     npm install --save showdown-emoji
//     npm install gulp-html2pdf
//     npm install gulp-exec
//     npm install gulp-notify
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
const notify = require("gulp-notify");

// Define non-relative URL root path for any relative paths
const rootPath = "https://raw.githubusercontent.com/sttp/Specification/master";

// Define section file that contains version number
const versionFile = "Sections/TitlePage.md";

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
  [ "(../LICENSE)", "(" + rootPath + "/LICENSE)" ]
];

// Any git functionality expects existing "git" environmental variable
const isWin = /^win/.test(process.platform);
const git = isWin ? "\"%git%\"" : "#git#";
const versionPattern = /^\*\*Version:\*\*\s+\d+\.\d+\.\d+.*$/gm;
const execReportOptions = {
    err: true,    // default = true, false means don't write err
    stderr: true, // default = true, false means don't write stderr
    stdout: false // default = true, false means don't write stdout
};

var currentVersion = null;
var updatedVersion = null;

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

function checkDocumentVersion() {
  return through.obj(function(file, encoding, cb) {
    const versionLineMatch = file.contents.toString().match(versionPattern);

    if (versionLineMatch) {
      const versionNumber = versionLineMatch[0].match(/\d+\.\d+\.\d+/)[0];
      console.log("Current version number = " + versionNumber);

      currentVersion = versionNumber;

      this.push(file);
      cb(null, file);
    }
    else {
      cb(new Error("Failed to find version pattern: \"**Version:** #.#.#\""));
    }
  });
}

function incrementDocumentVersion() {
  return through.obj(function(file, encoding, cb) {
    const lastDotIndex = currentVersion.lastIndexOf(".");
    const revision = parseInt(currentVersion.substring(lastDotIndex + 1)) + 1;

    updatedVersion = currentVersion.substr(0, lastDotIndex) + "." + revision;

    const updatedMarkdown = file.contents.toString().replace(versionPattern,
      "**Version:** " + updatedVersion + " - " + getLongDate());

    file.contents = new Buffer(updatedMarkdown);
    this.push(file);
    cb(null, file);
  });
}

function pushUpdates() {
  return through.obj(function(file, encoding, cb) {
    const stdout = file.contents.toString();

    // Any git log info past current version constitutes an update
    if (stdout && stdout.length > 0) {
      console.log("Committing new compiled documents to local repo...");

      const message = "Updated compiled documents - version " + updatedVersion;

      gulp.src("README.md")
        .pipe(exec(git + " add ."))
        .pipe(exec.reporter(execReportOptions))
        .pipe(exec(git + " commit -m \"" + message + "\""))
        .pipe(exec.reporter(execReportOptions))
        .pipe(notify("Tagging local repo with new version number..."))
        .pipe(exec(git + " tag -f v" + updatedVersion))
        .pipe(exec.reporter(execReportOptions))
        .pipe(notify("Pushing updates to remote repo..."))
        .pipe(exec(git + " push"))
        .pipe(exec.reporter(execReportOptions));
    }

    this.push(file);
    cb(null, file);
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
      "<img src=\"" + rootPath + "/Output/Images/"
    );

    file.contents = new Buffer(destinationHtml);
    file.path = gutil.replaceExtension(file.path, ".html");
    this.push(file);
    cb(null, file);
  });
}

gulp.task("check-version", [], function() {
  console.log("Checking document version...");

  return gulp.src(versionFile)
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

  return gulp.src(versionFile)
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

// This task will recompile output documents and increment the version
gulp.task("default", [ "clean-up" ]);

// This task will recompile output documents, increment the version and
// push the updated files if there have been any remote check-ins
gulp.task("push-changes", [ "clean-up" ], function() {
  console.log("Checking for remote updates...");

  const options = { pipeStdout: true };

  gulp.src("README.md")
    .pipe(exec(git + " log v" + currentVersion + "..", options))
    .pipe(pushUpdates());
});

// This task will reset the local repository to the remote - be careful
gulp.task("update-repo", function() {
  console.log("Updating local repo...");

  gulp.src("README.md")
    .pipe(exec(git + " gc"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " fetch"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " reset --hard origin/master"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " clean -f -d -x"))
    .pipe(exec.reporter(execReportOptions));
});
