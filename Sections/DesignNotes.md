## Design Notes

_These design notes have not been added to the main-line document yet, right now this document exists to make sure any design ideas that we are thinking about get captured so that documentation sections can address the design details._

- The protocol should be defined in such a way that the entire protocol does not have to be fully implemented. To encourage widespread adoption of STTP, certain functions such as Publish/Subscribe, Data Backfilling, Metadata Exchange, Metadata Synchronization, Historical Query Response, Protocol Encapsulation, Access Control, etc. should be broken out into separate optional specifications. These options will then be grouped into levels of compliance with the STTP protocol. In other words, you cannot claim to be a "STTP Data Concentrator" if you cannot do A, B, and C. Or you cannot claim to be a "STTP Gateway" if you cannot do X, Y, and Z. But an end/user application can get data from a Gateway if they support D and F.
