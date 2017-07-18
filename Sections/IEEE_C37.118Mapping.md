## Appendix C - IEEE C37.118 Mapping

A C37.118 stream can be encapsulated in it's raw format inside sttp using the following
mapping and data point definition. The intent of this mapping is to make sttp transparent.

C37.118 -> sttp -> C37.118

JRC: I was thinking the following kind of mapping would be available in a extended metadata table, e.g., `IEEEC37.118` table with an ID or name for the mapping, the field types and measurement mappings.

Metadata for each Data Point:
 * (int16) Data Concentrator ID Code
 * (int16) ID Code of data source
 * (int32) Time Base
 * (char) Value Type (S=Stat, P=Phasor, F=Freq, Q=DFreq, A=Analog, D=Digital)
 * (int8) Size (2/4)
 * (char) Phasor Type (R=Rect, P=Polar)
 * (int16) Position Index (eg. whether this is the first or second phasor or analog)
 * (int16) PMU Number (eg. whether this is the first of second PMU in a concentrated stream)
 * (char16) Station Name
 * (char16[16]) Channel Name (Array of 16 if channel type is Digital)
 * (int16) Nominal Line Frequency
 * (int16) Rate of data transmission
 * (int16) Config Change Count

> :confused: JRC: Note sure I understand the following - this seems to break the tenant of mapping primitives? Even if broken into chunks, this would require identification and sequencing of chunks? Perhaps I am missing your idea here...

Data Point
 * (uint32) SOC
 * (uint24) FrameSec
 * (uint8) Time Quality
 * One of the following:
   * Status, Digital, Int16 Freq, Int16 DFreq, Int16 Analog
     * (int16) Value
   * Float Freq, Float DFreq, Float Analog
     * (float) Value
   * Int16 Phasor (Rect or Polar)
     * (int16) Value1 (Mag/Real)
     * (int16) Value2 (Ang/Im)
   * Float Phasor (Rect or Polar)
     * (float) Value1 (Mag/Real)
     * (float) Value2 (Ang/Im)
