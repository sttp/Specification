<a name="title-page"></a>
![STTP](Images/sttp-logo-with-participants.png)

**Version:** 0.0.5 - June 20, 2017

**Status:** Initial Development

**Abstract:** This specification defines a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) data transfer protocol that has been optimized for exchanging streaming [time-series](https://en.wikipedia.org/wiki/Time_series) style data, such as [synchrophasor](https://en.wikipedia.org/wiki/Phasor_measurement_unit) data that is used in the electric power industry, over [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) (IP). The protocol supports transferring both real-time and historical time-series data at full or down-sampled resolutions. Protocol benefits are realized at scale when multiplexing very large numbers of time-series [data points](https://en.wikipedia.org/wiki/Data_point) at high speed, such as, hundreds of times per second per data point.

<br/>
Copyright &copy; 2017, Grid Protection Alliance, Inc., All rights reserved.
<hr/>

#### Disclaimer

This document was prepared as a part of work sponsored by an agency of the United States Government (DE-OE-0000859).  Neither the United States Government nor any agency thereof, nor any of their employees, makes any warranty, express or implied, or assumes any legal liability or responsibility for the accuracy, completeness, or usefulness of any information, apparatus, product, or process disclosed, or represents that its use would not infringe privately owned rights.  Reference herein to any specific commercial product, process, or service by trade name, trademark, manufacturer, or otherwise does not necessarily constitute or imply its endorsement, recommendation, or favoring by the United States Government or any agency thereof.  The views and opinions of authors expressed herein do not necessarily state or reflect those of the United States Government or any agency thereof.

#### License

This specification is free software and it can be redistributed and/or modified under the terms of the [MIT License](https://github.com/sttp/Specification/blob/master/LICENSE). This specification is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

## Table of Contents

| Section | Title |
|:-------:|---------|
|   | [Title Page](#title-page) |
|   | [Preface](#disclaimer) |
| 1 | [Introduction](#introduction) |
| 2 | [Definitions and Nomenclature](#definitions-and-nomenclature) |
| 3 | [Protocol Overview](#protocol-overview) |
| ? | (balance of sections) |
| ~20 | [References and Notes](#references-and-notes) |
| ~21 | [Contributors and Reviewers](#contributors) |
| ~22 | [Revision History](#major-version-history) |
| A | [Appendix A - STTP API Reference ](#appendix-a---sttp-api-reference) |
| B | [Appendix B - IEEE C37.118 Mapping](#appendix-b---ieee-c37-118-mapping) |
|   | [Spec To-Do List](#specification-development-to-do-list) |

### Introduction

Use of synchrophasors by U.S. utilities continues to grow following the jump start provided by the Smart Grid Investment Grants.   Even so, the dominant method to exchange synchrophasor data remains the IEEE C37.118-2005 [[2](#ref2)] protocol that was designed for and continues to be the preferred solution for substation-to-control room communications.  It achieves its advantages through use of an ordered set (a frame) of information that is associated with a specific measurement time.  When IEEE C37.118 is used for PDC-to-PDC communication or for PDC-to-Application communication, large data frames are typically distributed to multiple systems.  To address the challenges presented by these large frame sizes, many utilities implement purpose-built networks for synchrophasor data only.  Even with these purpose-built networks, large frame sizes result in an increased probability of UDP frame loss, or in the case of TCP, increased communication latency.  In addition, IEEE C37.118 has only prescriptive methods for the management of measurement metadata which is well-suited for substation-to-control-center use but which becomes difficult to manage as this metadata spans analytic solutions and is used by multiple configuration owners in a wide-area context.

As a result, the ASP project ...

more ...

#### Scope of this Document

Purpose of doc, audience, etc.

Body text

### Definitions and Nomenclature

The styles used to show code, notes, etc.  

> To spice up the formatting of the spec, GitHub offers a library of emogi's.  some that we might want to play into nomenclature  :mag: :bulb: :computer: :wrench: :file_folder: :package: :pushpin: :new: :arrow_right: :arrow_forward: :arrows_counterclockwise: :hash: :soon: :heavy_plus_sign: :black_small_square: :paperclip: :warning: :information_source: :page_facing_up: :bar_chart: :earth_americas: :globe_with_meridians:  From use of the atom editor, it Looks like some are unique to GitHub and others are part of more standard collections.  Or we could make some custom ones that would be included as images.

For example,

> :information_source: This is an instructional note in the spec.

or for example,

> :warning: This is a very important note in the spec.

#### Definition of key terms

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119)

| Term | Definition |
|-----:|:-----------|
| **phasor** | A complex equivalent of a simple cosine wave quantity such that the complex modulus is the cosine wave amplitude and the complex angle (in polar form) is the cosine wave phase angle. |
| **synchrophasor** | A phasor calculated from data samples using a standard time signal as the reference for the measurement. Synchronized phasors from remote sites have a defined common phase relationship. |
|**term**| definition |

#### Acronyms

| Term | Definition |
|-----:|:-----------|
|**API**|Application Program Interface|
|**DOE**|U.S. Department of Energy|
|**GEP**|Gateway Exchange Protocol|
|**GPA**|Grid Protection Alliance, Inc.|
|**PDC**|Phasor Data Concentrator|
|**PMU**|Phasor Measurement Unit|
|**STTP**|Streaming Telemetry Transport Protocol|
|**TCP**| |
|**UDP**| |
|**UTC**|Universal Time Coordinated|

### Protocol Overview

Purpose of protocol, fundamentals of how it works (command and data)
Include sub-section titles ( 4# items) as needed

#### Protocol Feature Summary

- this is the protocol promotional section that includes
- a bulleted list of the "value points" for the protocol

Introduce the each of topical sections that follow.

> **Candidate major topic headings:**  (3# items) Command channel, data channel, compression, security, filter expressions, metadata, ....

### Topic 1

body text

> **Ritchie** We're going to need a place to post and update images on the web.  Ideally we should use GitHub as well for these images so others can post new images.  Ideas??  
> **Russell** I created an *Images* folder, i.e., `Section/Images/` relative to `STTP/Specification` that should work, e.g.:
> ![Example Image](Images/ecaAPI.png)

### Topic 2

body text

### References and Notes

1. [The MIT Open Source Software License](https://opensource.org/licenses/MIT)
2. [IEEE Standard C37.118™, Standard for Synchrophasors for Power Systems](https://standards.ieee.org/findstds/standard/C37.118.2-2011.html)
3. [RFC 2119, Current Best Practice](https://tools.ietf.org/html/rfc2119) Scott Bradner, Harvard University, 1997
4. [STTP repository on GitHub](https://github.com/sttp)
5. ...

### Contributors

The following individuals actively participated in the development of this standard.

- J. Ritchie Carroll, GPA
- F. Russell Robertson, GPA
- Stephen C. Wills, GPA


#### ASP Project Participants
![Project Participants](Images/participant-logos.png)

![Project Participant Matrix](Images/participant-matrix.png)

#### Copyright Statement

- Copyright &copy; 2017, Grid Protection Alliance, Inc., All rights reserved.

### Major Version History

| Version | Date | Notes |
|--------:|------|:------|
| 0.1 | TBD, 2017 | Initial draft for validation of use of markdown |
| 0.0 | June 15, 2017 | Specification template |

### Appendix A - STTP API Reference

appendix body

appendix body

> :bulb: Links to language specific auto-generated XML code comment based API documentation would be useful.

### Appendix B - IEEE C37-118 Mapping
appendix body

appendix body

### Specification Development To-Do List

- [x] Determine the location for posting images ( June 19, 2017 )
- [ ] Sample item 2 ( date )
- [ ] Sample item 3 ( date )
