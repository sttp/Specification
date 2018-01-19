## UDP Encrypted Transport Protocol

Transporting Sttp over TCP can take advantage of the widely trusted TLS encryption protocol. On the other hand when transporting over UDP, there is not a clear winner. DTLS (Datagram-TLS) is not widely used and requires a bi-directional communications channel to exists. Sttp's primary need for UDP is to provide a true fire-and-forget means of sending data from a secure/trusted environment to an insecure one. For this, STTP will use U/TLS (See document in appendix.)

>  :information_source: Sttp over UDP is a 1-way communications channel. This allows for communications paths that are one-to-one, one-to-many, or one-to-none. If a 2-way communications channel is desired, some kind of hybrid connection can accommodate this need, but it will not be discussed in this section.

Not all sttp commands can be transported using UDP, and some commands will have additional values that must be present to communicate over a UDP channel. 

### Implementation Examples

Since there will not be a feedback loop, the sender will have to make the determination on how sttp commands are sent to the receiver. One example could be: The entire metadata set is sent once per hour, a metadata delta is sent once per minute, and the real-time stream is sent as it comes in. Specifics how this can be done are outlined in another section (This section hasn't been written.)