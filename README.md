![STTP](Sections/Images/sttp-logo-with-title.png)

> :information_source: _Development of this specification has been superceded by the [IEEE 2664](https://standards.ieee.org/project/2664.html) effort to create a standard for the Streaming Telemetry Transport Protocol. The document created here should not be consider exhaustive, but will be left online for context and reference. Another document that was published by PNNL provides good information on the protocol as it compares to other standard streaming protocols used for synchrophasor data_: https://www.osti.gov/servlets/purl/1504742

This specification defines a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) data transfer protocol that has been optimized for exchanging streaming [time series](https://en.wikipedia.org/wiki/Time_series) style data, such as [synchrophasor](https://en.wikipedia.org/wiki/Phasor_measurement_unit) data that is used in the electric power industry, over [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) (IP). The protocol supports transferring both real-time and historical time series data at full or down-sampled resolutions. Protocol benefits are realized at scale when multiplexing very large numbers of time series [data points](https://en.wikipedia.org/wiki/Data_point) at high speed, such as, hundreds of times per second per data point.

Ideal use cases for STTP will include those that need to securely exchange large numbers of continuously measured data.

### Compiled Specification

Merged single file copies of the specification can be found in the [Output](Output) folder in markdown, HTML and PDF formats. These compiled outputs will be updated on a regular schedule, at least daily when any updates are checked into this repository - automated build occurs at the end of the day in the Eastern time zone.

### Specification Source

The specification source documentation on this site is separated into multiple files where each section is its own markdown file in the [Sections](Sections) folder. Navigation into the source documentation starts at the table of contents which is the default README of the `Sections` folder, see [Site Design](CONTRIBUTING.md#site-design) for more details. For help finding source markdown filename for a specified section title, see the [Section Map](Sections/SectionMap.md).

### Other Links

- [Contributing to the Draft STTP Specification](CONTRIBUTING.md)
- [Latest STTP **Draft Specification**](https://github.com/sttp/Specification/raw/master/Output/sttp-specification.pdf) - nightly build
- [STTP Authors](Sections/Contributors.md) - as self reported
- [ASP Project Overview](http://www.naspi.org/sites/default/files/2017-03/gpa_robertson_asp_doe_20170322.pdf)
- [Gateway Exchange Protocol (GEP)](http://gridprotectionalliance.org/docs/products/gsf/gep-overview.pdf) - used as a model for STTP
- [GEP Study by Peak RC](https://www.naspi.org/sites/default/files/2017-03/PRSP_Phasor_Gateway_Whitepaper_Final_with_disclaimer_Final.pdf)
- [Projected Project Timeline](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/project-timeline.png)
