## Definitions and Nomenclature

The words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended", "may", and "optional" in this document are to be interpreted as described in RFC 2119 <sup>[[3](References.md#user-content-ref3)]</sup>.

### Definition of Key Terms

>:information_source: All the terms below are hyperlinked to a key source for the definition or to a reference where more information is available.

| Term | Definition |
|-----:|:-----------|
| [**binary coded decimal**](https://en.wikipedia.org/wiki/Binary-coded_decimal) | A binary encoding scheme for decimal numbers that represents each digit with fixed number of bits.  |
| [**certificate**](https://en.wikipedia.org/wiki/X.509#Certificates) | A file that contains a public key and identity information, e.g., an organization name, hostnames, IP addresses, etc. The X.509 standard defines a standard format for certificate files that can either be self-signed or signed by a certificate authority. Certificates are used in conjunction with public-key infrastructure to provide identity validation and encryption keys used to secure IP transport protocol communications, such as with the TLS protocol. <br/> Also called _X.509 Certificate_. |
| **command channel** | STTP functionality, usually implemented using a reliable communications protocol, that is used to exchange command messages in a publisher/subscriber connection. |
| **data channel** | STTP functionality, implemented using either a reliable or lossy communications protocol, that is used to send data messages in a publisher/subscriber connection. |
| [**data point**](https://en.wikipedia.org/wiki/Data_point) | A measurement of identified data along with any associated state, e.g., time of measurement and quality of measured data. |
| [**data structure**](https://en.wikipedia.org/wiki/Data_structure) | An organized set of primitive data types where each element has a meaningful name. |
| **frame** | A data-structure composed of primitive data types that has been serialized into a discrete binary package. |
| [**endianess**](https://en.wikipedia.org/wiki/Endianness) | The hardware prescribed ordinal direction of the bits used to represent a numerical value in computer memory; usually noted as either _big-endian_ or _little-endian_. |
| [**endpoint**](https://en.wikipedia.org/wiki/Communication_endpoint) | A combination of an IP address (or hostname) and port number that represents a unique identification for establishing communications on an IP network. Endpoints, along with an IP transport protocol, are used by a socket to establish inter-device network communications. <br/> Also called _network endpoint_. |
| [**Ethernet**](https://en.wikipedia.org/wiki/Ethernet) | Frame based data transmission technology used in local area networks. |
| [**encryption key**](https://en.wikipedia.org/wiki/Key_%28cryptography%29) | A set of numbers that are used by an encryption algorithm to transform data into form that cannot be easily interpreted without knowing the key.  |
| [**firewall**](https://en.wikipedia.org/wiki/Firewall_%28computing%29) | A security system used on a computer network, existing as software on an operating system or a standalone hardware appliance, used to control the ingress and egress of network communication paths , i.e., access to endpoints, based on a configured set of rules. Security zones between networks are established using firewalls to limit accessible resources between _secure_ internal networks and _untrusted_ external networks, like the Internet. |
| [**fragmentation**](https://en.wikipedia.org/wiki/IP_fragmentation) | A process in computer networking that breaks frames into smaller fragments, called packets, that can pass over a network according to an MTU size limit. Fragments are reassembled by the receiver. <br/> Also called _network fragmentation_ |
| [**gateway**](https://en.wikipedia.org/wiki/Gateway_%28telecommunications%29) | A network system used to handle multi-protocol data exchange on the edge of a network boundary. For this specification, an edge system that uses STTP to bidirectionally exchange data with another system that uses STTP. |
| [**hostname**](https://en.wikipedia.org/wiki/Hostname) | A human readable label used in a computer network that maps to an IP address. A hostname can be used instead of an IP address to establish a socket connection for inter-device network communications. Resolution of a hostname to its IP address is handled by a DNS service which is defined as part of a system's IP configuration. |
| [**initialization vector**](https://en.wikipedia.org/wiki/Initialization_vector) | A set of random numbers used to initialize an encryption algorithm to reduce recognizable patterns in encrypted data. |
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
| [**switch**](https://en.wikipedia.org/wiki/Network_switch) | A network system, usually existing as a physical hardware, that routes network packets directly to the intended targets. <br/> Also called _network switch_. |
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
| **IRIG** | [Inter-range Instrumentation Group Time Codes](https://en.wikipedia.org/wiki/IRIG_timecode) |
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
```C
    void DisplayHelloWorld() {
        printf("Hello World!");
    }
```

Code is also shown `inline` as well.

### Presentation Language

This specification deals with the serialization and representation of data in external contexts. To help describe the format of the data a high-level programming syntax will be used. These formats are intended to represent data as it would be structured for transmission, i.e., on the wire format, and not necessarily that of how the data would be stored in memory. The syntax used resembles the "C" programming language, however its purpose is to be illustrative and not language accurate.

#### Comments

Code comments in this specification begin with `//` and continue to the end of the line. Optionally comments can be represented as beginning with `/*` and ending with `*/`.

#### Array Types

Any types of data that exist in a series are represented with brackets, i.e., `data[]`, and called arrays. Arrays are defined as a pointer to a block of memory representing the series of data types. Since the array is a pointer, it will be assumed to be pointing to nothing when its value is `null`. An array declared with empty brackets indicates an array of variable size. An array that represents a specific number of elements will be declared with an integer count within the brackets, e.g., `data[2]`. An array with zero elements is considered an empty array.

#### Numeric Types

Representation of all data types is explicitly specified. The most fundamental unit of data is one byte, i.e., 8-bits. The basic numeric data type is an unsigned byte, called a `uint8`, which represents integers between 0 and 255. All larger numeric data types are multi-byte values encoded as a contiguous sequence of bytes. The following numeric types are predefined:

```C
  uint8[2] int16;  // Represents integers between -32768 and 32767
  uint8[3] int24;  // Represents integers between -8,388,608 and 8,388,607
  uint8[4] int32;  // Represents integers between -2,147,483,648 and 2,147,483,647
  uint8[8] int64;  // Represents integers between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807
  uint8[2] uint16; // Represents integers between 0 and 65,535
  uint8[3] uint24; // Represents integers between 0 and 16,777,215
  uint8[4] uint32; // Represents integers between 0 and 4,294,967,295
  uint8[8] uint64; // Represents integers between 0 and 18,446,744,073,709,551,615
  uint8[16] guid;  // Represents a 128-bit globally unique identifier
```

#### Enumerated Types

To represent an enumerated set of possible values, a numeric type is defined called an `enum`. Normally an enumerated type only represents its defined values, however, when the enumerated type values represent bit values, or flags, the enumerated type can represent any number of its possible values at once. Every element of an enumerated type must be assigned a value, as a result values can be defined in any order. Importantly, an enumerated type will only occupy space needed for its maximum defined value when serialized. For example, the following enumerated type would only require one byte:

```C
  enum {
    Red = 0,
    Green = 1,
    Blue = 2
  }
  Color;
```

Unless otherwise specified, all enumerated types are considered unsigned.

#### Standard Endianness

When multi-byte data items are encoded as a sequence of contiguous bytes, they are shown from left to right when described horizontally or from top to bottom when described vertically. Unless otherwise specified, byte-ordering for encoded multi-byte values will always be in big-endian order, i.e., common network byte order.

When extracted from a stream of bytes on a system whose native byte-ordering is little-endian, a multi-byte item, e.g., a 32-bit integer value, could be decoded as follows:

```C
  uint32 value = buffer[0] << 24 | buffer[1] << 16 | buffer[2] << 8 | buffer[3];
```

#### Common Structures

The following common code structures are predefined for use within other STTP protocol structures.

##### Version Structure

Represents a versioned entity, e.g., a protocol version, consisting of a byte for the major and minor components of the version:

```C
struct {
  uint8 major;
  uint8 minor;
}
Version;
```
- The `major` field defines the major component of the represented version.
- The `minor` field defines the minor component of the represented version.

##### NamedVersion Structure

Represents a named entity and associated version, e.g., a compression algorithm, consisting of a [`Version`](#version-structure) and an ASCII encoded string name.

```C
struct {
  uint8[20] name;
  Version version;
}
NamedVersion;
```
- The `name` field defines an ASCII encoded string name for this structure. Field name should be padded with spaces to the right and any serializations should not include a null terminator, i.e., a zero value character.
- The `version` field defines a [`Version`](#version-structure) number for this structure.

> :information_source: Small fixed string size for `name` field expected to be sufficient for foreseeable use cases, e.g., specification of compression algorithm.

##### NamedVersions Structure

Represents a collection of [`NamedVersion`](#namedversion-structure) entities which includes a count of the total elements.

```C
struct {
  uint16 count;
  NamedVersion[] items;
}
NamedVersions;
```
- The `count` field defines the total number of elements in the `items` array.
- The `items` field is an array of [`NamedVersion`](#namedversion-structure) structures.

#### Common Functions

The following common functions are predefined for use within other STTP functions.

##### 15-bit Encoding Functions

The following functions take an unsigned 16-bit integer and apply a 15-bit encoding scheme that will serialize the provided 16-bit unsigned integer as either 1 or 2 bytes, depending on its value:

```C
// Values greater than 32767 will return null
uint8[] Encode15Bits(uint16 value) {
  if (value <= 127)
    return { (uint8)value };
  else if (value <= 32767)
    return { (uint8)((value & 127) + 128), (uint8)(value >> 7) };

  return null;
}

uint16 Decode15Bits(uint8[] data) {
  if (data[0] <= 127)
    return data[0];

  return (uint16)(data[0] - 128) | (uint16)(data[1] << 7);
}
```
