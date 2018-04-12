## Wire Protocol Encoding

At the lowest level of STTP, only two types of commands can be sent. These include SttpMarkup commands and Raw commands. These commands will optionally be compressed and fragmented when encoded on the wire. This section describes the byte sequencing of commands. These bytes must be sequenced one after the other and may be reordered or combined if desired however the decoder must know how to handle reordered/combined data. So some intelligence must be applied to reordering. They can also be encapsulated using U-TLS.

Each packet can be up to 4096 bytes per fragment (including overhead). And there can be up to 65536 fragments. However, constraints at a higher level should be in place so this fundamental limit is never reached. For instance, when serializing GBs of data, the command should itself support fragmentation of some kind to fragment the results into sets of 1MB or less. 

If a packet is compressed, the upper bounds of the uncompressed data is 4GB. Again, in practice, data should be segmented into smaller chunks. 

The Raw Bytes will be sequenced as follows:

* (Int16) Header Flags
  * (Int1) **IsCompressed**: True/False
  * (Int1) **IsFragmented**: True/False 
  * (Int2) CommandTypeEnum
    * **CommandRaw_0**
    * **CommandRaw_1**
    * **CommandRaw_Int32**
    * **CommandMarkup**
  * (Int12) **PacketLength**
* If (**IsFragmented**)
  * (Int32) FragmentID
  * (Int16) **CurrentFragment**
  * (Int16) TotalFragments
* If (NOT **IsFragmented** OR **IsFragmented** AND **CurrentFragment** = 0)
  * If (**IsFragmented**)
    * (Int32) Total Fragment Length (After compression if compressed)
    * (Int32) CRC32 of Fragmented Data (After compression if compressed)
  * If (**IsCompressed**)
    * (Int32) Uncompressed Data Length
    * (Int32) CRC32 of Uncompressed Data
  * If (**CommandMarkup**)
    * (Int8) Length of Command
    * (ASCII) Command Name
  * If (**CommandRaw_Int32**)
    * (Int32) RawCommandCode
* (Byte[]) Payload 
  * Length is **PacketLength** – all header data
  * Payload could be fragmented and/or compressed. If fragmented and compressed, the entire payload is first compressed, and then the compressed data is fragmented.

This mandates a minimum overhead of 2 bytes for Raw Commands whose RawCommandCode is 0 or 1; and a Maximum overhead of 282 bytes for a compressed and fragmented MarkupCommand whose ASCII length is 255 characters.