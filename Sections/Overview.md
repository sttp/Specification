### Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

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

> :construction: Introduce the each of topical sections that follow.  _Candidate major topic headings:_  (3# items) Command channel, data channel, compression, security, filter expressions, metadata, ....

### Design Philosophies

* Minimize external libraries and dependencies for reference implementations
* Keep portability in mind with all protocol design work
* Target smallest possible API functionality –specialized use cases will be handled by example
* Set design mantra to be “keep it simple” _as possible_

### Metadata

* Tabular XML format (XML) - highly compressible
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
