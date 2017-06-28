## Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

In typical messaging exchange paradigms, blocks of structured data need to be exchanged between one or more applications where the applications can be running on different physical hardware or on the same machine. The structured data to be exchanged is most often composed of simpler primitive data types <sup>[[6](References.md#user-content-ref6)]</sup>. Since the applications exchanging the data can be running on disparate operating systems, the details of the serialization of the data structures <sup>[[7](References.md#user-content-ref7)]</sup> can be complex and diverse. Such issues can include proper handling of the endianess of the primitive data types which may differ from the system that is deserializing the data and differences in the interpretation of how character data is encoded <sup>[[8](References.md#user-content-ref8)]</sup>.

Existing solutions to the problem of serializing data structures in computer science field are very mature. There are various existing technologies that exist to help mitigate most issues with data structure serialization, such as Google Protocol Buffers <sup>[[9](References.md#user-content-ref9)]</sup> and Apache Thrift <sup>[[10](References.md#user-content-ref10)]</sup>. These commonly used frameworks create compact cross-platform serializations of the data structures to be exchanged. For the purposes of this specification these serialized data structures are referred to as _frames_.

> :information_source: In the electric power industry, the IEEE C37.118 <sup>[[1](References.md#user-content-ref1)]</sup> protocol exists as a standard serialization format for the exchange of synchrophasor data which is measured with an accurate time source, e.g., a GPS clock, and transmitted at fast data rates, up to 120 frames per second. Measured data sent by this protocol is still simply a frame of serialized primitive types which includes fields such as a timestamp, status flags, phasor angle / magnitude pairs, etc. The IEEE C37.118 protocol also prescribes the combination of data frames received from multiple source devices for the same timestamp into one large combined frame in a process known as concentration. The concentration process demands that a waiting period be established to make sure all the expected data frames for a given timestamp arrive. If any frames of data do not arrive before the waiting period expires, the overall combined frame is published anyway with _null_ frames occupying space for any missing frames.

For smaller, discrete frames of data, existing serialization and transport technologies are fast and highly effective. However, as the data structures become larger it becomes more costly, in terms of both memory allocation and computational processing, to serialize and deserialize the data structures. Because of this, large frames of data are not recommended for use by these serialization technologies <sup>[[11](References.md#user-content-ref11)]</sup> <sup>[[12](References.md#user-content-ref12)]</sup>. Additionally, and perhaps more importantly, there are also penalties that occur at the network transport layer.

### Large Frame Network Impact

In terms of Internet Protocol (IP), all frames of data to be transmitted that exceed the negotiated maximum transmission unit (MTU) size (typically 1,500 bytes for Ethernet networks <sup>[[13](References.md#user-content-ref13)]</sup>) are divided into multiple fragments where each fragment is called a network packet. As such, larger frames of data produce more network packets.

The impact of large frames on the network is further compounded by the fact that IP is inherently unreliable by design. Network packets can only be transmitted over a connection one packet at a time. When two or more network packets arrive for transmission at any physical network media point at the same time, the result is a collision where only one packet gets sent and the others get dropped <sup>[[14](References.md#user-content-ref14)]</sup>. IP defines a variety of different transport protocols for network packet transmission, each of which behave in different manners when dealing with packet loss.

#### Large Frame Impacts on TCP/IP

The most common Internet protocol, TCP/IP, creates an index for each of the network packets being sent for a frame of data and verifies that each are successfully delivered, retransmitting packets as many times as needed in the case of loss. This functionality is the basis for TCP being considered a _reliable_ data transmission protocol.

Since each packet of data for the transmitted frame is sequentially ordered, TCP is able to fully reconstruct and deliver the original frame once all the packets have arrived. However, for very large frames of data this causes TCP to suffer from the same kinds impacts on memory allocation and computational burden as the aforementioned serialization technologies, i.e., Protocol Buffers and Thrift. The unique distinction for IP based protocols is that the impact of the issues end up affecting every element of the interconnected network infrastructure between the source and sync of the data being exchanged.

Another critical impact that is unique to TCP is that for data that needs to be delivered in a very timely fashion, retransmissions of lost frames can also cause cumulative time delays <sup>[[15](References.md#user-content-ref15)]</sup>, especially as large data frames are published at rapid data rates. Time delays are exacerbated during periods of heightened network activity which induces congestion causing increased collisions.

> :information_source: Synchrophasor data <sup>[[1](References.md#user-content-ref1)]</sup> is the source for real-time visualization and analysis tools which are used to operate the bulk electric system (BES) <sup>[[16](References.md#user-content-ref16)]</sup>. This real-time data is required to be accurate, dependable and timely in order to be useful for grid operators <sup>[[17](References.md#user-content-ref17)]</sup>. Any delays in the delivery of this data could have adverse affects on operational decisions impacting the BES.

#### Large Frame Impacts on UDP/IP

Another very common Internet protocol is UDP/IP. Transmission of data over UDP differs from TCP in the fact that UDP does not attempt to retransmit data nor does make any attempts to verify the order of the transmitted packets. This functionality is the basis for UDP being considered a _lossy_ data transmission protocol, but more lightweight as compared to TCP.

Even with the unreliable delivery caveats, UDP will still attempt to reconstruct and deliver the originally transmitted frame of data. However, even if a single network packet is lost, the entire original frame will be lost with any packets that were already accumulated being discarded <sup>[[18](References.md#user-content-ref18)]</sup>, there are partial frame publications - frame delivery is an all or nothing operation.

> :information_source: As compared to TCP, because UDP does not retransmit dropped network packets it does not suffer from issues with induced time delays and its lightweight nature reduces overall network bandwidth requirements. As a result, UDP is often the protocol of choice when sending synchrophasor <sup>[[1](References.md#user-content-ref1)]</sup> data <sup>[[19](References.md#user-content-ref19)]</sup>.

Since UDP attempts frame reconstruction with the received packets, the impact of very large frames of data with UDP are similar to those with TCP and serialization technologies in that there are increased impacts on memory allocation and computational processing throughout the network infrastructure between source and destination of the data.

:construction: .. speak to increased overall data loss with large UDP frames, citing Peak RC tests... Large frame issues at this point will be well established, now include details on how the STTP protocol is different/ better in these regards. A packet diagram comparing frames to measurements would be useful...  

### Protocol Transport Channels

STTP data transport requires the use of a command channel using TCP/IP for reliable delivery of important commands. Optionally a secondary data channel can be established using UDP/IP for the transport of data that can tolerate loss. When no secondary UDP/IP is used, both commands and data will share use of the TCP/IP channel for communications.

> :tomato::question: JRC: _The question has been raised if a UDP only transport should be allowed? In this mode, any critical commands and responses would basically be sent over UDP. Thought would need to be given to commands and/or responses that never arrive and the consequences thereof._

_more_

> :information_source: Although not precluded from use over other data transports, the design of this protocol is targeted and optimized for use over Internet Protocol (IP), specifically TCP/IP and UDP/IP. Even so, since the command/response implementation and data packet distribution of the STTP protocol is fairly simple, it is expected that commonly available middleware data transport layers, such as ZeroMQ or DDS, could easily support and transmit data using the STTP protocol should any of the messaging distribution and management benefits of these transport layers be useful to a particular deployment environment. However, these types of deployments are outside the scope of this documentation. If needed, STTP integrations with middleware layers should be added as reference implementation repositories to the STTP organizational site <sup>[[4](References.md#user-content-ref4)]</sup>.

### Protocol Feature Summary

> :construction: This is the protocol promotional section that includes a bulleted list of the "value points" for the protocol

* Perform at high volume / large scale
* Minimize data losses (e.g., over UDP)
* Lower bandwidth requirements (e.g., over TCP)
* Optimized for the performant delivery of individual data points
* Automated exchange of metadata (no centralized registry required)
* Detect and expose communication issues
* Security and availability features that enable use on critical systems to support critical operations
* Publish/subscribe at data point level
* API implemented in multiple languages on multiple platforms
