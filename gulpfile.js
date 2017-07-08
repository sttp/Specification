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

// Define non-relative URL paths for any relative paths
const rawPath = "https://raw.githubusercontent.com/sttp/Specification/master/";
const viewPath = "https://github.com/sttp/Specification/blob/master/";

// Define section file that contains version number
const versionFile = "Sections/TitlePage.md";

// Define primary footer title for PDF - will be suffixed with updated version
const footerTitle = "STTP Draft Specification - v";

// Define the section files in the order that they should appear
// in the target single combined markdown document:
const sections = [
  "Sections/TitlePage.md",
  "Sections/Preface.md",
  "Sections/README.md" /* TOC */,
  "Sections/Introduction.md",
  "Sections/BusinessCase.md",
  "Sections/Definitions.md",
  "Sections/Overview.md",
  "Sections/DataPointStructure.md",
  "Sections/CommandsAndResponses.md",
  "Sections/Commands.md",
  "Sections/Responses.md",
  "Sections/DataPointCharacteristics.md",
  "Sections/Metadata.md",
  "Sections/Compression.md",
  "Sections/Security.md",
  /* Balance of sections */
  "Sections/References.md",
  "Sections/Contributors.md",
  "Sections/History.md",
  "Sections/FunctionalRequirements.md",
  "Sections/APIReference.md",
  "Sections/IEEE_C37.118Mapping.md"
];

// Define map of markdown file links to intra-page section headers, note
// that GitHub makes all header links lowercase and spaces become dashes:
const sectionLinks = [
  /* Section link mappings */
  [ "(TitlePage.md)", "(#user-content-title-page)" ],
  [ "(Preface.md)", "(#disclaimer)" ],
  [ "(README.md)", "(#table-of-contents)" ],
  [ "(Introduction.md)", "(#introduction)" ],
  [ "(BusinessCase.md)", "(#business-case)" ],
  [ "(Definitions.md)", "(#definitions-and-nomenclature)" ],
  [ "(Overview.md)", "(#protocol-overview)" ],
  [ "(DesignPhilosophies.md)", "(#design-philosophies)" ],
  [ "(DataPointStructure.md)", "(#data-point-structure)" ],
  [ "(CommandsAndResponses.md)", "(#commands-and-responses)" ],
  [ "(Commands.md)", "(#commands)" ],
  [ "(Responses.md)", "(#responses)" ],
  [ "(DataPointCharacteristics.md)", "(#data-point-characteristics)" ],
  [ "(Metadata.md)", "(#metadata)" ],
  [ "(Compression.md)", "(#compression)" ],
  [ "(Security.md)", "(#security)" ],
  /* Balance of sections */
  [ "(References.md)", "(#references-and-notes)" ],
  [ "(Contributors.md)", "(#contributors)" ],
  [ "(History.md)", "(#major-version-history)" ],
  [ "(FunctionalRequirements.md)", "(#appendix-a---functional-requirements)" ],
  [ "(APIReference.md)", "(#appendix-b---sttp-api-reference)" ],
  [ "(IEEE_C37.118Mapping.md)", "(#appendix-c---ieee-c37118-mapping)" ],
  [ "(ToDoList.md)", "(#specification-development-to-do-list)" ],
  /* Special replacements */
  [ "(References.md#", "(#" ],
  [ "(QuestionsSummary.md)", "(" + viewPath + "Sections/QuestionsSummary.md)" ],
  [ "(../LICENSE)", "(" + viewPath + "LICENSE)" ]
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
var forcePush = false;
var referenceMappings = {};

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

function pushDocumentUpdates() {
  return through.obj(function(file, encoding, cb) {
    const stdout = file.exec ? file.exec.stdout : null;
    const stderr = file.exec ? file.exec.stderr : null;
    const pushUpdates =
      forcePush ||
      (stdout && stdout.length > 0) ||
      (stderr && stderr.length > 0);

    if (pushUpdates) {
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
      "<img src=\"" + rawPath + "Output/Images/"
    );

    // Remove "#user-content-" prefixes for page level bookmarks
    destinationHtml = replaceAll(destinationHtml, "#user-content-", "#");

    file.contents = new Buffer(destinationHtml);
    file.path = gutil.replaceExtension(file.path, ".html");
    this.push(file);
    cb(null, file);
  });
}

function loadReferenceMapping() {
  return through.obj(function(file, encoding, cb) {
    const mappings = file.contents.toString().split(/\r\n|\n/);

    for (let i = 0; i < mappings.length; i++) {
      if (mappings[i].startsWith("//"))
        continue;

      const mapping = mappings[i].split(",");

      if (mapping.length == 2)
        referenceMappings[mapping[0]] = mapping[1];
    }

    for (let key in referenceMappings) {
      if (referenceMappings.hasOwnProperty(key)) {
        console.log("Mapping \"" + key + "\" to \"" + referenceMappings[key] + "\"");
      }
    }

    this.push(file);
    cb(null, file);
  });
}

function updateReferences() {
  return through.obj(function(file, encoding, cb) {
    if (file.contents) {
      const referenceContent = "](References.md#user-content-ref"
      var sourceMarkdown = file.contents.toString();

      console.log("Processing \"" + file.path + "\"...");

      for (let key in referenceMappings) {
        if (referenceMappings.hasOwnProperty(key)) {
          const value = referenceMappings[key];

          sourceMarkdown = replaceAll(sourceMarkdown,
            "[" + key + referenceContent + key + ")",
            "[" + value + referenceContent + value + ")"
          );
        }
      }

      file.contents = new Buffer(sourceMarkdown);
    }

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

  gulp.src("Sections/Images/*.png")
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

  const options = {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 20,
    footerSpacing: 5,
    footerFontName: "Segoe UI",
    footerFontSize: 8,
    footerLeft: getLongDate(),
    footerCenter: footerTitle + updatedVersion,
    footerRight: "[page] / [toPage]",
    footerLine: false
  };

  return gulp.src("Output/sttp-specification.html")
    .pipe(html2pdf(options))
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
// push the updated files
gulp.task("push-changes", [ "clean-up" ], function() {
  forcePush = true;

  return gulp.src("README.md")
    .pipe(pushDocumentUpdates());
});

// This task will recompile output documents, increment the version and
// push the updated files if there have been any remote check-ins - this
// is useful for an automated nightly-build operation that should only
// run when there have been changes pushed to the remote repository.
// When scheduling this task to run, the "update-repo" task should be
// called before calling the "push-changes-if-remote-updated" task - this
// assumes that the automated build repostory will not be the source of
// any content updates besides incrementing the version number and
// compiling the new documents.
gulp.task("push-changes-if-remote-updated", [ "clean-up" ], function() {
  console.log("Checking for remote updates...");

  const options = { continueOnError: true };

  return gulp.src("README.md")
    .pipe(exec(git + " log v" + currentVersion + "..", options))
    .pipe(pushDocumentUpdates());
});

// This task will reset the local repository to the remote - be careful
gulp.task("update-repo", function() {
  console.log("Updating local repo...");

  return gulp.src("README.md")
    .pipe(exec(git + " gc"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " fetch"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " reset --hard origin/master"))
    .pipe(exec.reporter(execReportOptions))
    .pipe(exec(git + " clean -f -d -x"))
    .pipe(exec.reporter(execReportOptions));
});

// This task will renumber the references in section markdown files
gulp.task("renumber-references", function() {
  console.log("Renumbering references...");

  gulp.src("refmap.txt")
    .pipe(loadReferenceMapping());

  return gulp.src("Sections/*.md")
    .pipe(updateReferences())
    .pipe(gulp.dest("Sections/"));
});
