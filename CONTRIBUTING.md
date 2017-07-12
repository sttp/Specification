# How to Contribute

During the early stages of protocol development we will allow direct check-in's from recognized participants on the DOE [Advanced Synchrophasor Protocol](https://energy.gov/oe/articles/oe-announces-investment-new-research-improve-grid-reliability-through-enhanced-0) (ASP) project (see [formal list](Sections/Images/participant-matrix.png)). If you are a participant in the ASP project and would like to assist with drafting the specification, please provide your GitHub account name to the [Grid Protection Alliance](https://www.gridprotectionalliance.org/) (GPA) and we will provide you with write access to the repository.

If you are not associated with the ASP project and would still like to contribute, please send a message to the GPA at [bjmoses@gridprotectionalliance.org](mailto:bjmoses@gridprotectionalliance.org?subject=STTP%20drafting%20participant%20consideration...) and request that you would like be considered for participation in drafting of the STTP specification, along with your name, affiliation and a brief bio - or - simply create a pull request (PR) from a forked repository which will be evaluated for merging. Please note that any contributors are expected to follow the posted [code-of-conduct](CODE_OF_CONDUCT.md) rules.

As the protocol moves beyond initial its draft stages, we intend to move to a PR based model for making modifications to the specification with a reduced set of participants that can approve any pull requests.

Information on this page:
* [Site Design](#site-design)
* [Section Editing](#section-editing)
  * [Naming Conventions](#naming-conventions)
  * [Handling References](#handling-references)
  * [Highlighting Information](#highlighting-information)
  * [Adding Questions and Responses](#adding-questions-and-responses)
  * [Style and Formatting](#style-and-formatting)
* [Markdown Editing](#markdown-editing)
* [Git Workflow](#git-workflow)
* [Contributor Attribution](#contributor-attribution)

---

## Site Design

The design of this is site has been established to facilitate collaboration. The "source code" of the site exists as each of the primary specification document sections separated into multiple files. It is hoped that having multiple source files will reduce contention and merging conflicts while contributors are simultaneously adding content.

The source code "language" for the site is GitHub flavored [markdown](https://en.wikipedia.org/wiki/Markdown). Since this technical documentation may become the basis for other technical specifications or standards bodies, markdown is an ideal choice for the text. Markdown is a very simple, readable, plain-text based document formatting language with minimal syntax to learn.

> :information_source: New to markdown? See the [markdown editing](#markdown-editing) section below.

A nightly "build" process has been established that will check if any changes have been committed to this public repository during the day and will combine all the individual section files into a single combined document, thus "compiling" the source code. This process will also convert the markdown files into [HTML](https://en.wikipedia.org/wiki/HTML) and [PDF](https://en.wikipedia.org/wiki/Portable_Document_Format) formats - see [Output](Output) folder for latest builds.

Since this site is a [git](https://en.wikipedia.org/wiki/Git) based repository, all document updates and associated history will be archived in perpetuity making it easier to manage and track changes over time. See the [git workflow](#git-workflow) section below to start contributing updates.

## Section Editing

All document sections are defined as GitHub markdown, i.e., `*.md` files, in the [Sections](Sections) folder. When linking one section to another, link to the file name using a relative path, e.g.:
`For more information, see [API reference](APIReference.md))` - this allows section pages to link together when rendered and enables the nightly build process to manage the translation from `file.md` links to `#header-links` when combining the sections into a single file.

When new sections are added, the "make file" used for compiling the sections will need to be modified. The script used for this process is the [Gulp](http://gulpjs.com/) based [gulpfile.js](gulpfile.js) - this file will need to be updated to include the markdown file name for the new section and its associated header mapping so that it can be combined into a single overall document in the nightly build process. Also, links to new major sections should be added to the table of contents which is located in the [Sections/README.md](Sections/README.md) file.

> :warning: When pasting content into section documents from other sources, please note that word processors and presentation software often use extended character sets for quotes, commas and dashes. These extended characters do not always render properly when the text is converted to its final PDF format. Always make sure to paste in plain-text, replacing any extended characters with their most simple forms. It's editor dependent, but using `Ctrl+Shift+V` will often paste using only plain text.

### Naming Conventions

#### Section File Names

File names for sections, see [Sections](Sections) folder, are expected to be in [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) (a.k.a., Pascal case), that is new words in the file name are capitalized with the remainder of the word's letters being lower-case. Abbreviations are generally to be avoided except for well known acronyms. Do not use spaces or dashes and only use underscores when a space is absolutely necessary for readability or visual clarity.

#### Image File Names

File names for images, see [Sections/Images](Sections/Images) folder, are expected to be in all lower [kebab-case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) (a.k.a., spinal case), that is new words in the file name are separated by dashes. Abbreviations are generally to be avoided except for well known acronyms, but should remain lower-case. Do not use spaces or underscores, only dashes. All images are expected to by in [PNG](https://en.wikipedia.org/wiki/Portable_Network_Graphics) format with a `.png` extension.

### Handling References

All document references are enumerated in the [Sections/References.md](Sections/References.md) file.  When adding a new reference, use an HTML bookmark using an anchor tag, i.e.,  [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a), with a unique `name` element for the listing, for example:

`4. <a name="ref4"></a>[STTP Repositories on GitHub](https://github.com/sttp), Various specification documents and reference implementations.`

Bookmark names should be prefixed with `ref` and be numbered sequentially.

> :warning: Since multiple documents may be linked to the reference by number, any renumbering of the references will impact many documents.

When GitHub encounters user added bookmarks, it automatically prefixes the bookmark name with `user-content-` to ensure uniqueness of the bookmark on the page when rendered. As a result, any time you need to link to the numbered reference, the markdown should look like the following:

`The STTP organizational site <sup>[[4](References.md#user-content-ref4)]</sup> of GitHub maintains the versioned source for the specification as well as operational reference implementations for the protocol.`

Which gets rendered as:

The STTP organizational site <sup>[[4](Sections/References.md#user-content-ref4)]</sup> of GitHub maintains the versioned source for the specification as well as operational reference implementations for the protocol.

> :information_source: If you use the [Atom Editor](https://atom.io/), you can add a [snippet](http://flight-manual.atom.io/using-atom/sections/snippets/) to make it easier to add new references. Just open up the snippets file by selecting `File > Snippets` from the Atom menu, then copy and paste in the following snippet script:

```javascript
".source.gfm":
  "Insert Specification Reference":
    "prefix": "specref"
    "body": "<sup>[[${1:1}](References.md#user-content-ref${1:1})]</sup>"

  "Add New Specification Reference":
    "prefix": "newspecref"
    "body": "${1:1}. <a name=\"ref${1:1}\"></a>[${2:Reference Name}](${3:http://www.reference.url})"
```

> As soon you add the snippet and save the file, you can type `specref` from within any markdown document and press `Tab` to insert a new reference link. The reference index will be highlighted and can be set to the desired value. This script also defines a snippet for creating new references in the references section, just type `newspecref` from the `Sections/References.md` file and press tab to insert a new reference.

### Highlighting Information

When developing new content where instructional notes or contextual information should be highlighted, use the following format:

`> :information_source: This is an instructional note in the spec.`

Which gets rendered as:
> :information_source: This is an instructional note in the spec.

For very important notes or information that is deemed critical to understanding the content, use the following format:

`> :warning: This is a very important note in the spec.`

Which gets rendered as:
> :warning: This is a very important note in the spec.

For notes that are specific to reference implementations of the specification, use the following format:

`> :wrench: This note is used to call out information related to reference implementations or API development.`

Which gets rendered as:
> :wrench: This note is used to call out information related to reference implementations or API development.

### Adding Questions and Responses

While we are drafting the documentation, in order to make it easier to ask questions or make comments about a particular subject in-line to the text, we will support the following style for questions and associated responses:

`> :tomato::question: author-initials: _question to be asked?_`

`> :bulb: responder-initials: _explanatory response..._`

`> :confused: responder-initials: _confused response..._`

`> :thumbsup: responder-initials: _positive response..._`

`> :thumbsdown: responder-initials: _negative response..._`

Which gets rendered as:

> :tomato::question: author-initials: _question to be asked?_

> :bulb: responder-initials: _explanatory response..._

> :confused: responder-initials: _confused response..._

> :thumbsup: responder-initials: _positive response..._

> :thumbsdown: responder-initials: _negative response..._

Please keep the questions and responses close to topic area of concern. If the questions and responses get lengthy, we will move content to a new issue (see [STTP Issue Tracker](https://github.com/sttp/Specification/issues)) for further discussion and simply add a link the new issue from within the documentation text.

Note that all questions and answers will be removed from the documentation at various publication points, but will be preserved for posterity in the [Sections/QuestionsSummary.md](Sections/QuestionsSummary.md) file, a stand-alone section that does not exist as part of the main-line compiled document.

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

Make sure to separate the HTML paragraph tags from the markdown by at least one blank line, otherwise the GitHub markdown engine may not properly render the markdown that is next to the `<p>` tag.

Note that use of the `avoid-page-break-inside` class can be used to _wrap_ a portion of text, for example:

```
<p class="avoid-page-break-inside">

| Col1 | Col2 | Col3 |
|------|------|------|
|  A1  |  B2  |  C3  |
|  D1  |  E2  |  F3  |

</p>
```

> :information_source: These CSS classes have been established as markers for the PDF [conversion tool](https://wkhtmltopdf.org/). The conversion tool will use these markers as suggestions; its use does not guarantee desired page break control.

## Markdown Editing

The official guide to developing GitHub flavored markdown can be found here:
https://guides.github.com/features/mastering-markdown/

In addition, the following site contains a very concise set of notes, i.e., a _cheat-sheet_, on developing markdown for GitHub:
https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet

As markdown exists as simple text files, most any text editor can be used to develop content. The markdown can even be directly edited on the GitHub site by clicking the pencil icon ![pencil-edit](Sections/Images/github-pencil-edit.png) on the top right of the page when navigating to a source page (_if you have write-access to this repository, you will see the editing icon on this contributing page_). This web based editor includes a preview mode to show you exactly how the markdown will look when rendered.

### Free Editing Tools

If you are looking for a standalone editor, the [Atom Editor](https://atom.io/) does a very good job of rendering a preview of developed markdown to show you how it will look when posted to GitHub and includes the ability to stage and commit check-ins to your local repository from within the tool - as of writing, you'll need another tool to directly sync to GitHub, e.g., [GitHub Desktop](https://desktop.github.com/). There are also useful plug-ins for developing markdown, e.g.: the [markdown-writer](https://atom.io/packages/markdown-writer) and [tool-bar-markdown-writer](https://atom.io/packages/tool-bar-markdown-writer).

If you develop code on Windows, [Visual Studio](https://www.visualstudio.com/free-developer-offers/) is an excellent editor. You can also install a markdown editing tool through `Extensions and Updates`, e.g., the [MarkdownEditor](https://github.com/madskristensen/MarkdownEditor) which will provide a rendering of the markdown as it is entered. Visual Studio also has very good [GitHub integration](https://visualstudio.github.com/) to allow any edits to be synchronized to GitHub, minimizing any hassles around your local repository.

Another free tool is [Visual Studio Code](https://code.visualstudio.com/), this is a cross-platform code / editing tool that feels a lot like Atom and also includes all the bells and whistles, like [markdown editing](https://code.visualstudio.com/docs/languages/markdown) and [git integration](https://code.visualstudio.com/docs/setup/additional-components).

## Git Workflow

There are many "_getting starting_" documents, tutorials and videos that can help you begin using git - the official guide can be found here:
https://git-scm.com/book/en/v1/Git-Basics

If you are not familiar with git, the following information will help highlight some of the initial concepts and helpful workflow patterns that can help get you started quickly.

One important distinction with git as compared to other source code management systems is that when you clone a repository from GitHub onto your local system, you are getting a full copy of the entire revision history onto your local system. All this history ends up in the hidden `.git` folder in the current working directory along with all the source files. You can think of this folder like a small database that stores file differences over time. As you might suspect, this is a very critical folder - this folder _is_ the git repository.

Since all the history lives locally, without being online you can [`checkout`](https://git-scm.com/docs/git-checkout) an older version of the history and the git tools will extract the files from that point into your working folder - if the files at that point in history are very different than the current version, the change in the local files can be very disconcerting.

The workflow with git is to make changes to the files in your working directory as desired. Once you have made the desired updates, you need to [`stage`](https://git-scm.com/docs/git-add) the changes - this basically selects the changed files you want to add to the git history - you can choose to stage all changes.

Once a set of files have been selected to be added to history, you need to [`commit`](https://git-scm.com/docs/git-commit) the changes along with a relevant commit message. Committing changes to the repository marks a new point in the revision history of files that can be returned to at a later point.

You can continue to commit changes to your local repository as needed, but keep in mind the more your local repository _differs_ from the one hosted on GitHub, the more likely there are to be conflicts that may need to be resolved - this is because other people can be making changes too. At some point you will need to [`push`](https://git-scm.com/docs/git-push) your changes back to GitHub.

If someone else has already pushed changes to GitHub when you decide to push your updates, it will be necessary to [`fetch`](https://git-scm.com/docs/git-fetch) the changes from GitHub and then [`merge`](https://git-scm.com/docs/git-merge) your local changes with the remote changes. Most of the time, the git tools can handle these two tasks automatically when you [`pull`](https://git-scm.com/docs/git-pull) any new remote updates right before you push your changes - this strategy works well so long as there are no merge conflicts.

> :information_source: As an alternative to merge, you can [`rebase`](https://git-scm.com/docs/git-rebase) your repository - this re-writes the project history by creating new commits for each commit in the original branch. This is a more advanced git option and is commonly only available from the command prompt. The git command line can also automatically handle rebasing along with a `pull` by using the `git pull --rebase` command. Note that the rebase strategy is still subject to possible conflicts when two users are trying to commit changes to the same file.

Most of the GitHub tools that are available, such as the standalone GitHub Desktop or the ones that are integrated within source code editing tools (see the [free editing tools](#free-editing-tools) section above), will assist with negotiating these more complex merging tasks - usually by making a [`sync`](https://help.github.com/desktop/guides/contributing/syncing-your-branch/) button available. These tools typically also have user interfaces to help with any conflict resolution, i.e., when two users have made changes to the same file, the tools will allow proper merging and editing of conflicting edits allowing user selected resolution before committing the merge back to GitHub.

## Contributor Attribution

The specification contributors are listed in the [Sections/Contributors.md](Sections/Contributors.md) file. If you are providing critical review or updates to the specification, please add yourself to this file.
