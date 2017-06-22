## How to Contribute

During the early stages of protocol development we will allow direct check-in's from recognized participants on the DOE [Advanced Synchrophasor Protocol](https://energy.gov/oe/articles/oe-announces-investment-new-research-improve-grid-reliability-through-enhanced-0) (ASP) project (see [formal list](Sections/Images/participant-matrix.png)). If you are a participant in the ASP project and would like to assist with drafting the specification, please provide your GitHub account name to the [Grid Protection Alliance](https://www.gridprotectionalliance.org/) (GPA) and we will provide you with write access to the repository.

If you are not associated with the ASP project and would still like to contribute, please send a message to the GPA at [bjmoses@gridprotectionalliance.org](mailto:bjmoses@gridprotectionalliance.org?subject=STTP%20drafting%20participant%20consideration...) and request that you would like be considered for participation in drafting of the STTP specification, along with your name, affiliation and a brief bio - or - simply create a pull request (PR) from a forked repository which will be evaluated for merging. Please note that any contributors are expected to follow the posted [code-of-conduct](CODE_OF_CONDUCT.md) rules.

As the protocol moves beyond initial its draft stages, we intend to move to a PR based model for making modifications to the specification with a reduced set of participants that can approve any pull requests.

### Section Editing

When adding new sections, make sure to modify [gulpfile.js](gulpfile.js) to include the new section markdown file and its associated header mapping so that it can be combined into a single overall document in the nightly build process. Also, new sections should be added to the table of contents which is located in the [Sections/README.md](Sections/README.md) file.

#### Highlighting Information

When developing new content where instructional notes or contextual information should be highlighted, use the following format:

`> :information_source: This is an instructional note in the spec.`

Which gets rendered as:
> :information_source: This is an instructional note in the spec.

For very important notes or information that is deemed critical to understanding the content, use the following format:

`> :warning: This is a very important note in the spec.`

Which gets rendered as:
> :warning: This is a very important note in the spec.

### Contributor Recognition

The specification contributors are listed in the [Contributors](Sections/Contributors.md) file. If you are providing critical review or updates to the specification, please add yourself to this file.
