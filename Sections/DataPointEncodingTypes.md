## Data Point Encoding Types

STTP supports various options for encoding data points within data packet commands. Different levels of encoding functionality allows data to be sent more efficiently and consume less space.

> :information_source: An STTP publisher implementation is in control of which types of encodings it supports. Encoding is a different activity than compression; compression algorithms often require a specific type of base encoding.

### Basic Encoding

Structure definitions that represent the basic format of data points as serialized on the wire are as described in the [Data Point Structure](DataPointStructure.md) section. Basic encoding serializes data elements in their native format without any attempt to reduce the size of the data, except to only include necessary state information. All implementations of STTP must be able to support basic encoding.

The size of the `DataPoint.value` with basic encoding depends on its type as defined in the `DataPointKey.type`. The size and content of the `DataPoint.state` is determined by the `DataPointKey.flags`, see the [runtime ID mapping command](Commands.md#runtime-id-mapping-command), these flags control the information that is included in the encoded state.

#### Optional States

* **Timestamp** - the timestamp value is only included in the `DataPoint.state` data when the `DataPointKey.flags` includes the `StateFlags.Timestamp` flag. When included, the `Timestamp` structure must be the first value serialized into the `DataPoint.state` data.
* **Time Quality Flags** - the time quality flags are only included in the `DataPoint.state` data when the `DataPointKey.flags` includes the `StateFlags.TimeQuality` flag. The `TimeQualityFlags` must be serialized into the `DataPoint.state` data in big-endian order following any defined timestamp. If no timestamp is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` defines `Timestamp` as `0`, then the `TimeQualityFlags` should not be serialized into the `DataPoint.state` data.
* **Data Quality Flags** - the data quality flags are only included in the `DataPoint.state` data when the `DataPointKey.flags` includes the `StateFlags.DataQuality` flag. The `DataQualityFlags` must be serialized into the `DataPoint.s` data in big-endian order following any defined time quality flags. n If no time quality flags are defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` defines `Timestamp` as `0`, then the `DataQualityFlags` must be the first value serialized into the `DataPoint.state` data.
* **Sequence Identifier** - the sequence identifier, which is defined as a `uint32`, must be serialized into the `DataPoint.state` data in big-endian order following any defined `DataQualityFlags`, `TimeQualityFlags` or timestamp. If no timestamp is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` defines `Timestamp` as `0` and no `DataQualityFlags` is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` does not include the `StateFlags.DataQuality` flag, then the sequence identifier must be the first value serialized into the `DataPoint.state` data.
* **Fragment Number** - the fragment number, which is defined as a `uint32`, must be serialized into the `DataPoint.state` data in big-endian order following any defined sequence identifier, `DataQualityFlags`, `TimeQualityFlags` or timestamp. If no timestamp is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` defines `Timestamp` as `0` and no `DataQualityFlags` is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` does not include the `StateFlags.DataQuality` flag, and no sequence identifier is defined for the `DataPoint.state` data, i.e., the `DataPointKey.flags` does not include the `StateFlags.Sequence` flag, then the fragment number must be the first value serialized into the `DataPoint.state` data.

### Compact Encoding

> :construction: This mode was enabled in GEP to accommodate a smaller payload size. Specifically timestamps were transmitted as an offset to a base time that maintained two states. Also, GEP focused on 4-byte single-precision floating point numbers only. This along with some compact flags for quality and a 16-bit runtime ID got per data point size to around 9-bytes. It is expected that this mode of operation could still have value when data packets are sent over UDP, however, TCP transmissions would be best served using TSSC because of the gains that can be had with that algorithm.

### Fixed Size Encoding

In order to accommodate advanced compression algorithms, e.g., [TSSC compression](TSSCAlgorithm.md), an alternate data point encoding is used where values are serialized using the `FixedSizeDataPoint` structure, defined below. The `FixedSizeDataPoint` structure aligns data on a word boundary and has a fixed size, so no fields are considered optional. Instead when the `StateFlags` call for an excluded field, the `FixedSizeDataPoint` structure will simply zero out the values for the field which allows the repeating values to be _compressed out_ of the final result.

```C
struct {
  uint32 id;
  uint64[8] value;  // Bytes of the value
  uint64 time1;     // Lower 8 bytes of the time, used for Timestsmp.seconds
  uint64 time2;     // Upper 8 bytes of the time, used for Timestamp.fraction
  TimeQualityFlags timeQualityFlags;
  DataQualityFlags dataQualityflags;
  uint32 sequence;
  uint32 fragment;
  uint8 length;
}
FixedSizeDataPoint;
```
