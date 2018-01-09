## Appendix A - Functional Requirements

###Overview:
Before setting out to create a definition of a new protocol, participation was solicited. Grid Protection Alliance (GPA) worked to assemble a group of users, implementors, vendors and academics in order to vet the notion that a new protocol was actually needed.   Once the group convinced themselves that none of the existing standards had a protocol that would solve the problems being encountered with very large, high speed data sets, they worked together to document what this new protocol required.   This appendix has been retained in the specification so that future users evaluating the use of the ASP protocol can see what drove the initial team in its endeavor.


####Functional Requirements
Functional requirements are the subset of total requirements that explains how a it or one of its substations will work.    Functional requirements are the needs that drive the business utility of the final solution, in this case protocol.   Each functional requirement was defined to address a need that was not solved by existing solutions.

**The ASP solution will:**
* Allow for dynamically requesting data or metadata.   It will not send all data all the time.  Most often this requirement is met with the use of a publish-subscribe implementation where the receiver can request data elements and they are delivered by the source on event such as value change.  **(Pub/Sub configurability)**

* Support the collection, maintenance and communication of data attributes or metadata. **(Metadata management)**

* Allow for the prioritization of data feeds.  In addition to streaming data should take precedence over metadata, the streaming data should allow for the designation of a priority.    Higher priority data flows should be given consideration in times of network congestion.    **(Quality of Service)**

* be capable of managing and streaming a very large sets.   At time of authoring a very large set would be 1000 Phasor Measurement Units sending 10 streaming data points at a refresh rate of thirty times per second (.033ms per data for the same element) on a standard network (i.e 100mbps ethernet)

* Allow for the data to be requested (and sent) to multiple clients what may request the data elements in the same or different combinations.


* support measures to keep data from being viewed by non-authorized systems or staff.    This will include the ability to implement standard, [not propitiatory to this protocol] encryption techniques.  It will further provide the functions for management of the securing mechanisms. (Confidentiality / Key management)
* Access Control
* Integrity
* Alarming and notifications
* Enable best-practice security
* Deployment for high-availability
* Disaster recovery considerations
* System Integration
* Installation and deployment

####Non-Functional Requirements
In software requirements documentation, a non-functional requirement is a requirement that specifies criteria that specifies the operation of a system, rather than behaviors. Many often call non-functional requirements "quality attributes"

* Performance and throughput(latency & bandwidth)
* Scalability
* Reduced Risk of Non-Compliance

* Allow for future uses and data elements / attributes with minimal impact to the base protocol in order to allow for future improvements **(Extensibility)**


### Feature List
 * Full Data Stream - Capable of sending all of the data points to any connecting stream.
 * Basic Metadata - Defines each data point with only a short descriptor.
 * Subscribed Data Stream - Allows the incoming connection to define the measurements that will be selectively streamed.
 * Access Control - Permissions controls on a point by point basis.
 * Data Backfilling - Allows backfilling missing data in the event of a communications outage.
 * Encryption - Data channels are encryption and the connection is authenticated.
 * Data Stream Compression - The data stream will support advance compression methods.
 * Advance Queries - Must be able to handle more advance request/reply queries.
 * Data Pushing - Capable of initializing a connection and writing data out.


 > :construction: This list was moved from Overview - needs to merged with list above...

 * Perform at high volume / large scale
 * Minimize data losses (e.g., over UDP)
 * Lower bandwidth requirements (e.g., over TCP)
 * Optimized for the performant delivery of individual data points
 * Automated exchange of metadata (no centralized registry required)
 * Detect and expose communication issues
 * Security and availability features that enable use on critical systems to support critical operations
 * Publish/subscribe at data point level
 * API implemented in multiple languages on multiple platforms
 * Metadata will be versioned and tabular in nature
 * Sets of metadata from multiple parties will be easy to merge
 * Points defined in metadata will have a clear ownership path
 * A minimal set of metadata will exist to support any STTP deployments
 * Industry specific metadata extensions will exist to support specific industry deployments
 * Ability to support broadcast messaging and distribution of critical system alarms


### Use Case Examples

This is a list of all use cases along with the predefined set of features that must be supported by this use case.

\*optional features

**A. PMU**

Features:
 * Full Data Stream
 * Basic Metadata
 * Subscribed Data Stream*
 * Data Backfilling*
 * Encryption*

**B. PDC**

Features:
 * Full Data Stream
 * Basic Metadata
 * Subscribed Data Stream
 * Data Backfilling*
 * Encryption
 * Data Compression*

**C. Gateway**

Features:
* Full Data Stream
* Basic Metadata
* Subscribed Data Stream
* Data Backfilling*
* Encryption
* Data Compression

**D. Historian**

Features:
* Basic Metadata
* Encryption
* Data Compression
* Advance Queries

**E. Data Diode**

To facilitate moving data from a more secure environment to a less secure one (eg. Prod to Dev) a
separate service will be created that can connect to (or accept connections from) a publisher. This
communication can be a fully implemented sttp connection and thus can manage subscriptions that will be
exported to lower level clients.

This data diode will then establish a connection with a lower security level and forward data to this
client. The client will only be able to turn on/off the data stream, request metadata, and request a user
configurable amount of historical data that may be missing during a communications outage. These requests
must be handled by the data diode with no modifications made to the established connection to the publisher.
Each connection must operate independently of each other.

Features:
* Data Pushing
* Basic Metadata
* Encryption
* Data Compression

-------------------------
(Old use case examples)

**A.  High-volume, real-time phasor data exchange** (e.g., ISO/RTO -to- ISO/RTO)

Use case text

**B. Medium volume, real-time data exchange with name translation**  (e.g., Transmission Owner -to- ISO/RTO)

Use case text

**C.  Medium-volume historical phasor data exchange** (e.g., ISO/RTO -to- Transmission Owner)

Use case text

**D. Within an Entity**

Use case text

**D. Low-volume real-time phasor data exchange with automated gap filling** (e.g., Substation PDC -to- Control Center)

Use case text

> :construction: The following are _proposed_ ideas that may need a home -- purposely written in future tense

### Operational Requirements

#### Data Classes

(1) commands  & notifications & transactional data - **The Command Channel**

> :construction: some text from SIEGate doc as a starting point

The command channel will be used to reliably negotiate session-specific communication, state, and protocol parameters.  It will:

* exchange metadata information between gateways in a trusted union, with each publishing gateway only exchanging information that the subscribing gateway is allowed to view.
* allow the connecting gateway to request points for a streaming data subscription from the publishing gateway. Requests for points that are not in the access control list for the subscribing gateway will be denied with a returned error.
* minimize the bandwidth required for communicating measurement IDs and time-stamps.
* allow the subscribing gateway to start and stop the data stream.
* exchange and optionally synchronize measurement point metadata information received from external trusted gateway unions to the local configuration source so that users can examine points that are available for subscription.
*  enforce trusted gateway measurement point publication and subscription lists as defined in the configuration database. The system will drop data that it is not configured to receive.
* provide the necessary mechanisms to negotiate QoS configuration with the receiving entity.


Provide the necessary communication to establish a trusted connection between a STTP publisher and subscriber by:
* establishment of a trusted STTP union will be handled through a manual configuration process out-of-band, that is, not over the gateway-to-gateway network over which the gateways communicate.
* information being used to establish a trusted union between an STTP publisher and subscriber  will be protected on the local system and will be considered information known only to the two gateways participating in the union.
* the gateways participating in the trusted union will exchange authentication information in an accepted and interoperable manner. For that reason, TLS and identity certificates should be used if possible.


(2) streaming data - **The Data Channel**

The data channel will be used to send compact packets of identifiable measured values along with a timestamp with high-fidelity accuracy and flags that can be used to indicate both time and data quality.

#### Data Exchange with Other STTP Systems



#### Subscription Delivery Options
Per subscription delivery window - this subscription level setting would constrain data delivery to a provided timespan (in terms of UTC based start and stop time). This could either be a maximum (future) time constraint for real-time data or, where supported by publisher, a historical data request.
Publisher will likely want to validate size of historical requests, or least throttle responses, for very large historical requests.

#### Other Data Point Delivery Options
Send a sequence of values - with respect to specified per value delivery settings (think buffer blocks)

Send latest value - command allows for non-steaming request/reply, such as, translation to DNP3

Send historical values - subject to availability of local archive / buffer with start and stop time- it has been requested many times that single value data recovery option will be available to accommodate for simple UDP loss, however this should be carefully considered since this basically makes UDP and TCP style protocol - if implemented, restored point should likely flow over TCP channel to reduce repeat recovery requests. Also, this should include detail in response message that recovery either succeeded or failed, where failure mode could include "data not available". To reduce noise, at connection time publisher should always let know subscriber its capabilities which might include “I Support Historical Data Buffer” and perhaps depth of available data. That said there is true value in recovery of data gaps that occur due to loss of connectivity.
