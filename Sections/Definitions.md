## Definitions and Nomenclature

> :construction: Please add liberally to this section as terms are introduced in the spec

### Definition of Key Terms

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119)

>:information_source: All the terms below are hyperlinked to a key source for the definition or to a reference where more information is available.

| Term | Definition |
|-----:|:-----------|
| [**data point**](https://en.wikipedia.org/wiki/Data_point) | A measurement on a single member of a statistical population. |
| **frame** | |
| **measurement** | |
| [**phasor**](https://en.wikipedia.org/wiki/Phasor) | A complex equivalent of a simple cosine wave quantity such that the complex modulus is the cosine wave amplitude and the complex angle (in polar form) is the cosine wave phase angle. |
| [**publish/subscribe**](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) | A messaging pattern where senders of messages, called publishers, do not program the messages to be sent directly to specific receivers, called subscribers, but instead characterize published messages into classes without knowledge of which subscribers, if any, there may be. |
| **signal** | |
| [**synchrophasor**](https://en.wikipedia.org/wiki/Phasor_measurement_unit) | A phasor calculated from data samples using a standard time signal as the reference for the measurement. Synchronized phasors from remote sites have a defined common phase relationship. |
| **term** | definition |

### Acronyms

| Term | Definition |
|-----:|:-----------|
| **API** | [Application Program Interface](https://en.wikipedia.org/wiki/Application_programming_interface) |
| **DOE** | [United States Department of Energy](https://en.wikipedia.org/wiki/United_States_Department_of_Energy) |
| **DDS** | [Data Distribution Service](https://en.wikipedia.org/wiki/Data_Distribution_Service) |
| **GEP** | [Gateway Exchange Protocol](http://gridprotectionalliance.org/docs/products/gsf/gep-overview.pdf) |
| **GPA** | [Grid Protection Alliance, Inc.](https://www.gridprotectionalliance.org/) |
| **IP** | [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) |
| **MTU** | [Maximum Transmission Unit](https://en.wikipedia.org/wiki/Maximum_transmission_unit) |
| **PDC** | [Phasor Data Concentrator](http://en.openei.org/wiki/Definition:Phasor_Data_Concentrator_%28PDC%29) |
| **PMU** | [Phasor Measurement Unit](https://en.wikipedia.org/wiki/Phasor_measurement_unit) |
| **STTP** | [Streaming Telemetry Transport Protocol](https://github.com/sttp/) |
| **TCP** | [Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) |
| **UDP** | [User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol) |
| **UTC** | [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) |
| **GUID** | [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) |

### Document Conventions

Markdown notes in combination with the [Github Emogi](https://gist.github.com/rxaviers/7360908) images are used as callouts.  The standard callouts are:


> :information_source: This is a call out in the spec to provide background, instruction or additional information

> :warning: This note use used to highlight important or critical information.

> :construction: A informal note to document authors to facilitate specification development

> :tomato::question: (author's initials): May be used by anyone to toss out questions and comments that are temporal.  These may be inserted at any point in any of the markdown documents.  These questions will preserved as they are migrated to "QuestionsSummmary.md" from time-to-time.

Code blocks are shown as:
```C#
    public function void DisplayHelloWorld()
    {
        Console.WriteLine("Hello world!");
    }
```

Code is also shown `inline` as well.
