## How to Contribute

During the early stages of protocol development we will allow direct check-in's from recognized participants on the DOE [Advanced Synchrophasor Protocol](https://energy.gov/oe/articles/oe-announces-investment-new-research-improve-grid-reliability-through-enhanced-0) (ASP) project (see [formal list](Sections/Images/participant-matrix.png)). If you are a participant in the ASP project and would like to assist with drafting the specification, please provide your GitHub account name to the [Grid Protection Alliance](https://www.gridprotectionalliance.org/) (GPA) and we will provide you with write access to the repository.

If you are not associated with the ASP project and would still like to contribute, please send a message to the GPA at [bjmoses@gridprotectionalliance.org](mailto:bjmoses@gridprotectionalliance.org?subject=STTP%20drafting%20participant%20consideration...) and request that you would like be considered for participation in drafting of the STTP specification, along with your name, affiliation and a brief bio - or - simply create a pull request (PR) from a forked repository which will be evaluated for merging. Please note that any contributors are expected to follow the posted [code-of-conduct](CODE_OF_CONDUCT.md) rules.

As the protocol moves beyond initial its draft stages, we intend to move to a PR based model for making modifications to the specification with a reduced set of participants that can approve any pull requests.

Information on this page:
* [Section Editing](#section-editing)
  * [Highlighting Information](#highlighting-information)
  * [Markdown Editing](#markdown-editing)
* [Contributor Attribution](#contributor-attribution)

---
### Section Editing

All document sections are defined as GitHub markdown, i.e., `*.md` files, in the [Sections](Sections) folder. When linking one section to another, link to the file name using a relative path, e.g.:
`For more information, see [API reference](APIReference.md))` - this allows section pages to link together when rendered and enables the nightly build process to manage the translation from `file.md` links to `#header-links` when combining the sections into a single file.

When adding new sections, make sure to modify [gulpfile.js](gulpfile.js) to include the new section markdown file and its associated header mapping so that it can be combined into a single overall document in the nightly build process. Also, new sections should be added to the table of contents which is located in the [Sections/README.md](Sections/README.md) file.

New to markdown? See [markdown editing](#markdown-editing) section below.

#### Highlighting Information

When developing new content where instructional notes or contextual information should be highlighted, use the following format:

`> :information_source: This is an instructional note in the spec.`

Which gets rendered as:
> :information_source: This is an instructional note in the spec.

For very important notes or information that is deemed critical to understanding the content, use the following format:

`> :warning: This is a very important note in the spec.`

Which gets rendered as:
> :warning: This is a very important note in the spec.

#### Adding Questions and Responses

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

#### Markdown Editing

The official guide to developing GitHub flavored markdown can be found here:
https://guides.github.com/features/mastering-markdown/

The following site contains a very concise set of notes on developing markdown for GitHub:
https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet

As markdown exists as simple text files, most any text editor can be used to develop content. The markdown can even be directly edited on the GitHub site by clicking the pencil :pencil: icon on the top right of the page when navigating to a source page, for example, if you have write-access to this repository, you will see the editing icon on the [README.md](https://github.com/sttp/Specification/blob/master/Sections/README.md) page. This web based editor includes a preview mode to show you exactly how the markdown will look when rendered.

If you are looking for a standalone editor, the [Atom Editor](https://atom.io/) does a very good job of rendering a preview of developed markdown to show you how it will look when posted to GitHub and includes the ability to stage and commit check-ins to your local repository from within the tool - as of writing, you'll need another tool to directly sync to GitHub, e.g., [GitHub Desktop](https://desktop.github.com/). There are also useful plug-ins for developing markdown, e.g.: the [markdown-writer](https://atom.io/packages/markdown-writer) and [tool-bar-markdown-writer](https://atom.io/packages/tool-bar-markdown-writer).

If you develop code on Windows, [Visual Studio](https://www.visualstudio.com/free-developer-offers/) is an excellent editor. You can also install a markdown editing tool through `Extensions and Updates`, e.g., the [MarkdownEditor](https://github.com/madskristensen/MarkdownEditor) which will provide a rendering of the markdown as it is entered. Visual Studio also has very good [GitHub integration](https://visualstudio.github.com/) to allow any edits to be synchronized to GitHub, minimizing any hassles around your local repository.

Another free tool is [Visual Studio Code](https://code.visualstudio.com/), this is a cross-platform code / editing tool that feels a lot like Atom and also includes all the bells and whistles, like [markdown editing](https://code.visualstudio.com/docs/languages/markdown) and [git integration](https://code.visualstudio.com/docs/setup/additional-components).

### Contributor Attribution

The specification contributors are listed in the [Contributors.md](Sections/Contributors.md) file. If you are providing critical review or updates to the specification, please add yourself to this file.
