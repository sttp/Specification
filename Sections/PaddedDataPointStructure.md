## Padded Data Point Structure

In order to accommodate advanced compression algorithms, e.g., [TSSC compression](TSSCAlgorithm.md), an alternate data point encoding is used where values are serialized using the `PaddedDataPoint` structure, defined below. The `PaddedDataPoint` structure aligns data on a word boundary and has a fixed size, so no fields are considered optional. Instead when the `StateFlags` call for an excluded field, the `PaddedDataPoint` structure will simply zero out the values for the field which allows the repeating values to be _compressed out_ of the final result.

```C
struct {
  uint32 id;
  uint64 value1;  // Lower 8 bytes of the value
  uint64 value2;  // Upper 8 bytes of the value - for types larger than 8 bytes
  uint64 time1;   // Lower 8 bytes of the time, used by all time structures
  uint64 time2;   // Upper 8 bytes of the time, used by NTP128.fraction
  TimestampFlags timestampFlags;
  QualityFlags qualityflags;
  uint16 sequence;
}
PaddedDataPoint;
```
