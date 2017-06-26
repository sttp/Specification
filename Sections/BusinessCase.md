## Business case

At the conclusion of the STTP project in April 2019, the new STTP will be a well-tested, thoroughly vetted, production-grade protocol that will be supported by project team vendors.  An open source tool suite for STTP will be developed as part of the project (See: [Appendix A](#appendix-a---stp-api-reference)) that will include a test harness that will allow utilities and vendors outside the project to test and validate STTP in their systems and API’s.

STTP offers both short-term cost savings and strategic value in that it is:


#### Intrinsically More Robust with Less Data Loss
* By design, STTP packet sizes are small and are optimized for network MTU size reducing fragmentation which results in more efficient TCP performance and less overall data loss with UDP.

* STTP puts significantly less stress on network routing equipment and facilitates mixing of streaming data traffic and other general network communications.  With STTP, purpose built networks are not required to reliably support very large phasor data streams.

#### Security Centric
* STTP has been built using a "security first" design approach.  Authentication to establish a "connection" with other parties requires a "certificate".  While public certificate providers can be used, it is recommended that symmetric certificates be exchanged out-of-band to avoid the risk and cost of management of public keys.

* Best-practice encryption is natively available in STTP but not required given the common practice to manage encryption at the network layer.

#### Reduces First Cost
* GEP has been measured [[5](#ref5)] to have less than half the band width requirements of IEEE C37.118 [[1](#ref1)] when used with TCP and simple methods for lossless compression.  With the compression, a single signal or measurement point (i.e., an identifier, timestamp, value and quality code) requires only 2.5 bytes. By comparison, IEEE C37.118 requires 4.5 bytes per measurement on average.

* The signal-based GEP protocol incorporates Pub/Sub data exchange methods so that unnecessary data points need not be exchanged – thereby further reducing overall bandwidth requirements as compared to IEEE C37.118.

#### Reduces Operating Cost
* GEP automatically exchanges and synchronizes measurement level meta-data using a GUID as the key value to allow the self-initialization and integration of rich meta-data with points from multiple connected synchrophasor networks.  This eliminates the need to map measurements to a pre-defined set identifiers and dispenses with the cost and hassles of synchronization of individual utility configuration with a centralized registry.

* Permissions for data subscriptions can be grouped and filtered using expressions to assure that only the signals that are authorized are shared (for example, all phasors from a specified substation) while the set of points available is dynamically adjusted as PMUs come and go without the need for point-by-point administrator approval.

#### An Enabling Technology

* It's possible that a protocol like STTP which allows secure, low-latency, high-volume data exchange among utilities at low cost can be a major factor in driving rapid change in the industry.  New forms of inter-utility interaction will be possible.  New approaches for providing utility information services will be possible.

#### Built Upon A Proven Approach
* STTP will enhance the successful design elements of the Gateway Exchange Protocol (GEP) as a foundation – and improve upon it.

* GEP is in n production use by Dominion, Entergy, MISO, PeakRC, TVA, FP&L, Southern Company and others.