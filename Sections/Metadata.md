## Metadata

JRC: Following needs some extra thought
~~Metadata information will be described in one of two formats. **Basic Metadata** or **Advance Metadata**. 
Basic Metadata has fewer restrictions and intended for use where a persistent metadata repository 
is not desired and limited programming support exists where XML encoding would be cumbersome. 
(Ex. PMU or intermediate PDCs)~~

~~Advance Metadata contains more formally defined metadata structures necessary to version 
the metadata and provide synchronizing and filtering and permission based access. This
would require access to a repository that would maintain this data. 
(Ex. Large Scale PDCs, Gateways, Historians)~~

~~## Basic Metadata~~

~~* Attributes are Key/Value pairs~~
~~* Supports Nodal Relationships (Site Information -> Device Information -> Point Information)~~
~~* Data requests are full dumps~~
~~* Data can be sent on demand when streaming measurements~~
~~* Contains a Runtime Version Number~~
~~* This number is incremented on any metadata change~~
~~* This number also changes every process restart~~

~~## Advance Metadata~~

~~* Wire Format: Tabular XML format (XML) - highly compressible~~
~~* Primary data point identifier is Guid (describe)~~
~~* Extensibility~~
~~* Rights based content restriction~~

### Dataset Contents

* Minimum required dataset for STTP operation
* Industry specific dataset extensions (outside scope of this doc)

### Dataset Filtering

* Format of expressions that work against metadata
  * SQL style expressions
  * Regex style expressions
* Application of expressions
  * Metadata reduction (by subscriber)
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

