## Questions Summary

Notes and questions will be removed from the documentation at key publication points. This file exists to keep track of the original questions and responses as they occurred in the documentation.

#### From Overview.md - Large Frame Network Impact:

> :tomato::question: KEM: _Can you have a collision on a full duplex system? If so, it sounds like buffering is improperly implemented._

> :bulb: JRC: _A full duplex system prevents network media collisions between incoming and outgoing traffic. It does not prevent UDP data loss from buffer overruns in the OS network stack nor does it prevent collisions from simultaneous traffic._

#### From Overview.md - Data Transport Channels:

> :tomato::question: JRC: _The question has been raised if a UDP only transport should be allowed? In this mode, any critical commands and responses would basically be sent over UDP. Thought would need to be given to commands and/or responses that never arrive and the consequences thereof._

> :tomato::question: SEC: _We may also consider a UDP method that is not bi-directional. Much like how C37.118 currently supports such a data stream. This could be encrypted by storing the client's public key on the server and encrypting the cipher key periodically. It could be used when transporting from secure environment to an unsecure one. Anytime TCP is used, the potential of buffering and creating a DOS attack on the more secure system is possible. And UDP replies through a firewall are really easy to spoof._

> :confused: JRC: _Presume that this would require an out-of-band pre-defined configuration to be "known" or handle it the way C37.118 currently manages this, i.e., sending a "config frame" once per minute. In context of STTP, this might be a reduced set of metadata that represented "what" was being published. This would need some "rules" to operate properly._

> :bulb: KEM: _The advantage in this case is that UDP will operate unidirectionally, TCP won't. However for commands you really need to close the loop. I suggest that STTP only be developed for TCP as suggested above, but do not state that it cannot be adapted to UDP._

#### From Commands.md - Commands:

> :tomato::question: SEC: _I don't think commands should be so rigidly defined, this prohibits a user from extending the protocol for their specific purpose. These should be GUIDs, or variable length strings. When the protocol enters the negotiate stage, it should negotiate every command that is supported and assign a runtime ID associated with that command. I would prefer variable length strings and require users to prefix their custom defined commands with something. Ex: STTP.NegotiateSession, USER.Special-Command_

> :information_source: JRC: _I suppose the short answer is for simplicity in order to keep the scope of protocol limited. Strings could be used to identify commands as you suggest which might make the wire protocol more human readable, but this seems to have limited value. The benefit of allowing unlimited user commands in the protocol raises many questions in my opinion, any at all opens the possibility of introducing security issues for implementations of the protocol, a separate discussion all together. Perhaps the fundamental question is if allowing the flexibility for STTP implementations to create their own set of low level commands simply for the purposes of RPC is a worthwhile endeavor within the defined scope of the protocol. So if the protocol is designed to exchange time-series data and meta-data then what is the minimum set of commands need to accomplish this task? The original HTTP specification defined three commands GET, POST and HEAD - later versions added a few more, but the others are rarely used. HTTP accomplishes much more than its original design intentions with these three simple commands. The limited set of commands keeps the basic protocol functionality very simple, but does not limit its overall functionality. Most of the "functionality" provided through HTTP happens at a layer that exists above the wire protocol layer. I think the same can be true with STTP, i.e., functionality can be extended at an application and API layer above the wire protocol, even within the constraints of the defined commands._

#### From Commands.md - Protocol Version Negotiation:

> :tomato::question: SEC: _It would be better to version each command, rather than the protocol as a whole. That would allow partial implementations of the protocol to be supported rather than the entire protocol._

> :information_source: JRC: _Keeping the command set small helps with this task too - partial implementation of "features" can also occur at application / API layer_

#### From DataPointStructure.md - Data Point Structure


> :tomato::question: SEC: Rather than require all data to be mapped into a predefined Data Point, the lowest level of the protocol that defines how data is serialized should be a free-form data block that is defined at runtime. Instead, the Data Point Structure should be more like:
> * C37.118 Data Point Structure
> * DNP Data Point Structure
> * ICCP Data Point Structure
> * IEC 61850-90-5 Data Point Structure
> * Generic Time-Series Data Point Structure (Original Data Point Structure listed above)
>
> At some level, all measurements can be mapped to Generic Time-Series Data Point Structure, but they shouldn't be required to be from the get-go. This would allow the creation of a front-end data transport that could move any kind of time series data in its raw format and the consumer of the data can decide how to translate the data. This also means that these raw protocols could be encapsulated and transported over encrypted channels without requiring a stateful metadata repository to map all measurements to a GUID.

> :thumbsup: JRC: I think this could be supported in an automated process (and perhaps starting with code) found in serialization technologies like Google Protocol Buffers. The openECA style data structure handling has been on my mind as a way to handle "mappings" of other protocols, basically as data structures like you mention. Cannot get away from some sort of Identification of the "instance" of a mapping though - even if the mapping ID defaulted to something simple. At a wire protocol level though, sticking to primitive types helps keep protocol parsing very simple - and- there are just too many other technologies that already exist to serialize data structures- STTP should not be trying to re-solve that problem. A consumer of STTP should be able to parse any packet of data even when what the data represented was unknown.

#### From DataPointStructure.md - Data Point Value Types

> :tomato::question: KEM: _Is decimal the same as float?_

> :bulb: JRC: _Actually "decimal" is an IEEE standard data type, standard 754-2008 - I added that parenthetically above. It's a floating point number that doesn't suffer from typical floating point rounding issues - often used for currency operations. See here for more detail:_ https://en.wikipedia.org/wiki/Decimal_data_type

> :construction: Need to determine safe maximum upper limit of per-packet strings and byte[] data, especially since implementation could simply _span_ multiple data points to collate a larger string or buffer back together.

> :tomato::question: JRC: _Should API automatically handle collation of larger data types, e.g., strings and buffers?_
