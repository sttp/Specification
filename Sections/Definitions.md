## Definitions and Nomenclature

> :construction: Please add liberally to this section as terms are introduced in the spec

### Definition of Key Terms

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in RFC 2119 <sup>[[3](References.md#user-content-ref3)]</sup>.

>:information_source: All the terms below are hyperlinked to a key source for the definition or to a reference where more information is available.

| Term | Definition |
|-----:|:-----------|
| [**data point**](https://en.wikipedia.org/wiki/Data_point) | A measurement on a single member of a statistical population. |
| [**data structure**](https://en.wikipedia.org/wiki/Data_structure) | An organized set of primitive data types where each element has a meaningful name. |
| **frame** | A data-structure composed of primitive data types that has been serialized into a discrete binary package. |
| [**endianess**](https://en.wikipedia.org/wiki/Endianness) | The hardware prescribed ordinal direction of the bits used to represent a numerical value in computer memory; usually noted as either _big_ or _little_. |
| [**Ethernet**](https://en.wikipedia.org/wiki/Ethernet) | Frame based data transmission technology used in local area networks. |
| **measurement** | |
| [**packet**](https://en.wikipedia.org/wiki/Network_packet) | A block of data carried by a network whose size is dictated by the MTU. <br/> Also called _network packet_. |
| [**phasor**](https://en.wikipedia.org/wiki/Phasor) | A complex equivalent of a simple cosine wave quantity such that the complex modulus is the cosine wave amplitude and the complex angle (in polar form) is the cosine wave phase angle. |
| [**primitive type**](https://en.wikipedia.org/wiki/Primitive_data_type) | A specific type of data provided by a programming language referenced by a keyword that represents the most basic unit of data storage - examples can include integer, float and boolean values. <br/> Also called _primitive data type_. |
| [**publish/subscribe**](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) | A messaging pattern where senders of messages, called publishers, do not program the messages to be sent directly to specific receivers, called subscribers, but instead characterize published messages into classes without knowledge of which subscribers, if any, there may be. |
| [**null**](https://en.wikipedia.org/wiki/Null_pointer) | A value reserved for indicating that a reference, e.g., a pointer, is not initialized and does not refer to a valid object. |
| [**serialization**](https://en.wikipedia.org/wiki/Serialization) | Process of transforming data structures into a format that is suitable for storage or transmission over a network. |
| **signal** | |
| [**synchrophasor**](https://en.wikipedia.org/wiki/Phasor_measurement_unit) | A phasor calculated from data samples using a standard time signal as the reference for the measurement. Synchronized phasors from remote sites have a defined common phase relationship. |
| [**time series**]((https://en.wikipedia.org/wiki/Time_series) | A series of data points indexed in time order, most commonly measured as a sequence taken at successive equally spaced points in time. |
| **term** | definition |

### Acronyms

| Term | Definition |
|-----:|:-----------|
| **API** | [Application Program Interface](https://en.wikipedia.org/wiki/Application_programming_interface) |
| **BES** | [Bulk Electric System](http://www.nerc.com/pa/RAPA/Pages/BES.aspx) |
| **DOE** | [United States Department of Energy](https://en.wikipedia.org/wiki/United_States_Department_of_Energy) |
| **DDS** | [Data Distribution Service](https://en.wikipedia.org/wiki/Data_Distribution_Service) |
| **GEP** | [Gateway Exchange Protocol](http://gridprotectionalliance.org/docs/products/gsf/gep-overview.pdf) |
| **GPA** | [Grid Protection Alliance, Inc.](https://www.gridprotectionalliance.org/) |
| **GPS** | [Global Positioning System](https://en.wikipedia.org/wiki/Global_Positioning_System) |
| **GUID** | [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) |
| **ICCP** | [Inter-Control Center Communications Protocol](https://en.wikipedia.org/wiki/IEC_60870-6) |
| **IP** | [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) |
| **ISO** | [Independent System Operator](https://en.wikipedia.org/wiki/Regional_transmission_organization_(North_America)) |
| **MTU** | [Maximum Transmission Unit](https://en.wikipedia.org/wiki/Maximum_transmission_unit) |
| **NaN** | [Not a Number](https://en.wikipedia.org/wiki/NaN) |
| **PDC** | [Phasor Data Concentrator](http://en.openei.org/wiki/Definition:Phasor_Data_Concentrator_%28PDC%29) |
| **PMU** | [Phasor Measurement Unit](https://en.wikipedia.org/wiki/Phasor_measurement_unit) |
| **STTP** | [Streaming Telemetry Transport Protocol](https://github.com/sttp/) |
| **TCP** | [Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) |
| **UDP** | [User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol) |
| **UTC** | [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) |
| **ZeroMQ** | [Brokerless Messaging Queuing and Distribution Library](https://en.wikipedia.org/wiki/ZeroMQ) |

### Document Conventions

Markdown notes in combination with the [Github Emogi](https://gist.github.com/rxaviers/7360908) images are used as callouts.  The standard callouts are:


> :information_source: This is a call out in the spec to provide background, instruction or additional information

> :warning: This note use used to highlight important or critical information.

> :construction: A informal note to document authors to facilitate specification development

> :tomato::question: (author's initials): May be used by anyone to toss out questions and comments that are temporal. These may be inserted at any point in any of the markdown documents.  These questions will preserved as they are migrated to the [QuestionsSummary.md](QuestionsSummary.md) file from time-to-time.

Code blocks are shown as:
```C#
    public function void DisplayHelloWorld()
    {
        Console.WriteLine("Hello world!");
    }
```

Code is also shown `inline` as well.
