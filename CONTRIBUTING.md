# How to Contribute

During the early stages of protocol development we will allow direct check-in's from recognized participants on the DOE [Advanced Synchrophasor Protocol](https://energy.gov/oe/articles/oe-announces-investment-new-research-improve-grid-reliability-through-enhanced-0) (ASP) project (see [formal list](Sections/Images/participant-matrix.png)). If you are a participant in the ASP project and would like to assist with drafting the specification, please provide your GitHub account name to the [Grid Protection Alliance](https://www.gridprotectionalliance.org/) (GPA) and we will provide you with write access to the repository.

If you are not associated with the ASP project and would still like to contribute, please send a message to the GPA at [bjmoses@gridprotectionalliance.org](mailto:bjmoses@gridprotectionalliance.org?subject=STTP%20drafting%20participant%20consideration...) and request that you would like be considered for participation in drafting of the STTP specification, along with your name, affiliation and a brief bio - or - simply create a pull request (PR) from a forked repository which will be evaluated for merging. Please note that any contributors are expected to follow the posted [code-of-conduct](CODE_OF_CONDUCT.md) rules.

As the protocol moves beyond initial its draft stages, we intend to move to a PR based model for making modifications to the specification with a reduced set of participants that can approve any pull requests.

Information on this page:
* [Site Design](#site-design)
* [Section Editing](#section-editing)
  * [Naming Conventions](#naming-conventions)
  * [Highlighting Information](#highlighting-information)
  * [Style and Formatting](#style-and-formatting)
  * [Adding Questions and Responses](#adding-questions-and-responses)
* [Markdown Editing](#markdown-editing)
* [Contributor Attribution](#contributor-attribution)

---

## Site Design

The design of this is site has been established to facilitate collaboration. The "source code" of the site exists as each of the primary specification document sections separated into multiple files. It is hoped that having multiple source files will reduce contention and merging conflicts while contributors are simultaneously adding content.

The source code "language" for the site is GitHub flavored [markdown](https://en.wikipedia.org/wiki/Markdown). Since this technical documentation may become the basis for other technical specifications or standards bodies, markdown is an ideal choice for the text. Markdown is a very simple, readable, plain-text based document formatting language with minimal syntax to learn.

> :information_source: New to markdown? See [markdown editing](#markdown-editing) section below.

A nightly "build" process has been established that will check if any changes have been committed to this public repository during the day and will combine all the individual section files into a single combined document, thus "compiling" the source code. This process will also convert the markdown files into [HTML](https://en.wikipedia.org/wiki/HTML) and [PDF](https://en.wikipedia.org/wiki/Portable_Document_Format) formats - see [Output](Output) folder for latest builds.

Since this site is a [git](https://en.wikipedia.org/wiki/Git) based repository, all document updates and associated history will be archived in perpetuity making it easier to manage and track changes over time.

## Section Editing

All document sections are defined as GitHub markdown, i.e., `*.md` files, in the [Sections](Sections) folder. When linking one section to another, link to the file name using a relative path, e.g.:
`For more information, see [API reference](APIReference.md))` - this allows section pages to link together when rendered and enables the nightly build process to manage the translation from `file.md` links to `#header-links` when combining the sections into a single file.

When new sections are added, the "make file" used for compiling the sections will need be modified. The script used for this process is the [Gulp](http://gulpjs.com/) based [gulpfile.js](gulpfile.js) - this file will need to be updated to include the markdown file name for the new section and its associated header mapping so that it can be combined into a single overall document in the nightly build process. Also, links to new major sections should be added to the table of contents which is located in the [Sections/README.md](Sections/README.md) file.

### Naming Conventions

#### Section File Names

File names for sections, see [Sections](Sections) folder, are expected to be in [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) (a.k.a., Pascal case), that is new words in the file name are capitalized with the remainder of the word's letters being lower-case. Abbreviations are generally to be avoided except for well known acronyms. Do not use spaces or dashes and only use underscores when a space is absolutely necessary for readability or visual clarity.

#### Image File Names

File names for images, see [Sections/Images](Sections/Images) folder, are expected to be in all lower [kebab-case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) (a.k.a., spinal case), that is new words in the file name are separated by dashes. Abbreviations are generally to be avoided except for well known acronyms, but should remain lower-case. Do not use spaces or underscores, only dashes. All images are expected to by in [PNG](https://en.wikipedia.org/wiki/Portable_Network_Graphics) format with a `.png` extension.

### Highlighting Information

When developing new content where instructional notes or contextual information should be highlighted, use the following format:

`> :information_source: This is an instructional note in the spec.`

Which gets rendered as:
> :information_source: This is an instructional note in the spec.

For very important notes or information that is deemed critical to understanding the content, use the following format:

`> :warning: This is a very important note in the spec.`

Which gets rendered as:
> :warning: This is a very important note in the spec.

### Style and Formatting

#### Header Formatting

New major sections should start at heading level 2, or `## New Heading`. Sub-sections of heading level 2 should start at heading level 3, or `### New Sub-Heading` - and so forth. This is necessary for consistency when combining all the sections into a single document. Starting at level 2 was chosen since heading level 1 is reserved for title page sized headings.

#### Custom Page Breaks

For the automated conversion of the specification to PDF, all heading level 2 sections are marked to start on a new page.

If you need more control over page breaks, the following [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets) classes have been defined that can be used anywhere in the document - note that these _only_ get applied in the final compiled PDF document:

* insert-page-break-before
* insert-page-break-after
* avoid-page-break-before
* avoid-page-break-after
* avoid-page-break-inside

To apply the page break control style, add an HTML paragraph tag, i.e.,  [`<p>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p), to the document that includes the desired class, for example:

`<p class="insert-page-break-after"></p>`

Note that use of the `avoid-page-break-inside` class can be used to _wrap_ a portion of text, for example:

```
<p class="avoid-page-break-inside">

| Col1 | Col2 | Col3 |
|------|------|------|
|  A1  |  B2  |  C3  |
|  D1  |  E2  |  F3  |

</p>
```

> :information_source: These CSS classes have been established as markers for the PDF [conversion tool](https://wkhtmltopdf.org/). The conversion tool will use these markers as suggestions; use is not a guarantee of desired page break control.

### Adding Questions and Responses

While we are drafting the documentation, in order to make it easier to ask questions or make comments about a particular subject in-line to the text, we will support the following style for questions and associated responses:

`> :tomato::question: author-initials: _question to be asked?_`

`> :bulb: responder-initials: explanatory response...`

`> :thumbsup: responder-initials: positive response...`

`> :thumbsdown: responder-initials: negative response...`

Which gets rendered as:

> :tomato::question: author-initials: _question to be asked?_

> :bulb: responder-initials: explanatory response...

> :thumbsup: responder-initials: positive response...

> :thumbsdown: responder-initials: negative response...

Please keep the questions and responses close to topic area of concern. If the questions and responses get lengthy, we will move content to a new issue (see [STTP Issue Tracker](https://github.com/sttp/Specification/issues)) for further discussion and simply add a link the new issue from within the documentation text.

Note that all questions and answers will be removed from the documentation at various publication points, but will be preserved for posterity in a stand-alone section that will not be part of the main-line compiled document.

## Markdown Editing

The official guide to developing GitHub flavored markdown can be found here:
https://guides.github.com/features/mastering-markdown/

In addition, the following site contains a very concise set of notes, i.e., a _cheat-sheet_, on developing markdown for GitHub:
https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet

As markdown exists as simple text files, most any text editor can be used to develop content. The markdown can even be directly edited on the GitHub site by clicking the pencil ![pencil-edit](Sections/Images/github-pencil-edit.png) icon on the top right of the page when navigating to a source page (_if you have write-access to this repository you will see the editing icon on this contributing page_). This web based editor includes a preview mode to show you exactly how the markdown will look when rendered.

### Free Editing Tools

If you are looking for a standalone editor, the [Atom Editor](https://atom.io/) does a very good job of rendering a preview of developed markdown to show you how it will look when posted to GitHub and includes the ability to stage and commit check-ins to your local repository from within the tool - as of writing, you'll need another tool to directly sync to GitHub, e.g., [GitHub Desktop](https://desktop.github.com/). There are also useful plug-ins for developing markdown, e.g.: the [markdown-writer](https://atom.io/packages/markdown-writer) and [tool-bar-markdown-writer](https://atom.io/packages/tool-bar-markdown-writer).

If you develop code on Windows, [Visual Studio](https://www.visualstudio.com/free-developer-offers/) is an excellent editor. You can also install a markdown editing tool through `Extensions and Updates`, e.g., the [MarkdownEditor](https://github.com/madskristensen/MarkdownEditor) which will provide a rendering of the markdown as it is entered. Visual Studio also has very good [GitHub integration](https://visualstudio.github.com/) to allow any edits to be synchronized to GitHub, minimizing any hassles around your local repository.

Another free tool is [Visual Studio Code](https://code.visualstudio.com/), this is a cross-platform code / editing tool that feels a lot like Atom and also includes all the bells and whistles, like [markdown editing](https://code.visualstudio.com/docs/languages/markdown) and [git integration](https://code.visualstudio.com/docs/setup/additional-components).

## Contributor Attribution

The specification contributors are listed in the [Contributors.md](Sections/Contributors.md) file. If you are providing critical review or updates to the specification, please add yourself to this file.
