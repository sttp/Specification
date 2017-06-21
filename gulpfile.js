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

var gulp = require("gulp");
var clean = require('gulp-clean');
var concat = require("gulp-concat");
var showdown = require("showdown");
var emojis = require("showdown-emoji");
var util = require("gulp-util");
var through = require("through2");
var html2pdf = require('gulp-html2pdf');
var exec = require("gulp-exec");

// Define the section files in the order that they should appear
// in the target single combined markdown document:
var sections = [
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
var sectionLinks = [
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

var versionPattern = /^\*\*Version:\*\*\s+\d+\.\d+\.\d+.*$/gm;
var updateBuild = false;

showdown.setFlavor("github");

function replaceAll(sourceText, findText, replaceWith, ignoreCase) {
  return sourceText.replace(new RegExp(
    findText.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      (ignoreCase ? "gi" : "g")), (typeof replaceWith == "string") ?
        replaceWith.replace(/\$/g, "$$$$") : replaceWith);
}

function getLongDate(date) {
  var monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  if (!date)
    date = new Date();

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + " " + day + ", " + year;
}

function logOutput(err, stdout, stderr) {
  console.log(stdout);
  console.error(stderr);
}

function getDocumentVersion(sourceMarkdown) {
  var versionLineMatch = sourceMarkdown.match(versionPattern);

  if (versionLineMatch) {
    var versionNumberMatch = versionLineMatch[0].match(/\d+\.\d+\.\d+/);
    return versionNumberMatch[0];
  }

  return null;
}

function checkDocumentVersion() {
  through.obj(function(file, encoding, cb) {
    var versionNumber = getDocumentVersion(file.contents.toString());

    if (versionNumber) {
      exec("git log v" + versionNumber + "..", function(err, stdout, stderr) {
        updateBuild = (stdout && stdout.length > 0);
      });
    }
  })
}

function incrementDocumentVersion() {
  return through.obj(function(file, encoding, cb) {
    var sourceMarkdown = file.contents.toString();
    var versionNumber = getDocumentVersion(sourceMarkdown);

    if (versionNumber) {
      var lastDotIndex = versionNumber.lastIndexOf(".");
      var revision = parseInt(versionNumber.substring(lastDotIndex + 1)) + 1;

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

function pushChanges() {
  through.obj(function(file, encoding, cb) {
    var versionNumber = getDocumentVersion(file.contents.toString());

    if (versionNumber) {
      console.log("Tagging local repo with new version number...");
      exec("%git% add .", logOutput);
      exec("%git% commit -m \"Updated compiled document\"", logOutput);
      exec("%git% tag -f v" + versionNumber, logOutput);

      console.log("Push change to remote repository...");
      exec("%git% push", logOutput);
    }
  })
}

function updateSectionLinks() {
  return through.obj(function(file, encoding, cb) {
    var sourceMarkdown = file.contents.toString();

    for (var i = 0; i < sectionLinks.length; i++) {
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
    var converter = new showdown.Converter({ extensions: [emojis] });
    var sourceMarkdown = file.contents.toString();
    var destinationHtml = converter.makeHtml(sourceMarkdown);

    // Convert local image links to non-relative permanent paths
    destinationHtml = replaceAll(
      destinationHtml,
      "<img src=\"Images/",
      "<img src=\"https://raw.githubusercontent.com/sttp/Specification/master/Output/Images/"
    );

    file.contents = new Buffer(destinationHtml);
    file.path = util.replaceExtension(file.path, ".html");
    this.push(file);

    cb(null, file);
  });
}

gulp.task("check-version", function() {
  return gulp.src("Sections/TitlePage.md")
    .pipe(checkDocumentVersion());
});

gulp.task("clear-output", [ "check-version" ] function() {
  console.log("Clearing output folder...");

  return gulp.src([
      "Output/Images/",
      "Output/Include/",
      "Output/*"
    ], { read: false })
    .pipe(clean());
})

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
  if (updateBuild) {
    gulp.src("Sections/TitlePage.md")
      .pipe(pushChanges());
  }
});

gulp.task("update-repo", function() {
  console.log("Updating local repo...");

  exec("%git% gc", logOutput);
  exec("%git% fetch", logOutput);
  exec("%git% reset --hard origin/master", logOutput);
  exec("%git% clean -f -d -x", logOutput);
});
