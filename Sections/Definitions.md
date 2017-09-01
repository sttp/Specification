## Definitions and Nomenclature

> :construction: Please add liberally to this section as terms are introduced in the spec

### Definition of Key Terms

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in RFC 2119 <sup>[[3](References.md#user-content-ref3)]</sup>.

>:information_source: All the terms below are hyperlinked to a key source for the definition or to a reference where more information is available.

| Term | Definition |
|-----:|:-----------|
| [**certificate**](https://en.wikipedia.org/wiki/X.509#Certificates) | A file that contains a public key and identity information, e.g., an organization name, hostnames, IP addresses, etc. The X.509 standard defines a standard format for certificate files that can either be self-signed or signed by a certificate authority. Certificates are used in conjunction with public-key infrastructure to provide identity validation and encryption keys used to secure IP transport protocol communications, such as with the TLS protocol. <br/> Also called _X.509 Certificate_. |
| **command channel** | STTP functionality, usually implemented using a reliable communications protocol, that is used to exchange command messages in a publisher/subscriber connection. |
| **data channel** | STTP functionality, implemented using either a reliable or lossy communications protocol, that is used to send data messages in a publisher/subscriber connection. |
| [**data point**](https://en.wikipedia.org/wiki/Data_point) | A measurement of identified data along with any associated state, e.g., time of measurement and quality of measured data. |
| [**data structure**](https://en.wikipedia.org/wiki/Data_structure) | An organized set of primitive data types where each element has a meaningful name. |
| **frame** | A data-structure composed of primitive data types that has been serialized into a discrete binary package. |
| [**endianess**](https://en.wikipedia.org/wiki/Endianness) | The hardware prescribed ordinal direction of the bits used to represent a numerical value in computer memory; usually noted as either _big_ or _little_. |
| [**endpoint**](https://en.wikipedia.org/wiki/Communication_endpoint) | A combination of an IP address (or hostname) and port number that represents a unique identification for establishing communications on an IP network. Endpoints, along with an IP transport protocol, are used by a socket to establish inter-device network communications. <br/> Also called _network endpoint_. |
| [**Ethernet**](https://en.wikipedia.org/wiki/Ethernet) | Frame based data transmission technology used in local area networks. |
| [**firewall**](https://en.wikipedia.org/wiki/Firewall_%28computing%29) | A security system used on a computer network, existing as software on an operating system or a standalone hardware appliance, used to control the ingress and egress of network communication paths , i.e., access to endpoints, based on a configured set of rules. Security zones between networks are established using firewalls to limit accessible resources between _secure_ internal networks and _untrusted_ external networks, like the Internet. |
| [**fragmentation**](https://en.wikipedia.org/wiki/IP_fragmentation) | A process in computer networking that breaks frames into smaller fragments, called packets, that can pass over a network according to an MTU size limit. Fragments are reassembled by the receiver. <br/> Also called _network fragmentation_ |
| [**gateway**](https://en.wikipedia.org/wiki/Gateway_%28telecommunications%29) | A network system used to handle multi-protocol data exchange on the edge of a network boundary. For this specification, an edge system that uses STTP to bidirectionally exchange data with another system that uses STTP. |
| [**hostname**](https://en.wikipedia.org/wiki/Hostname) | A human readable label used in a computer network that maps to an IP address. A hostname can be used instead of an IP address to establish a socket connection for inter-device network communications. Resolution of a hostname to its IP address is handled by a DNS service which is defined as part of a system's IP configuration. |
| [**IP address**](https://en.wikipedia.org/wiki/IP_address) | An unsigned integer, either 32-bits for version 4 addresses or 128-bits for version 6 address, used to uniquely identify all devices connected to a computer network using Internet Protocol. The address combined with a port number creates a unique endpoint that is used by a socket to establish a communications channel on a host system. |
| [**IP transport protocol**](https://en.wikipedia.org/wiki/Transport_layer) | An established set of governing principals that define the rules and behaviors for the transmission of data between two entities when using Internet Protocol. The most commonly used IP transport protocols are TCP and UDP. |
| **measurement** |  |
| [**packet**](https://en.wikipedia.org/wiki/Network_packet) | A block of data carried by a network whose size is dictated by the MTU. <br/> Also called _network packet_. |
| [**phasor**](https://en.wikipedia.org/wiki/Phasor) | A complex equivalent of a simple cosine wave quantity such that the complex modulus is the cosine wave amplitude and the complex angle (in polar form) is the cosine wave phase angle. |
| [**port**](https://en.wikipedia.org/wiki/Port_%28computer_networking%29) | A 16-bit unsigned integer that, along with an IP address, represents a unique endpoint for establishing communications on an IP network. A port and associated IP address, i.e., an endpoint, and a IP transport protocol is used by a socket to establish a unique communications channel. <br/> Also called _network port_. |
| [**primitive type**](https://en.wikipedia.org/wiki/Primitive_data_type) | A specific type of data provided by a programming language referenced by a keyword that represents the most basic unit of data storage - examples can include integer, float and boolean values. <br/> Also called _primitive data type_. |
| [**publish/subscribe**](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) | A messaging pattern where senders of messages, called publishers, do not program the messages to be sent directly to specific receivers, called subscribers, but instead characterize published messages into classes without knowledge of which subscribers, if any, there may be. |
| **publisher** | STTP functionality that is used by a data provider to provision data to be sent to consumers, i.e., subscribers.  |
| [**null**](https://en.wikipedia.org/wiki/Null_pointer) | A value reserved for indicating that a reference, e.g., a pointer, is not initialized and does not refer to a valid object. |
| [**serialization**](https://en.wikipedia.org/wiki/Serialization) | Process of transforming data structures into a format that is suitable for storage or transmission over a network. |
| **signal** | |
| [**socket**](https://en.wikipedia.org/wiki/Network_socket) | A network communications mechanism, created as a programming language construct, used for sending and/or receiving data at a single destination within an IP network that is established with an endpoint and selected IP transport protocol. <br/> Also called _network socket_. |
| **subscriber** | STTP functionality that is used by a data consumer to provision data to be received from providers, i.e., publishers. |
| [**synchrophasor**](https://en.wikipedia.org/wiki/Phasor_measurement_unit) | A phasor calculated from data samples using a standard time signal as the reference for the measurement. Synchronized phasors from remote sites have a defined common phase relationship. |
| [**time series**](https://en.wikipedia.org/wiki/Time_series) | A series of data points indexed in time order, most commonly measured as a sequence taken at successive equally spaced points in time. |

### Acronyms

| Term | Definition |
|-----:|:-----------|
| **AES** | [Advanced Encryption Standard](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) |
| **API** | [Application Program Interface](https://en.wikipedia.org/wiki/Application_programming_interface) |
| **BES** | [Bulk Electric System](http://www.nerc.com/pa/RAPA/Pages/BES.aspx) |
| **CA** | [Certificate Authority](https://en.wikipedia.org/wiki/Certificate_authority) |
| **DOE** | [United States Department of Energy](https://en.wikipedia.org/wiki/United_States_Department_of_Energy) |
| **DDS** | [Data Distribution Service](https://en.wikipedia.org/wiki/Data_Distribution_Service) |
| **DNS** | [Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System) |
| **DTLS** | [Datagram Transport Layer Security](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security) |
| **GEP** | [Gateway Exchange Protocol](http://gridprotectionalliance.org/docs/products/gsf/gep-overview.pdf) |
| **GPA** | [Grid Protection Alliance, Inc.](https://www.gridprotectionalliance.org/) |
| **GPS** | [Global Positioning System](https://en.wikipedia.org/wiki/Global_Positioning_System) |
| **GUID** | [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) |
| **ICCP** | [Inter-Control Center Communications Protocol](https://en.wikipedia.org/wiki/IEC_60870-6) |
| **IP** | [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol) |
| **ISO** | [Independent System Operator](https://en.wikipedia.org/wiki/Regional_transmission_organization_%28North_America%29) |
| **MTU** | [Maximum Transmission Unit](https://en.wikipedia.org/wiki/Maximum_transmission_unit) |
| **NaN** | [Not a Number](https://en.wikipedia.org/wiki/NaN) |
| **NAT** | [Network Address Translation](https://en.wikipedia.org/wiki/Network_address_translation) |
| **PDC** | [Phasor Data Concentrator](http://en.openei.org/wiki/Definition:Phasor_Data_Concentrator_%28PDC%29) |
| **PMU** | [Phasor Measurement Unit](https://en.wikipedia.org/wiki/Phasor_measurement_unit) |
| **PKI** | [Public Key Infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure)
| **STTP** | [Streaming Telemetry Transport Protocol](https://github.com/sttp/) |
| **TCP** | [Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) - _also as_ &nbsp;**TCP/IP** |
| **TLS** | [Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) |
| **UDP** | [User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol) - _also as_ &nbsp;**UDP/IP** |
| **UTC** | [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) |
| **X.509** | [PKI Standard for Certificates](https://en.wikipedia.org/wiki/X.509) |
| **ZeroMQ** | [Brokerless Messaging Queuing and Distribution Library](https://en.wikipedia.org/wiki/ZeroMQ) |

### Document Conventions

Markdown notes in combination with the [Github Emogi](https://gist.github.com/rxaviers/7360908) images are used as callouts.  The standard callouts are:


> :information_source: This is a call out in the spec to provide background, instruction or additional information

> :warning: This note use used to highlight important or critical information.

> :wrench: This note is used to call out information related to reference implementations or API development.

> :construction: A informal note to document authors to facilitate specification development

> :tomato::question: (author's initials): _May be used by anyone to toss out questions and comments that are temporal. These may be inserted at any point in any of the markdown documents.  These questions will preserved as they are migrated to the [QuestionsSummary.md](QuestionsSummary.md) file from time-to-time._

Code blocks are shown as:
```C#
    public function void DisplayHelloWorld()
    {
        Console.WriteLine("Hello world!");
    }
```

Code is also shown `inline` as well.
