### Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

> Describe what protocol is and is not - how it could operate with ZeroMQ, DDS, etc. as a transport layer - how it is different than thrift, protobuf, etc., i.e., atomized approach to native-type data vs serializing and deserializing data structures - why this has benefit at scale (i.e., very large structures)

Data transport requires the use of a command channel using TCP/IP for reliable delivery of important commands. Optionally a secondary data channel can be established using UDP/IP for the transport of data that can tolerate loss. When no secondary UDP/IP is used, both commands and data will share use of the TCP/IP channel for communications.

> :tomato::question: JRC: _The question has been raised if a UDP only transport should be allowed? In this mode, any critical commands and responses would basically be sent over UDP. Thought would need to be given to commands and/or responses that never arrive and the consequences thereof._

_more_

> :information_source: Although not precluded from use over other data transports, the design of this protocol is targeted and optimized for use over [Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol), specifically TCP/IP and UDP/IP. Even so, since the command/response implementation and data packet distribution of the STTP protocol is fairly simple, it is expected that commonly available middleware data transport layers, such as [ZeroMQ](http://zeromq.org/) or [Data Distribution Service](http://www.omg.org/spec/DDS/) (DDS), could easily support and transmit data using the STTP protocol should any of the messaging distribution and management benefits of these transport layers be useful to a particular deployment environment. However, these types of deployments are outside the scope of this documentation. If needed, STTP integrations with middleware layers should be added as reference implementation repositories to the [STTP organizational site](https://github.com/sttp/).


#### Protocol Feature Summary

> :construction: This is the protocol promotional section that includes a bulleted list of the "value points" for the protocol

* Perform at high volume / large scale
* Minimize data losses (e.g., over UDP)
* Lower bandwidth requirements (e.g., over TCP)
* Optimized for the performant delivery of individual data-points
* Automated exchange of metadata (no centralized registry required)
* Detect and expose communication issues
* Security and availability features that enable use on critical systems to support critical operations
* Publish/subscribe at data-point level
* API implemented in multiple languages on multiple platforms

> :construction: Introduce the each of topical sections that follow.  _Candidate major topic headings:_  (3# items) Command channel, data channel, compression, security, filter expressions, metadata,

> 06/22/2017 JRC brain dump follows - note these will need to become formal sections once the headings are better established:

### Design Philosophies

* Minimize external libraries and dependencies for reference implementations
* Keep portability in mind with all protocol design work
* Target smallest possible API functionality –specialized use cases will be handled by example
* Set design mantra to be “keep it simple” _as possible_

### Data-point Structure

* Contents:
  * Identification - maps to 128-bit Guid, transport mapping should be small
  * Timestamp (required? could simply be a auto-incrementing counter)
  * Value - multiple native types supports
  * Flags - standardize minimal set of simple flags, complex state can be new data-point

### Commands and Responses

#### Commands

All commands must be sent over the command channel.

| Code | Command | Source | Description |
|:----:|---------|:------:|-------------|
| 0x00 | Set Operational Modes | Subscriber | Defines desired set of operational modes. |
| 0x01 | Metadata Refresh | Subscriber | Requests publisher send updated metadata. |
| 0x02 | Subscribe | Subscriber | Defines desired set of data-points to begin receiving. |
| 0x03 | Unsubscribe | Subscriber | Requests publisher terminate current subscription. |
| 0x0n | etc. | | | |
| 0xFF | NoOp | Any | Periodic message to allow validation of connectivity. |

##### Set Operational modes

This must be the first command sent after a successful connection - the command must be sent before any other commands or responses are exchanged so that the "ground-rules" for the communications session can be established. The rule for this operational mode negotiation is that once these modes have been established, they will not change for the lifetime of the connection.

The subscriber must send the command and the publisher must await its reception. If the publisher does not receive the command in a timely fashion (time interval controlled by configuration), it will disconnect the channel.

* Wire Format: Binary
* Requested operational mode negotiations
  * String encoding
  * Compression modes
  * UDP data channel usage / port

##### Metadata Refresh

* Wire Format: Binary
  * Includes current metadata version number

##### Subscribe

* Wire Format: Binary
  * Includes metadata expression and/or individual Guids for desired data-points

##### Unsubscribe

  * Wire Format: Binary

##### NoOp

No operation keep-alive ping. It is possible for the command channel to remain quiet for some time if most data is being transmitted over the data channel, this command allows a periodic test of client connectivity.

* Wire Format: Binary

#### Responses

Responses are sent over a designated channel based on the nature of the response.

| Code | Response | Source | Channel | Description |
|:----:|----------|:------:|:-------:|-------------|
| 0x80 | Succeeded | Publisher | Command | Command request succeeded. Response details follow. |
| 0x81 | Failed | Publisher | Command | Command request failed. Response error details follow. |
| 0x82 | Data-point Packet | Any | Data | Response contains data-points. |
| 0x83 | Signal Mapping | Any | Command | Response contains data-point Guid to run-time ID mappings. |
| 0x8n | etc. | | | | |

> :information_source: For the response table above, when a response is destined for the data channel, it should be understood that a connection can be established where both the command and data channel use the same TCP connection.
>
##### Succeeded Response

* Wire Format: Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Can include response that is specific to source command:

###### Succeeded Response for Metadata Refresh

* Wire Format: String + Binary
  * Includes response message with stats like size, number of tables etc.
  * Includes temporal data-point ID for "chunked" metadata responses
  * Includes number of metadata data-points to be expected

###### Succeeded Response for Subscribe

Subscriber will need to wait for

* Wire Format: String + Binary
  * Includes response message with stats like number of actual points subscribed,  
    count may not match requested points due to rights or points may no longer exist, etc.
  * Includes temporal data-point ID for "chunked" signal mapping responses
  * Includes number of signal mapping data-points to be expected

###### Succeeded Response for Unsubscribe

* Wire Format: String
  * Includes message as to successful unsubscribe with stats like connection time

##### Failed Response

* Wire Format: String + Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Includes error message as why command request failed
  * Can include response that is specific to source command:

###### Failed Response for Set Operational Modes

Failed responses to operational modes usually indicate lack of support by publisher. Failure response should include, per failed operational mode option, what options the publisher supports so that the operational modes can be re-negotiated by resending operational modes with a set of _supported_ options.

  * Wire Format: Binary
    * Includes operational mode that failed followed by available operational mode options

##### Data-point Packet

* Wire Format: Binary
  * Includes a byte flag indicating content, e.g.:
    * Data compression mode, if any
    * Total data-points in packet
  * Includes serialized data-points

##### Signal Mapping

* Wire Format: Binary
  * Includes a mapping of data-point Guids to run-time signal IDs
  * Includes per data-point ownership state, rights and delivery characteristic details

### Data-point Delivery Characteristics

* Priority (e.g., control over data delivery priority)
* Reliability (e.g., must be sent over TCP channel)
* Verification (e.g., notification of successful transport)
* Exception (e.g., delivery on change)
* Resolution (e.g., down-sampling)

### Metadata

*  Wire Format: Tabular XML format (XML) - highly compressible
* Primary data-point identifier is Guid (define)
* Extensibility
* Rights based content restriction

#### Dataset Contents

* Minimum required dataset for STTP operation
* Industry specific dataset extensions (outside scope of this doc)

#### Dataset Filtering

* Format of expressions that work against metadata
  * SQL style expressions
  * Regex style expressions
* Application of expressions
  * Metadata reduction
  * Data-point access security

#### Dataset Versioning

* Versioned
* Difference based publication

#### Dataset Serialization

* Serialization for transport
  * Packet based publication using temporal data-point
  * Publisher reduction by access rights and diff-version
  * Subscriber reduction by filter expression
* Serialization to local repository
  * Merging considerations
  * Conflict resolution
  * Ownership control

### Compression

* Types of compression
  * Stateful data compression (TCP)
  * Per-packet data compression (UDP)
  * Metadata compression (GZip)
* Compression algorithm extensibility
  * Negotiating desired compression algorithm

### Security

* Access control list (ACL) security is always on

#### Encrypted Communications

* Transport layer security (TLS) over TCP command channel
* UDP data channel traffic secured via AES keys exchanged over TCL command channel

#### Strong Identity Validation

* X.509 certificates
* Self-signed certificates

#### Publisher Initiated Security Considerations

How does publisher initiated connection, to cross security zones in desired direction, affect identity validation and TLS?

#### Access Control Lists

* Allow/deny for specific points (data-point explicit)
* Allow/deny for group with specific points (group explicit)
* Allow/deny for filter expression (filter implicit)
* Allow/deny for group with filter expression (group implicit)

##### Expression based Access Control

* Expressions can be used to define filters and groups
* How do filters work against extensible metadata, missing columns?

##### Access Control Precedence

* (1) Data Point Explicit
* (2) Group Explicit
* (3) Filter Implicit
* (4) Group Implicit
