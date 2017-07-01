<a name="title-page"></a>
![STTP](Images/sttp-logo-with-participants.png)

**Version:** 0.0.24 - June 30, 2017

**Status:** Initial Development

**Abstract:** This specification defines a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) data transfer protocol that has been optimized for exchanging streaming [time series](https://en.wikipedia.org/wiki/Time_series) style data, such as [synchrophasor](https://en.wikipedia.org/wiki/Phasor_measurement_unit) data that is used in the electric power industry, over [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) (IP). The protocol supports transferring both real-time and historical time series data at full or down-sampled resolutions. Protocol benefits are realized at scale when multiplexing very large numbers of time series [data points](https://en.wikipedia.org/wiki/Data_point) at high speed, such as, hundreds of times per second per data point.

<br/>
Copyright &copy; 2017, Grid Protection Alliance, Inc., All rights reserved.

***

#### Disclaimer

This document was prepared as a part of work sponsored by an agency of the United States Government (DE-OE-0000859).  Neither the United States Government nor any agency thereof, nor any of their employees, makes any warranty, express or implied, or assumes any legal liability or responsibility for the accuracy, completeness, or usefulness of any information, apparatus, product, or process disclosed, or represents that its use would not infringe privately owned rights.  Reference herein to any specific commercial product, process, or service by trade name, trademark, manufacturer, or otherwise does not necessarily constitute or imply its endorsement, recommendation, or favoring by the United States Government or any agency thereof.  The views and opinions of authors expressed herein do not necessarily state or reflect those of the United States Government or any agency thereof.

#### License

This specification is free software and it can be redistributed and/or modified under the terms of the MIT License <sup>[[2](#user-content-ref2)]</sup>. This specification is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

## Table of Contents

| Section | Title |
|:-------:|---------|
|   | [Title Page](#user-content-title-page) |
|   | [Preface](#disclaimer) |
| 1 | [Introduction](#introduction) |
| 2 | [Business Case](#business-case) |
| 3 | [Definitions and Nomenclature](#definitions-and-nomenclature) |
| 4 | [Protocol Overview](#protocol-overview) |
| 5 | [Design Philosophies](#design-philosophies) |
| 6 | [Data Point Structure](#data-point-structure) |
| 7 | [Commands and Responses](#commands-and-responses) |
| 8 | [Data Point Characteristics](#data-point-characteristics) |
| 9 | [Metadata](#metadata) |
| 10 | [Compression](#compression) |
| 11 | [Security](#security) |
| 12 | [References and Notes](#references-and-notes) |
| 13 | [Contributors and Reviewers](#contributors) |
| 14 | [Revision History](#major-version-history) |
|  A | [Appendix A - STTP API Reference ](#appendix-a---sttp-api-reference) |
|  B | [Appendix B - IEEE C37.118 Mapping](#appendix-b---ieee-c37118-mapping) |

## Introduction

Use of synchrophasors by U.S. utilities continues to grow following the jump start provided by the Smart Grid Investment Grants. Even so, the dominant method to exchange synchrophasor data remains the IEEE C37.118 <sup>[[1](#user-content-ref1)]</sup> protocol that was designed for and continues to be the preferred solution for substation-to-control room communications.  It achieves its advantages through use of an ordered set (a frame) of information that is associated with a specific measurement time.  When IEEE C37.118 is used for PDC-to-PDC communication or for PDC-to-Application communication, large data frames are typically distributed to multiple systems.  To address the challenges presented by these large frame sizes, many utilities implement purpose-built networks for synchrophasor data only.  Even with these purpose-built networks, large frame sizes result in an increased probability of UDP frame loss, or in the case of TCP, increased communication latency.  In addition, IEEE C37.118 has only prescriptive methods for the management of measurement metadata which is well-suited for substation-to-control-center use but which becomes difficult to manage as this metadata spans analytic solutions and is used by multiple configuration owners in a wide-area context.

To address these issues, the Advanced Synchrophasor Protocol (ASP) Project was proposed to DOE in response to FOA-1492. In this project proposal, the argument was made for a new protocol that overcomes the limitations of IEEE C37.118 for large-scale synchrophasor data system deployments.  The new protocol proposed leveraged the successful design elements of the secure Gateway Exchange Protocol (GEP) that was originally developed by the Grid Protection Alliance (GPA) as part of the SIEGate project (DE-OE-536).

On May 1, 2017, a DOE grant (DE-OE-859) was awarded to GPA and the other 25 collaborators on ASP Project (see [Contributors](#contributors) section) to develop: (1) a detailed definition of new publish-subscribe protocol, now called the Streaming Time-series Transport Protocol (STTP) and (2) software to support it including production-grade implementations of STTP API's in multiple development platforms along with a collection of tools to test and validate the new protocol.

### Scope of this Document

The purpose of this document is to define STTP and to include, as appendices, descriptions as to how to use its supporting software tools.  This STTP specification is focused on effective "streaming data" delivery of which synchrophasor data is a very important use case.

In the [Overview](#protocol-overview) section of this specification, high-level features and the business value of STTP are presented. The balance of the sections of the specification provide the details of protocol design.

[Appendix A - STTP API Reference](#appendix-a---sttp-api-reference) provides instructions to enable software developers to integrate and use of STTP within other software systems.

[Appendix B - IEEE C37.118 Mapping](#appendix-b---ieee-c37118-mapping) provides a detailed look at the process of transforming IEEE C37.118 into STTP as well as creating IEEE C37.118 streams from STTP.

While the format and structure of this document, established to facilitate collaboration, is different than that used by standards bodies, it is hoped that the content within this document can meet all the information requirements needed to enable repackaging of this specification into draft standard formats.

## Business case

At the conclusion of the STTP project in April 2019, STTP will be a well-tested, thoroughly vetted, production-grade protocol that will be supported by project team vendors.  An open source tool suite for STTP will be developed as part of the project (see [Appendix A](#appendix-a---sttp-api-reference)) that will include a test harness that will allow utilities and vendors outside the project to test and validate STTP in their systems and API's.

STTP offers both short-term cost savings and strategic value in that it is:

#### Intrinsically Robust

By design, STTP packet sizes are small and are optimized for network MTU size reducing fragmentation which results in more efficient TCP performance and less overall data loss with UDP.  STTP also puts significantly less stress on network routing equipment and facilitates mixing of streaming data traffic and other general network communications.  With STTP, purpose built networks are not required to reliably support very large phasor data streams.

#### Security Centric

 STTP has been built using a "security first" design approach.  Authentication to establish a connection with other parties requires a certificate.  While public certificate providers can be used, it is recommended that symmetric certificates be exchanged out-of-band to avoid the risk and cost of management of public keys. Best-practice encryption is natively available in STTP but not required given the common practice to manage encryption at the network layer.

#### Reduces First Cost

 GEP has been measured <sup>[[5](#user-content-ref5)]</sup> to have less than half the band width requirements of IEEE C37.118 <sup>[[1](#user-content-ref1)]</sup> when used with TCP and simple methods for lossless compression.  With the compression, a single signal or measurement point (i.e., an identifier, timestamp, value and quality code) requires only 2.5 bytes. By comparison, IEEE C37.118 requires 4.5 bytes per measurement on average. The signal-based GEP protocol incorporates Pub/Sub data exchange methods so that unnecessary data points need not be exchanged – thereby further reducing overall bandwidth requirements as compared to IEEE C37.118.

#### Reduces Operating Cost

GEP automatically exchanges and synchronizes measurement level meta-data using a GUID as the key value to allow the self-initialization and integration of rich meta-data with points from multiple connected synchrophasor networks.  This eliminates the need to map measurements to a pre-defined set identifiers and dispenses with the cost and hassles of synchronization of individual utility configuration with a centralized registry. Permissions for data subscriptions can be grouped and filtered using expressions to assure that only the signals that are authorized are shared (for example, all phasors from a specified substation) while the set of points available is dynamically adjusted as PMUs come and go without the need for point-by-point administrator approval.

#### An Enabling Technology

It's possible that a protocol like STTP which allows secure, low-latency, high-volume data exchange among utilities at low cost can be a major factor in driving change in the industry.  New higher-speed forms of inter-utility interaction will be possible, and new approaches for providing utility information services will be realizable.  In addition, STTP provides an alternative to the existing method for utility data exchange that will enable future generations of SCADA/EMS systems to both (1) utilize full-resolution synchrophasor data streams and (2) significantly reduce the cost of maintaining the configuration of components to exchange other real-time data.

> :information_source: ICCP (IEC 60870-6/TASE.2) is the international standard used to exchange "real-time" SCADA data among electric utilities.  It's not uncommon for an ISO/RTO to consume hundreds of thousands of SCADA data points via ICCP from its member utilities and to exchange an equal number of points with its ISO/RTO neighbors. Real-time can be at a fast scan rate (every 2 seconds for regulation), or real-time data can be at a slower scan rate (every 4 seconds or every 10 seconds) for transmission system data.  Some data (generally analog measurement data) is exchanged continuously and some data (generally bi-modal data) like breaker status is only exchanged "on change".  ICCP came into coordinated use in North America in the mid-1990s.

#### Built Upon A Proven Approach

 STTP will enhance the successful design elements of the Gateway Exchange Protocol (GEP) as a foundation and improve upon it. GEP is currently in production use by Dominion, Entergy, MISO, PeakRC, TVA, FP&L, Southern Company, among others.

## Definitions and Nomenclature

> :construction: Please add liberally to this section as terms are introduced in the spec

### Definition of Key Terms

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in RFC 2119 <sup>[[3](#user-content-ref3)]</sup>.

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

> :tomato::question: (author's initials): May be used by anyone to toss out questions and comments that are temporal. These may be inserted at any point in any of the markdown documents.  These questions will preserved as they are migrated to the [QuestionsSummary.md](https://github.com/sttp/Specification/blob/master/QuestionsSummary.md) file from time-to-time.

Code blocks are shown as:
```C#
    public function void DisplayHelloWorld()
    {
        Console.WriteLine("Hello world!");
    }
```

Code is also shown `inline` as well.

## Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

In typical messaging exchange paradigms a source application hosts a block of structured data, composed in memory, with the intent to transmit the data to one or more receiving applications. The data has _structure_ in the sense that it exists as a collection of simpler primitive data types where each of the data elements is given a name to provide useful context and meaning; most programming languages represent data structures using a primary key word, e.g., `class` or `struct`. Before transmission, the data structure must be serialized - this is necessary because the programming language of the source application which hosts the data structure defines the structure in memory using a format that is optimized for use in the application. The process of serializing the data structure causes each of the data elements to be translated into a format that is easily transmitted over a network and is suitable for deserialization by a receiving application.

The applications that are sending and receiving data structures can be running on the same machine or on different physical hardware with disparate operating systems. As a result, the details of the data structure serialization format can be complex and diverse. Such complexities can include issues with proper handling of the endianess of the primitive data types during serialization which may differ from the system that is deserializing the data, or differences in the interpretation of how character data is encoded <sup>[[6](#user-content-ref6)]</sup>.

The subject of serializing data structures in the field of computer science has become very mature; many solutions exist to manage the complexities of serialization. Today most computer programming languages, or their associated frameworks, include various options for serializing data structures in multiple formats. However, these solutions tend to only work within their target ecosystems and are usually not very interoperable with other frameworks or languages.

When interoperability is important, other technologies exist that focus on data structure serialization that works regardless of hardware, operating system or programming language. Two of these serialization technologies that are in wide use are Google Protocol Buffers <sup>[[7](#user-content-ref7)]</sup> and the Facebook developed Apache Thrift <sup>[[8](#user-content-ref8)]</sup>. Both of these serialization frameworks create highly compact, cross-platform serializations of data structures with APIs that exist in many commonly used programming languages.

> :information_source: In the electric power industry, the IEEE C37.118 <sup>[[1](#user-content-ref1)]</sup> protocol exists as a standard serialization format for the exchange of synchrophasor data. Synchrophasor data is typically measured with an accurate time source, e.g., a GPS clock, and transmitted at high-speed data rates, up to 120 frames per second. Measured data sent by this protocol is still simply a frame of serialized primitive types which includes data elements such as a timestamp, status flags, phasor angle / magnitude pairs, etc. The IEEE C37.118 protocol also prescribes the combination of data frames received from multiple source devices for the same timestamp into one large combined frame in a process known as concentration. The concentration process demands that a waiting period be established to make sure all the expected data frames for a given timestamp arrive. If any frames of data do not arrive before the waiting period expires, the overall combined frame is published anyway. Since the frame format is fixed, empty data elements that have no defined value, e.g., NaN or null, still occupy space for the missing frames.

For smaller sized, discrete data structures, the existing available serialization technologies are very fast and highly effective. However, as the data structures become larger, the process of serialization and deserialization becomes more costly in terms of both memory allocation and computational processing. Because of this, large frames of data are not recommended for use by these serialization technologies <sup>[[9](#user-content-ref9)]</sup> <sup>[[10](#user-content-ref10)]</sup>. Additionally, and perhaps more importantly, there are also penalties that occur at the network transport layer.

> :information_source: For the purposes of this specification, serialized data structures will be referred to as a _frames_, regardless of the actual binary format.

### Large Frame Network Impact

In terms of Internet Protocol (IP), all frames of data to be transmitted that exceed the negotiated maximum transmission unit (MTU) size (typically 1,500 bytes for Ethernet networks <sup>[[11](#user-content-ref11)]</sup>) are divided into multiple fragments where each fragment is called a network packet.

![Packet Fragementation](https://sysmincomputing.files.wordpress.com/2010/12/frag.png)

The impacts of large frames on an IP network are determined by the number of network packets required to send the frame and the fact that IP is inherently unreliable by design. Network packets can only be transmitted over a connection one packet at a time; when two or more network packets arrive for transmission at the same time on any physical network media, the result is a collision. When a collision occurs, only one packet gets sent and the others get dropped <sup>[[12](#user-content-ref12)]</sup>. IP defines a variety of different transport protocols for network packet transmission, each of which behave in different manners when dealing with packet loss. Consequently, many of the impacts a large frame has on an IP network is dependent upon the transport protocol used to send the frame.

#### Large Frame Impacts on TCP/IP

The most common Internet protocol, TCP/IP, creates an index for each of the network packets being sent for a frame of data and verifies that each are successfully delivered, retransmitting packets as many times as needed in the case of loss. This functionality is the basis for TCP being considered a _reliable_ data transmission protocol.

Since each packet of data for the transmitted frame is sequentially ordered, TCP is able to fully reconstruct and deliver the original frame once all the packets have arrived. However, for very large frames of data this causes TCP to suffer from the same kinds impacts on memory allocation and computational burden as the aforementioned serialization technologies, i.e., Protocol Buffers and Thrift. The unique distinction for IP based protocols is that at some level, these issues also affect every element of the interconnected network infrastructure between the source and sync of the data being exchanged.

Another critical impact that is unique to TCP is that for data that needs to be delivered in a timely fashion, retransmissions of dropped frames can also cause cumulative time delays <sup>[[13](#user-content-ref13)]</sup>, especially as large data frames are published at rapid frame rates. Time delays are also exacerbated during periods of increased network activity which induces congestion and a higher rate of collisions.

> :information_source: Synchrophasor data is the source for real-time visualization and analysis tools which are used to operate the bulk electric system (BES). This real-time data is required to be accurate, dependable and timely in order to be useful for grid operators <sup>[[14](#user-content-ref14)]</sup>. Any delays in the delivery of this data could have adverse affects on operational decisions impacting the BES.

#### Large Frame Impacts on UDP/IP

Another common Internet protocol is UDP/IP. Transmission of data over UDP differs from TCP in the fact that UDP does not attempt to retransmit data nor does it make any attempts to maintain the order of the transmitted packets. This functionality is the basis for UDP being considered a _lossy_ data transmission protocol, but more lightweight than TCP.

Even with the unreliable delivery caveats, UDP will still attempt to reconstruct and deliver the originally transmitted frame of data. However, even if a single network packet is dropped, the entire original frame will be lost and any packets that were already accumulated get discarded <sup>[[15](#user-content-ref15)]</sup>. In other words, there are no partial frame deliveries, frame reception with UDP is an all or nothing operation.

Since UDP attempts frame reconstruction with the received packets, the impact of very large frames of data with UDP are similar to those with TCP and serialization technologies in that there is increased memory allocation and computational processing throughout the network infrastructure.

The more problematic impact with UDP and large frames of data is that the increased number of network packets needed to send a large frame also increases the probability of dropping one of those packets due to a collision. Since the loss of any one packet results in the loss of the entire frame of data, as frame size increases, so does volume of data loss.

##### Impacts of UDP Loss on Synchrophasor Data

For synchrophasor data, UDP is often the protocol of choice. The density of synchrophasor data allows analytical applications to tolerate _some_ loss. The amount of loss that can be tolerated depends on the nature of the analytic, however, as the loss increases the confidence in the analytic results decreases <sup>[[citation needed](#references-and-notes)]</sup>. Another reason UDP is used for synchrophasor data is its lightweight nature; use of UDP reduces overall network bandwidth requirements as compared to TCP <sup>[[16](#user-content-ref16)]</sup>. Perhaps the most critical reason for use of UDP for synchrophasor data is that UDP does not suffer from issues with induced time delays caused by retransmission of dropped network packets.

For IEEE C37.118 <sup>[[1](#user-content-ref1)]</sup> deployments, large frame sizes can have adverse affect on data completeness; as more and more devices are concentrated into a single frame of data, the larger frame sizes contribute to higher overall data losses. In tests conducted by PeakRC, measured overall data loss for the transmission of all of its synchrophasor data using IEEE C37.118 averaged over 2% <sup>[[5](#user-content-ref5)]</sup> when using a data rate of 30 frames per second and more than 3,100 data values per frame. To help mitigate the data losses when using UDP, some companies have resorted to purpose-built, dedicated synchrophasor networks <sup>[[17](#user-content-ref17)]</sup>. Although a dedicated network is ideal at reducing data loss (minimizing simultaneous network traffic results in fewer collisions), this will not be an option for most companies that treat the network as a shared resource.

### Changing the Paradigm

> :construction: Turn bullets into prose... This section needs to contrast how STTP is different / better than data structure serialization when applied to large data volumes

* When need exists to send large ~~frames~~ volumes data at high speeds, STTP is an excellent option. Otherwise, for smaller datasets, suggest sending data using protobuf or thrift.
* The nature of IP is not going to change
* With STTP, delivery of the data is made more atomic to fit within MTU size, i.e., data is reduced to its primitive types and only the values that will fit into a single packet are transmitted to reduce (or eliminate) frame fragmentation - contrast previous large frame impacts where possible
* Sending primitives instead of data structure can increase bandwidth, but it will reduce data losses (cite GEP testing)
* External APIs exist (e.g., openECA) to manage serialization and deserialization of data structures from primitives - so the data structure, if useful, while managing data delivery of the primitive types can still be used - add note that technically IEEE C37.118 is just a data structure mapping to primitives
* Managing data at the primitive level adds granular control of access control rights as well as ability for data receivers to "subscribe" to only the data of interest
* Introduce individual primitive values as time series data points - time required(?), but may simply be an auto-incrementing integer value
* For each time series data point, rich metadata will be made available
* Lead into next section for deeper detail

### Protocol Feature Summary

> :construction: This is the protocol promotional section that includes a bulleted list of the "value points" for the protocol

* Perform at high volume / large scale
* Minimize data losses (e.g., over UDP)
* Lower bandwidth requirements (e.g., over TCP)
* Optimized for the performant delivery of individual data points
* Automated exchange of metadata (no centralized registry required)
* Detect and expose communication issues
* Security and availability features that enable use on critical systems to support critical operations
* Publish/subscribe at data point level
* API implemented in multiple languages on multiple platforms
* Metadata will be versioned
* Metadata will be tabular in nature (describe like a database table)
* Sets of metadata from multiple parties will be easy to merge (introduce Guid for point ID)
* Points defined in metadata will have a clear ownership path
* A minimal set of metadata will exist to support any STTP deployments
* Industry specific metadata extensions will exist to support specific industry deployments

### Protocol Transport Channels

STTP data transport requires the use of a command channel using TCP/IP for reliable delivery of important commands. Optionally a secondary data channel can be established using UDP/IP for the transport of data that can tolerate loss. When no secondary UDP/IP is used, both commands and data will share use of the TCP/IP channel for communications.

> :tomato::question: JRC: _The question has been raised if a UDP only transport should be allowed? In this mode, any critical commands and responses would basically be sent over UDP. Thought would need to be given to commands and/or responses that never arrive and the consequences thereof._

_more_

> :information_source: Although not precluded from use over other data transports, the design of this protocol is targeted and optimized for use over Internet Protocol (IP), specifically TCP/IP and UDP/IP. Even so, since the command/response implementation and data packet distribution of the STTP protocol is fairly simple, it is expected that commonly available middleware data transport layers, such as ZeroMQ or DDS, could easily support and transmit data using the STTP protocol should any of the messaging distribution and management benefits of these transport layers be useful to a particular deployment environment. However, these types of deployments are outside the scope of this documentation. If needed, STTP integrations with middleware layers should be added as reference implementation repositories to the STTP organizational site <sup>[[4](#user-content-ref4)]</sup>.

## Data Point Structure

> :construction: Lead with paragraph on purpose / value of the section - (1) what is a data point structure and (2) why have a data point structure / value? Next paragraph would be contents of section...

... this section includes:

* Identification - maps to 128-bit Guid, transport mapping should be small
* Timestamp (required? could simply be a auto-incrementing counter)
* Value - multiple native types supports
* Flags - standardize minimal set of simple flags, complex state can be new data point

### Data Point Value Types

* Null
* Byte
* Int16
* Int32
* Int64
* UInt16
* UInt32
* UInt64
* Decimal
* Double
* Single
* DateTime (need some thought on proper encoding, perhaps options)
* TimeSpan (Tick level resolution, or better, would be ideal)
* Char (2-byte Unicode)
* Bool
* Guid
* String (encoding support for UTF-16, UTF-8, ANSI and ASCII)
* Byte[]

> :construction: Need to determine safe maximum upper limit of per-packet strings and byte[] data, especially since implementation could simply _span_ multiple data points to collate a larger string or buffer back together.

> :tomato::question: _Should API automatically handle collation of larger data types, e.g., strings and buffers?_

## Commands and Responses

> :construction: Purpose of command/response structure, fundamentals of how it works, why it is needed

### Commands

All commands must be sent over the command channel.

| Code | Command | Source | Description |
|:----:|---------|:------:|-------------|
| 0x00 | [Set Operational Modes](#set-operational-modes-command) | Subscriber | Defines desired set of operational modes. |
| 0x01 | [Metadata Refresh](#metadata-refresh-command) | Subscriber | Requests publisher send updated metadata. |
| 0x02 | [Subscribe](#subscribe-command) | Subscriber | Defines desired set of data points to begin receiving. |
| 0x03 | [Unsubscribe](#unsubscribe-command) | Subscriber | Requests publisher terminate current subscription. |
| 0x0n | etc. | | | |
| 0xFF | [NoOp](#noop-command) | Any | Periodic message to allow validation of connectivity. |

#### Set Operational Modes Command

This must be the first command sent after a successful connection - the command must be sent before any other commands or responses are exchanged so that the "ground-rules" for the communications session can be established. The rule for this operational mode negotiation is that once these modes have been established, they will not change for the lifetime of the connection.

The subscriber must send the command and the publisher must await its reception. If the publisher does not receive the command in a timely fashion (time interval controlled by configuration), it will disconnect the subscriber.

As part of this initial exchange, the subscriber will propose the desired protocol version to use.

> :information_source: In modes of operations where the publisher is initiating the connection, the publisher will still be waiting for subscriber to initiate communications with a `Set Operational Modes` command.

* Wire Format: Binary
* Requested operational mode negotiations
  * String encoding
  * Compression modes
  * UDP data channel usage / port

#### Metadata Refresh Command

* Wire Format: Binary
  * Includes current metadata version number

#### Subscribe Command

* Wire Format: Binary
  * Includes metadata expression and/or individual Guids for desired data points

#### Unsubscribe Command

  * Wire Format: Binary

#### NoOp Command

No operation keep-alive ping. It is possible for the command channel to remain quiet for some time if most data is being transmitted over the data channel, this command allows a periodic test of client connectivity.

* Wire Format: Binary

### Responses

Responses are sent over a designated channel based on the nature of the response.

| Code | Response | Source | Channel | Description |
|:----:|----------|:------:|:-------:|-------------|
| 0x80 | [Succeeded](#succeeded-response) | Publisher | Command | Command request succeeded. Response details follow. |
| 0x81 | [Failed](#failed-response) | Publisher | Command | Command request failed. Response error details follow. |
| 0x82 | [Data Point Packet](#data-point-packet-response) | Any | Data | Response contains data points. |
| 0x83 | [Signal Mapping](#signal-mapping-response) | Any | Command | Response contains data point Guid to run-time ID mappings. |
| 0x8n | etc. | | | | |

> :information_source: For the response table above, when a response is destined for the data channel, it should be understood that a connection can be established where both the command and data channel use the same TCP connection.

#### Succeeded Response

* Wire Format: Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Can include response that is specific to source command:

##### Succeeded Response for Metadata Refresh

* Wire Format: String + Binary
  * Includes response message with stats like size, number of tables etc.
  * Includes temporal data point ID for "chunked" metadata responses
  * Includes number of metadata data points to be expected

##### Succeeded Response for Subscribe

Subscriber will need to wait for

* Wire Format: String + Binary
  * Includes response message with stats like number of actual points subscribed,  
    count may not match requested points due to rights or points may no longer exist, etc.
  * Includes temporal data point ID for "chunked" signal mapping responses
  * Includes number of signal mapping data points to be expected

##### Succeeded Response for Unsubscribe

* Wire Format: String
  * Includes message as to successful unsubscribe with stats like connection time

#### Failed Response

* Wire Format: String + Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Includes error message as why command request failed
  * Can include response that is specific to source command:

##### Failed Response for Set Operational Modes

Failed responses to operational modes usually indicate lack of support by publisher. Failure response should include, per failed operational mode option, what options the publisher supports so that the operational modes can be re-negotiated by resending operational modes with a set of _supported_ options.

  * Wire Format: Binary
    * Includes operational mode that failed followed by available operational mode options

#### Data Point Packet Response

* Wire Format: Binary
  * Includes a byte flag indicating content, e.g.:
    * Data compression mode, if any
    * Total data points in packet
  * Includes serialized data points

:information_source: The data point packet is technically classified as a response to a `subscribe` command. However, unlike most responses that operate as a sole response to a parent command, data-packet responses will continue to flow for available measurements until an `unsubscribe` command is issued.

#### Signal Mapping Response

* Wire Format: Binary
  * Includes a mapping of data point Guids to run-time signal IDs
  * Includes per data point ownership state, rights and delivery characteristic details

## Data Point Characteristics

* Priority (e.g., control over data delivery priority)
* Reliability (e.g., must be sent over TCP channel)
* Verification (e.g., notification of successful transport)
* Exception (e.g., delivery on change)
* Resolution (e.g., down-sampling)

## Metadata

*  Wire Format: Tabular XML format (XML) - highly compressible
* Primary data point identifier is Guid (describe)
* Extensibility
* Rights based content restriction

### Dataset Contents

* Minimum required dataset for STTP operation
* Industry specific dataset extensions (outside scope of this doc)

### Dataset Filtering

* Format of expressions that work against metadata
  * SQL style expressions
  * Regex style expressions
* Application of expressions
  * Metadata reduction
  * Data point access security

### Dataset Versioning

* Versioned
* Difference based publication

### Dataset Serialization

* Serialization for transport
  * Packet based publication using temporal data point
  * Publisher reduction by access rights and diff-version
  * Subscriber reduction by filter expression
* Serialization to local repository
  * Merging considerations
  * Conflict resolution
  * Ownership control

## Compression

* Types of compression
  * Stateful data compression (TCP)
  * Per-packet data compression (UDP)
  * Metadata compression (GZip)
* Compression algorithm extensibility
  * Negotiating desired compression algorithm

## Security

* Access control list (ACL) security is always on

### Encrypted Communications

* Transport layer security (TLS) over TCP command channel
* UDP data channel traffic secured via AES keys exchanged over TCL command channel

### Strong Identity Validation

* X.509 certificates
* Self-signed certificates

### Publisher Initiated Security Considerations

How does publisher initiated connection, to cross security zones in desired direction, affect identity validation and TLS?

### Access Control Lists

* Allow/deny for specific points (data point explicit)
* Allow/deny for group with specific points (group explicit)
* Allow/deny for filter expression (filter implicit)
* Allow/deny for group with filter expression (group implicit)

#### Expression based Access Control

* Expressions can be used to define filters and groups
* How do filters work against extensible metadata, missing columns?

#### Access Control Precedence

* (1) Data Point Explicit
* (2) Group Explicit
* (3) Filter Implicit
* (4) Group Implicit

## References and Notes

1. <a name="ref1"></a>[C37.118.2-2011 - IEEE Standard for Synchrophasor Data Transfer for Power Systems](https://standards.ieee.org/findstds/standard/C37.118.2-2011.html), IEEE, 2011
2. <a name="ref2"></a>[The MIT Open Source Software License](https://github.com/sttp/Specification/blob/master/LICENSE)
3. <a name="ref3"></a>[RFC 2119, Current Best Practice](https://tools.ietf.org/html/rfc2119) Scott Bradner, Harvard University, 1997
4. <a name="ref4"></a>[STTP Repositories on GitHub](https://github.com/sttp), Various specification documents and reference implementations, 2017
5. <a name="ref5"></a>[New Technology Value, Phasor Gateway](https://www.naspi.org/naspi/sites/default/files/2017-03/PRSP_Phasor_Gateway_Whitepaper_Final_with_disclaimer_Final.pdf), Peak Reliability, Task 7 Data Delivery Efficiency Improvements, DE-OE-701., September 2016
6. <a name="ref6"></a>[Character Encoding](http://www.cs.tut.fi/~jkorpela/chars.html#encoding), Jukka Korpela, February 27, 2012
7. <a name="ref7"></a>[Google Protocol Buffers Overview](https://developers.google.com/protocol-buffers/docs/overview), Google, May 31, 2017
8. <a name="ref8"></a>[Thrift: Scalable Cross-Language Services Implementation](https://thrift.apache.org/static/files/thrift-20070401.pdf), Mark Slee, Aditya Agarwal and Marc Kwiatkowski, April 1, 2007
9. <a name="ref9"></a>[Protocol Buffers - Techniques - Large Data Sets](https://developers.google.com/protocol-buffers/docs/techniques#large-data), Google, December 10, 2015
10. <a name="ref10"></a>[Thrift Remote Procedure Call - Protocol considerations - Framed vs. unframed transport](https://github.com/apache/thrift/blob/master/doc/specs/thrift-rpc.md#framed-vs-unframed-transport), Apache Software Foundation, Apache Thrift Wiki, Sep 21, 2016
11. <a name="ref11"></a>[The default MTU sizes for different network topologies](https://support.microsoft.com/en-us/help/314496/the-default-mtu-sizes-for-different-network-topologies), Microsoft, Article ID: 314496, June 19, 2014
12. <a name="ref12"></a>[Collisions and collision detection - What are collisions in Ethernet?](https://howdoesinternetwork.com/2011/collisions), Valter Popeskic, November 16, 2011
13. <a name="ref13"></a>[The Delay-Friendliness of TCP](http://dna-pubs.cs.columbia.edu/citation/paperfile/164/votcp-cucs-023-07.pdf), Eli Brosh, Salman Abdul Base, Vishal Misra, Dan Rubenstein, Henning Schulzrinne, pages 7-8, October 2010
14. <a name="ref14"></a>[Real-Time Application of Synchrophasors for Improving Reliability](http://www.nerc.com/docs/oc/rapirtf/RAPIR%20final%20101710.pdf), RAPIR Task Force, October 18, 2010
15. <a name="ref15"></a>[User Datagram Protocol (UDP) and IP Fragmentation](https://notes.shichao.io/tcpv1/ch10/#ip-fragmentation), Shichao's Notes, Chapter 10
16. <a name="ref16"></a>[Synchrophasors and Communications Bandwidth](https://selinc.com/solutions/synchrophasors/report/115281/#different-communications-methods-using-sel-pmus-and-pdcs), Schweitzer Engineering Laboratories, April 1, 2010
17. <a name="ref17"></a>[Implementation and Operating Experience with Oscillation Detection at Bonneville Power Administration](https://www.naspi.org/sites/default/files/2017-03/01_bpa_donnelly_NASPI_presentation.pdf), Matt Donnelly, March 2017

## Contributors

The following individuals actively participated in the development of this standard.

- J. Ritchie Carroll, GPA
- F. Russell Robertson, GPA
- Stephen C. Wills, GPA


### ASP Project Participants
![Project Participants](Images/participant-logos.png)

![Project Participant Matrix](Images/participant-matrix.png)

### Specification Copyright Statement

- Copyright &copy; 2017, Grid Protection Alliance, Inc., All rights reserved.

## Major Version History

| Version | Date | Notes |
|--------:|------|:------|
| 0.1 | TBD, 2017 | Initial draft for validation of use of markdown |
| 0.0 | June 15, 2017 | Specification template |

## Appendix A - STTP API Reference

appendix body

appendix body

> :bulb: Links to language specific auto-generated XML code comment based API documentation would be useful.

## Appendix B - IEEE C37.118 Mapping
appendix body

appendix body
