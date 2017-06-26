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

> :tomato::question: Should API automatically handle collation of larger data types, e.g., strings and buffers?
