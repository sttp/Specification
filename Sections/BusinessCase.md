
[6a738c01]: https://en.wikipedia.org/wiki/IEC_60870-6 "IEC 60870-6"
[fb950db5]: https://en.wikipedia.org/wiki/SCADA "SCADA"
[9b056dc9]: https://en.wikipedia.org/wiki/Transmission_Control_Protocol "TCP"
[9b056dc8]: https://en.wikipedia.org/wiki/User_Datagram_Protocol "UDP"
[dd00032f]: https://www.dominionenergy.com/ "Dominion"
[073da9a4]: http://entergy.com/ "Entergy"
[0c5f67e2]: https://www.misoenergy.org/ "MISO"
[0c5f67e3]: https://www.peakrc.com/Pages/default.aspx "Peak Reliability"
[0c5f67e4]: https://www.tva.gov/ "TVA"
[0c5f67e5]: https://fpl.com/ "FPL"
[0c5f67e6]: http://www.southerncompany.com/ "Southern Company"
[9545cc62]:  https://smartgrid.ieee.org/resources/standards/ieee-approved-proposed-standards-related-to-smart-grid/762-c37-118-2005-ieee-standard-for-synchrophasors-for-power-systems "IEEE 37.118"


  [IEEE 37.118][9545cc62] has enabled synchrophasors to be utilized across the electric utility landscape.   It has been the infrastructure on which so many advancements on grid monitoring, model validation, dynamic control and other uses.   The huge expansion in the use of 37.118 has exposed some limitation of its use.

  Streaming Telemetry Transport Protocol (STTP) looks to advance the work started by designers and users of 37.118 and other protocols and expand the tools available to use synchrophasor data at production scale.

  At the conclusion of the Advanced Synchrophasor Protocol (ASP) project in April 2019, Streaming Telemetry Transport Protocol (STTP) will be a well-tested, thoroughly vetted, production-grade protocol, supported by open source applications as well as commercial software from vendors participating in the project.  An open source tool suite for STTP will also be developed as part of the project (see [Appendix B](APIReference.md)) that will include a test harness that will allow future users to test and validate STTP in their systems and API's.


## Business case

The STTP protocol is an ideal protocol to share time series data.  It allow for transport of measurements with low latency at device speeds from [ICCP][6a738c01] / [SCADA][fb950db5] (1 update every 1 to 10 seconds) to Synchrophasor (60 or more updates per second) using less bandwidth than any other current protocol.    In addition to the real time data STTP support bidirectional sharing of metadata between the communicating applications.

Specifically STTP offers both short-term cost savings and strategic value in that it is:

#### Intrinsically Robust

By design, STTP packet sizes are small and are optimized for network MTU size.  This  reduces network level fragmentation, which results in more efficient performance while using [TCP][9b056dc9] and less overall data loss with [UDP][9b056dc8].  STTP also puts significantly less stress on network routing equipment as well as facilitates mixing of streaming data traffic and other general network communications.  With STTP, purpose built networks are not required to reliably support very large synchrophasor measurement data streams.

#### Security Centric

STTP has been built using a "security first" design approach.  Authentication to establish a connection with other parties requires a certificate.  While public certificate providers can be used, it is recommended that symmetric certificates be exchanged out-of-band to avoid the risk and cost of management of public keys. Best-practice encryption is also natively available in STTP, but not required, to manage encryption at the network layer.

#### Reduces First Cost

A protocol similar to STTP called Gateway Exchange Protocol (GEP) has been measured <sup>[[5](References.md#user-content-ref5)]</sup> to have less than half the bandwidth requirements of IEEE C37.118 <sup>[[1](References.md#user-content-ref1)]</sup> when used with TCP and simple methods for lossless compression.  With the compression, a single signal or measurement point (i.e., an identifier, timestamp, value and quality code) requires only 2.5 bytes. By comparison, IEEE C37.118 requires 4.5 bytes per measurement on average. The signal-based GEP protocol incorporates Pub/Sub data exchange methods so that unnecessary data points need not be exchanged - thereby further reducing overall bandwidth requirements as compared to IEEE C37.118.

#### Reduces Operating Cost

STTP will allow for automatic exchange and synchronize measurement level meta-data.  This is accomplished using a GUID as the key value to allow the self-initialization and integration of rich meta-data with points from multiple connected synchrophasor networks.  By including facilities to map and synchronize meta-data STTP eliminates the need to map measurements to a pre-defined set identifiers and dispenses with the cost and hassles of synchronization of individual utility configuration with a centralized registry. The protocol allows for permissions on data subscriptions to be grouped and filtered using expressions assuring that only the signals that are authorized are shared (i.e. for example, all phasor measurements from a specified substation) while the set of points available is dynamically adjusted as PMUs come and go without the need for point-by-point administrator approval.

#### An Enabling Technology

While STTP was developed with Synchrophasor data in mind, the protocol has the ability to transform how traditional utility data is shared between systems, and stakeholders in many different parts of the utility space.

STTP provides an alternative to the existing method for utility data exchange that will enable future generations of SCADA/EMS systems to both (1) utilize full-resolution synchrophasor data streams and (2) significantly reduce the cost of maintaining the configuration of components to exchange other real-time data.  An ISO/RTO will typically exchange hundreds of thousands of data points every few seconds with its members and neighbors.  

> :information_source: ICCP (IEC 60870-6/TASE.2) is the international standard used to exchange "real-time" SCADA data among electric utilities.  Analog measurement data is typically exchanged continuously every 2 to 10 seconds with bi-modal data such as breaker status information only being exchanged "on change".  ICCP came into coordinated use in North America in the mid-1990s.

Promising technologies are being developed for cloud computing and these technologies are moving toward native implementations at individual utilities and ISOs.  These cloud computing technologies can also be leveraged to support larger native implementations such as those for an interconnect.  The common theme among these technologies is the ability to process significantly more data quickly with improved reliability.

It's possible that a protocol like STTP which allows secure, low-latency, high-volume data exchange among utilities at low cost can be a major factor in driving change toward these new technologies. New higher-speed forms of inter-utility interaction will be possible, and new approaches for providing utility information services will be realizable.  


#### Built Upon A Proven Approach

 STTP will enhance the successful design elements of the Gateway Exchange Protocol (GEP) as a foundation and improve upon it. GEP is currently in production use by many industry players including [Dominion Energy][dd00032f], [Entergy][073da9a4], [MISO][0c5f67e2], [Peak Reliability][0c5f67e3], [Tennessee Valley Authority][0c5f67e4], [Florida Power & Light][0c5f67e5], [Southern Company][0c5f67e6], among others.
