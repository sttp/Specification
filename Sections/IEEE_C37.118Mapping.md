## Appendix C - IEEE C37.118

### Encapsulation

A C37.118 stream can be encapsulated in its raw format inside sttp using the following
definitions. The intent of this definition is to make sttp transparent so a sttp service can 
transport insecure C37.118 over an untrusted medium.

C37.118 -> sttp -> C37.118

**Use Case:** A light weight front-end processor manages connectivity to all or a subset of PMU/PDCs 
communicating via C37.118. Existing server applications can through a single connection, connect to this
front-end processor to receive all of the raw data. This application then uses its own mapping to interpret the
raw data. Since each vendor has their own proprietary mapping, it's naive to think we can create one mapping
that everyone will adopt. In addition, a neighboring utility can also run a lightweight service 
that can connect to this front-end processor and translate it back into a C37.118 stream without
having to maintain another local database of how to map it back into a C37.118 stream.

> :tomato::question: JRC: I was thinking the following kind of mapping would be available in a extended
> metadata table, e.g., `IEEEC37.118` table with an ID or name for the mapping,
> the field types and measurement mappings.

> :bulb: SEC: I would think it would not be adventageous to make a dedicated hard coded table that 
> will maintain this mapping information. It would make extensibility more difficult. 

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

> :confused: JRC: Note sure I understand the following - this seems to break the tenant of
> mapping primitives? Even if broken into chunks, this would require identification and
> sequencing of chunks? Perhaps I am missing your idea here...

> :bulb: SEC: I see. I'm not trying to "map" premitives. I've created a new section in the
> document for mapping into the generic Data Point type. This is simply what I understand is necessary
> to transport the data in it's raw format. 
> 
> I'm focusing on what the transport layer looks like. How the higher level API decides 
> to use this data has yet to be defined and can vary from application to application. 
> We may not decide support encapsulation, but either way, the wireline protocol should not care
> how the API decides to use it.

Data Point
 * (MetaData) All of the metadata that was exchanged with this point, mapped to a Runtime ID.
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


### Mapping

To be described later once a generic Data Point has been described. 
