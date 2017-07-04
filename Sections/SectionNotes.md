## Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

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
