## Data Point Structure

> :construction: Lead with paragraph on purpose / value of the section - (1) what is a data point structure and (2) why have a data point structure / value? Next paragraph would be contents of section...

... this section includes:

* Identification - maps to 128-bit Guid, transport mapping should be small
* Timestamp (required? could simply be a auto-incrementing counter)
* Value - multiple native types supports
* Flags - standardize minimal set of simple flags, complex state can be new data point - should include collation index

> :tomato::question: SEC: Rather than require all data to be mapped into a predefined Data Point, the lowest level of the protocol that defines how data is serialized should be a free-form data block that is defined at runtime. Instead, the Data Point Structure should be more like:
> * C37.118 Data Point Structure
> * DNP Data Point Structure
> * ICCP Data Point Structure
> * IEC 61850-90-5 Data Point Structure
> * Generic Time-Series Data Point Structure (Original Data Point Structure listed above)
>
> At some level, all measurements can be mapped to Generic Time-Series Data Point Structure, but they shouldn't be required to be from the get-go. This would allow the creation of a front-end data transport that could move any kind of time series data in its raw format and the consumer of the data can decide how to translate the data. This also means that these raw protocols could be encapsulated and transported over encrypted channels without requiring a stateful metadata repository to map all measurements to a GUID.

> :thumbsup: JRC: I think this could be supported in an automated process (and perhaps starting with code) found in serialization technologies like Google Protocol Buffers. The openECA style data structure handling has been on my mind as a way to handle "mappings" of other protocols, basically as data structures like you mention. Cannot get away from some sort of Identification of the "instance" of a mapping though - even if the mapping ID defaulted to something simple. At a wire protocol level though, sticking to primitive types helps keep protocol parsing very simple - and- there are just too many other technologies that already exist to serialize data structures- STTP should not be trying to re-solve that problem. A consumer of STTP should be able to parse any packet of data even when what the data represented was unknown.

### Data Point Value Types

* `Null`: No space occupied
* `SByte`: [8-bit Signed Byte](https://en.wikipedia.org/wiki/Byte) (big-endian)
* `Int16`: [16-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `Int32`: [32-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `Int64`: [64-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `Byte`: [8-bit Unsigned Byte](https://en.wikipedia.org/wiki/Byte) (big-endian)
* `UInt16`: [16-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `UInt32`: [32-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `UInt64`: [64-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (big-endian)
* `Decimal`: [128-bit Decimal Floating Point](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) (per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* `Double`: [64-bit Double Precision Floating Point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) (per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* `Single`: [32-bit Single Precision Floating Point](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) (per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* DateTime (need some thought on proper encoding, perhaps options)
* TimeSpan (Tick level resolution, or better, would be ideal)
* Char (2-byte Unicode)
* Bool
* Guid
* String (encoding support for UTF-16, UTF-8, ANSI and ASCII)
* Byte[]

> :tomato::question: KEM: _Is decimal the same as float?_

> :bulb: JRC: _Actually "decimal" is an IEEE standard data type, standard 754-2008 - I added that parenthetically above. It's a floating point number that doesn't suffer from typical floating point rounding issues - often used for currency operations. See here for more detail:_ https://en.wikipedia.org/wiki/Decimal_data_type

> :construction: Need to determine safe maximum upper limit of per-packet strings and byte[] data, especially since implementation could simply _span_ multiple data points to collate a larger string or buffer back together.

> :tomato::question: JRC: _Should API automatically handle collation of larger data types, e.g., strings and buffers?_
