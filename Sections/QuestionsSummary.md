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
