## Protocol Overview

> :construction: Purpose of protocol, fundamentals of how it works (command and data) - include sub-section titles ( 4# items) as needed

In typical messaging exchange paradigms a source application hosts a block of structured data, composed in memory, with the intent to transmit the data to one or more receiving applications. The data has _structure_ in the sense that it exists as a collection of simpler primitive data types where each of the data elements is given a name to provide useful context and meaning; most programming languages represent data structures using a primary key word, e.g., `class` or `struct`. Before transmission, the data structure must be serialized - this is necessary because the programming language of the source application which hosts the data structure defines the structure in memory using a format that is optimized for use in the application. The process of serializing the data structure causes each of the data elements to be translated into a format that is easily transmitted over a network and is suitable for deserialization by a receiving application.

The applications that are sending and receiving data structures can be running on the same machine or on different physical hardware with disparate operating systems. As a result, the details of the data structure serialization format can be complex and diverse. Such complexities can include issues with proper handling of the endianess of the primitive data types during serialization which may differ from the system that is deserializing the data, or differences in the interpretation of how character data is encoded <sup>[[8](References.md#user-content-ref8)]</sup>.

The subject of serializing data structures in the field of computer science has become very mature; many solutions exist to manage the complexities of serialization. Today most computer programming languages, or their associated frameworks, include various options for serializing data structures in multiple formats. However, these solutions tend to only work within their target ecosystems and are usually not very interoperable with other frameworks or languages.

When interoperability is important, other technologies exist that focus on data structure serialization that works regardless of hardware, operating system or programming language. Two of these serialization technologies that are in wide use are Google Protocol Buffers <sup>[[9](References.md#user-content-ref9)]</sup> and the Facebook developed Apache Thrift <sup>[[10](References.md#user-content-ref10)]</sup>. Both of these serialization frameworks create highly compact, cross-platform serializations of data structures with APIs that exist in many commonly used programming languages.

> :information_source: In the electric power industry, the IEEE C37.118 <sup>[[1](References.md#user-content-ref1)]</sup> protocol exists as a standard serialization format for the exchange of synchrophasor data. Synchrophasor data is typically measured with an accurate time source, e.g., a GPS clock, and transmitted at high-speed data rates, up to 120 frames per second. Measured data sent by this protocol is still simply a frame of serialized primitive types which includes data elements such as a timestamp, status flags, phasor angle / magnitude pairs, etc. The IEEE C37.118 protocol also prescribes the combination of data frames received from multiple source devices for the same timestamp into one large combined frame in a process known as concentration. The concentration process demands that a waiting period be established to make sure all the expected data frames for a given timestamp arrive. If any frames of data do not arrive before the waiting period expires, the overall combined frame is published anyway. Since the frame format is fixed, empty data elements that have no defined value, e.g., NaN or null, still occupy space for the missing frames.

For smaller sized, discrete data structures, the existing available serialization technologies are very fast and highly effective. However, as the data structures become larger, the process of serialization and deserialization becomes more costly in terms of both memory allocation and computational processing. Because of this, large frames of data are not recommended for use by these serialization technologies <sup>[[11](References.md#user-content-ref11)]</sup> <sup>[[12](References.md#user-content-ref12)]</sup>. Additionally, and perhaps more importantly, there are also penalties that occur at the network transport layer.

> :information_source: For the purposes of this specification, serialized data structures will be referred to as a _frames_, regardless of the actual binary format.

### Large Frame Network Impact

In terms of Internet Protocol (IP), all frames of data to be transmitted that exceed the negotiated maximum transmission unit (MTU) size (typically 1,500 bytes for Ethernet networks <sup>[[13](References.md#user-content-ref13)]</sup>) are divided into multiple fragments where each fragment is called a network packet.

![Packet Fragementation](https://sysmincomputing.files.wordpress.com/2010/12/frag.png)

The impacts of large frames on an IP network are determined by the number of network packets required to send the frame and the fact that IP is inherently unreliable by design. Network packets can only be transmitted over a connection one packet at a time; when two or more network packets arrive for transmission at the same time on any physical network media, the result is a collision. When a collision occurs, only one packet gets sent and the others get dropped <sup>[[14](References.md#user-content-ref14)]</sup>. IP defines a variety of different transport protocols for network packet transmission, each of which behave in different manners when dealing with packet loss. Consequently, many of the impacts a large frame has on an IP network is dependent upon the transport protocol used to send the frame.

#### Large Frame Impacts on TCP/IP

The most common Internet protocol, TCP/IP, creates an index for each of the network packets being sent for a frame of data and verifies that each are successfully delivered, retransmitting packets as many times as needed in the case of loss. This functionality is the basis for TCP being considered a _reliable_ data transmission protocol.

Since each packet of data for the transmitted frame is sequentially ordered, TCP is able to fully reconstruct and deliver the original frame once all the packets have arrived. However, for very large frames of data this causes TCP to suffer from the same kinds impacts on memory allocation and computational burden as the aforementioned serialization technologies, i.e., Protocol Buffers and Thrift. The unique distinction for IP based protocols is that at some level, these issues also affect every element of the interconnected network infrastructure between the source and sync of the data being exchanged.

Another critical impact that is unique to TCP is that for data that needs to be delivered in a timely fashion, retransmissions of dropped frames can also cause cumulative time delays <sup>[[15](References.md#user-content-ref15)]</sup>, especially as large data frames are published at rapid frame rates. Time delays are also exacerbated during periods of increased network activity which induces congestion and a higher rate of collisions.

> :information_source: Synchrophasor data <sup>[[1](References.md#user-content-ref1)]</sup> is the source for real-time visualization and analysis tools which are used to operate the bulk electric system (BES) <sup>[[16](References.md#user-content-ref16)]</sup>. This real-time data is required to be accurate, dependable and timely in order to be useful for grid operators <sup>[[17](References.md#user-content-ref17)]</sup>. Any delays in the delivery of this data could have adverse affects on operational decisions impacting the BES.

#### Large Frame Impacts on UDP/IP

Another common Internet protocol is UDP/IP. Transmission of data over UDP differs from TCP in the fact that UDP does not attempt to retransmit data nor does it make any attempts to maintain the order of the transmitted packets. This functionality is the basis for UDP being considered a _lossy_ data transmission protocol, but more lightweight than TCP.

Even with the unreliable delivery caveats, UDP will still attempt to reconstruct and deliver the originally transmitted frame of data. However, even if a single network packet is dropped, the entire original frame will be lost and any packets that were already accumulated get discarded <sup>[[18](References.md#user-content-ref18)]</sup>. In other words, there are no partial frame deliveries, frame reception with UDP is an all or nothing operation.

Since UDP attempts frame reconstruction with the received packets, the impact of very large frames of data with UDP are similar to those with TCP and serialization technologies in that there is increased memory allocation and computational processing throughout the network infrastructure.

The more problematic impact with UDP and large frames of data is that the increased number of network packets needed to send a large frame also increases the probability of dropping one of those packets due to a collision. Since the loss of any one packet results in the loss of the entire frame of data, as frame size increases, so does volume of data loss.

##### Impacts of UDP Loss on Synchrophasor Data

For synchrophasor data, UDP is often the protocol of choice. The density of synchrophasor data allows analytical applications to tolerate _some_ loss. The amount of losses that can be tolerated depend on the nature of the analytic, however, it is not uncommon for analytics to require less than 0.2% loss before there is no longer confidence in the results <sup>[[citation needed](References.md)]</sup>. Another reason UDP is used for synchrophasor data is its lightweight nature; use of UDP reduces overall network bandwidth requirements as compared to TCP <sup>[[19](References.md#user-content-ref19)]</sup>. Perhaps the most critical reason for use of UDP for synchrophasor data is that UDP does not suffer from issues with induced time delays caused by retransmission of dropped network packets.

For IEEE C37.118 <sup>[[1](References.md#user-content-ref1)]</sup> deployments, large frame sizes can have adverse affect on data completeness; as more and more devices are concentrated into a single frame of data, the larger frame sizes contribute to higher overall data losses. In tests conducted by PeakRC, measured overall data loss for the transmission of all of its synchrophasor data using IEEE C37.118 averaged over 2% <sup>[[5](References.md#user-content-ref5)]</sup> when using a data rate of 30 frames per second and more than 3,100 data values per frame. To help mitigate the data losses when using UDP, some companies have resorted to purpose-built, dedicated synchrophasor networks <sup>[[20](References.md#user-content-ref20)]</sup>. Although a dedicated network is ideal at reducing data loss (minimizing simultaneous network traffic results in fewer collisions), this will not be an option for most companies that treat the network as a shared resource.

### Changing the Paradigm

> :construction: Turn bullets into prose... This section needs to contrast how STTP is different / better than data structure serialization when applied to large data volumes

* When need exists to send large ~~frames~~ volumes data at high speeds, STTP is an excellent option. Otherwise, for smaller datasets, suggest sending data using protobuf or thrift.
* The nature of IP is not going to change
* With STTP, delivery of the data is made more atomic to fit within MTU size, i.e., data is reduced to its primitive types and only the values that will fit into a single packet are transmitted to reduce (or eliminate) frame fragmentation - contrast previous large frame impacts where possible
* Sending primitives instead of data structure can increase bandwidth, but it will reduce data losses (cite GEP testing)
* External APIs exist (e.g., openECA) to manage serialization and deserialization of data structures from primitives - so the data structure, if useful, while managing data delivery of the primitive types can still be used - add note that technically IEEE C37.118 is just a data structure mapping to primitives
* Managing data at the primitive level adds granular control of access control rights as well as ability for data receivers to "subscribe" to only the data of interest
* Introduce individual primitive values as time series data points - time required(?), but may simply be an auto-incrementing integer value
* For each time series data point, rich metadata will be made available
* Lead into next section for deeper detail

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
* Metadata will be versioned
* Metadata will be tabular in nature (describe like a database table)
* Sets of metadata from multiple parties will be easy to merge (introduce Guid for point ID)
* Points defined in metadata will have a clear ownership path
* A minimal set of metadata will exist to support any STTP deployments
* Industry specific metadata extensions will exist to support specific industry deployments

### Protocol Transport Channels

STTP data transport requires the use of a command channel using TCP/IP for reliable delivery of important commands. Optionally a secondary data channel can be established using UDP/IP for the transport of data that can tolerate loss. When no secondary UDP/IP is used, both commands and data will share use of the TCP/IP channel for communications.

> :tomato::question: JRC: _The question has been raised if a UDP only transport should be allowed? In this mode, any critical commands and responses would basically be sent over UDP. Thought would need to be given to commands and/or responses that never arrive and the consequences thereof._

_more_

> :information_source: Although not precluded from use over other data transports, the design of this protocol is targeted and optimized for use over Internet Protocol (IP), specifically TCP/IP and UDP/IP. Even so, since the command/response implementation and data packet distribution of the STTP protocol is fairly simple, it is expected that commonly available middleware data transport layers, such as ZeroMQ or DDS, could easily support and transmit data using the STTP protocol should any of the messaging distribution and management benefits of these transport layers be useful to a particular deployment environment. However, these types of deployments are outside the scope of this documentation. If needed, STTP integrations with middleware layers should be added as reference implementation repositories to the STTP organizational site <sup>[[4](References.md#user-content-ref4)]</sup>.
