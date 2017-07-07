## Data Point Structure

> :construction: Lead with paragraph on purpose / value of the section - (1) what is a data point structure and (2) why have a data point structure / value? Next paragraph would be contents of section...

... this section includes:

* Identification - maps to 128-bit Guid, transport mapping should be small
* Timestamp (required? could simply be a auto-incrementing counter)
* Value - multiple native types supports
* Flags - standardize minimal set of simple flags, complex state can be new data point

> :tomato::question: SEC: Rather than require all data to be mapped into a predefined Data Point, the lowest level of the protocol that defines how data is serialized should be a free-form data block that is defined at runtime. Instead, the Data Point Structure should be more like:
> * C37.118 Data Point Structure
> * DNP Data Point Structure
> * ICCP Data Point Structure
> * IEC 61850-90-5 Data Point Structure
> * Generic Time-Series Data Point Structure (Original Data Point Structure listed above)
>
> At some level, all measurements can be mapped to Generic Time-Series Data Point Structure, but they shouldn't be required to be from the get-go. This would allow the creation of a front-end data transport that could move any kind of time series data in its raw format and the consumer of the data can decide how to translate the data. This also means that these raw protocols could be encapsulated and transported over encrypted channels without requiring a stateful metadata repository to map all measurements to a GUID.

> :thumbsup: JRC: I think this could be supported in an automated process (and perhaps starting with code) found in serialization technologies like Google Protocol Buffers.

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
