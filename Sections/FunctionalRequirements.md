## Appendix A - Initial Team Requirements


![Image of Collorbation ](https://github.com/sttp/Specification/blob/master/Sections/Images/CollorbationStockImage.jpg?raw=true)


###Overview:
Before setting out to create a definition of a new protocol, participation was solicited from a diverse set of stakeholders. Grid Protection Alliance (GPA) worked to assemble a group of users, implementors, vendors and academics in order to vet the notion that a new protocol was actually needed and would provide value to our industries.   Once the group convinced themselves that none of the known existing standards was a protocol that would solve the problems being encountered, with very large, high speed data sets, they worked together to document what this new protocol required.   This appendix has been retained in the specification so that future users evaluating the use of the STTP protocol can see what drove the initial team in its creation of the protocol and associated APIs.



### Use Case Examples

First, an initial set of [use cases] (https://en.wikipedia.org/wiki/Use_case) were defined in order to document how stakeholders envisioned using this new STTP protocol. This is not meant to be an exhaustive list of  all possible uses, but rather a sampling of the driving needs that led to the need to create a new protocol. These use cases were collected and organized by how the team envisioned them to be deployed in real world applications.    This is not to limit implementation to one of these types, a system may implement a hybrid of two or more of these.   However, each system will advertise the functions that it provides or services so that neighbor connections can know what is available.



\*optional features

**measurement (PMU) Device**

As a system with a Network Interface (PDC, application, historian ) I would like to communicate with a Phasor Measurement Device using STTP. so that I may request data or reply to data requests.

Features:
 * Send Full Data Stream
 * Send Basic Metadata
 * Send Extended Metadata*
 * Fulfill Data Data Stream Subscription Request*
 * Fulfill Data Backfilling Request*
 * Encryption*
 * Data Compression*

![Device UML Image](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20device.jpg)


**Gateway**

Features:
* Send Full Data Stream
* Send Basic Metadata
* Send Extended Metadata*
* Fulfill Data Data Stream Subscription Request*
* Fulfill Data Backfilling Request*
* Request Full Data Stream
* Request Basic Metadata
* Request Extended Metadata*
* Request Data Data Stream Subscription*
* Request Data Backfilling*
* Encryption*
* Data Compression*

![Gateway UML Image] (https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20Gateway.jpg)


**Historian**

Features:
* Basic Metadata
* Encryption
* Data Compression
* Advance Queries

**Data Diode**

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




####Functional Requirements
Functional requirements are the subset of total requirements that explains how a it or one of its substations will work.    Functional requirements are the needs that drive the business utility of the final solution, in this case protocol.   Each functional requirement was defined to address a need that was not solved by existing solutions.

**The ASP solution will:**
* allow for dynamically requesting data or metadata.   It will not send all data all the time.  Most often this requirement is met with the use of a publish-subscribe implementation where the receiver can request data elements and they are delivered by the source on event such as value change.  **(Pub/Sub configurability)**

* support the collection, maintenance and communication of data attributes or metadata. **(Metadata management)**

* allow for the prioritization of data feeds.  In addition to streaming data should take precedence over metadata, the streaming data should allow for the designation of a priority.    Higher priority data flows should be given consideration in times of network congestion.    **(Quality of Service)**

* be capable of managing and streaming a very large sets.   At time of authoring a very large set would be 1000 Phasor Measurement Units sending 10 streaming data points at a refresh rate of thirty times per second (.033ms per data for the same element) on a standard network (i.e 100mbps ethernet)

* allow for the data to be requested (and sent) to multiple clients what may request the data elements in the same or different combinations.

* support measures to keep data from being viewed by non-authorized systems or staff.    This will include the ability to implement standard, [not propitiatory to this protocol] encryption techniques.  It will further provide the functions for management of the securing mechanisms. **(Confidentiality / Key management)** **(Enable best-practice security)** **(Reduced Risk of Non-Compliance)**

* Incorporate access control for both data and metadata so that only authorized users are able to successfully receive information after a request.   This security will be able to be set on a point by point basis (or element by element basis for metadata) **(Access Control)**

* be easily deployed in configurations that allow for very high fault tolerance.  This should include both network and client or server resiliency options. **(Deployment for high-availability)**  **(Support Disaster recovery considerations)**

* support short descriptor for each data point.   

* allow the incoming connection to define the measurements that will be selectively streamed. **(Subscribed Data Stream)**

* allow backfilling missing data in the event of a communications outage.  Receiving party would request and sending would respond with a data stream to fill in the missing data as defined by the receiver. **(Data Backfilling)**

*  provide data channels encryption by default as well as require and the connection be authenticated. **(Encryption)**

* support advance compression methods. **(Data Stream Compression)**

* be capable of allowing the party that initiates  a connection to be the sender, or publisher of data . **(Data Pushing)**

 * minimize data losses over network connections that do not guarantee delivery (e.g. UDP)


####Non-Functional Requirements
In software requirements documentation, a non-functional requirement is a requirement that specifies criteria that specifies the operation of a system, rather than behaviors. Many often call non-functional requirements "quality attributes"

**The ASP solution will:**

* Support the transfer of very large number of streaming (1,000s to 10s of 1,000s simultaneously) data points streaming at high update rates (30-60 times per second **(Scalability)**

* ensure data integrity end to end of any communication stream, for both streaming data and metadata **(Integrity)**

* Allow for future uses and data elements / attributes with minimal impact to the base protocol in order to allow for future improvements **(Extensibility)**


#### To talk to Ritchie about(may not be true requirements or may just need additional clarification)  <todo>

* include APIs that support condition based Alarming and notifications based on defined events  *(Alarming and notifications)*
* strive to be able to send as many data elements in a given time with the lowest latency possible for any given network configuration **(Performance and throughput [latency & bandwidth])**

* System Integration
* Installation and deployment
* Full Data Stream - Capable of sending all of the data points to any connecting stream.
* Advance Queries - Must be able to handle more advance request/reply queries.







 > :construction: This list was moved from Overview - needs to merged with list above...



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
