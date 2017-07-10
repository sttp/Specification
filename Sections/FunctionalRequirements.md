## Appendix A - Functional Requirements

> :construction: Candidate topics (for now, these are a mix of functional and non-functional requirements)

* Performance and throughput(latency & bandwidth)
* Scalability
* Pub/Sub configurability
* Metadata management
* Quality of Service
* Extensibility
* Confidentiality / Key management
* Access Control
* Integrity
* Alarming and notifications
* Enable best-practice security
* Reduced Risk of Non-Compliance
* Deployment for high-availability
* Disaster recovery considerations
* System Integration
* Installation and deployment

### Use Case Examples

**A.  High-volume, real-time phasor data exchange** (e.g., ISO/RTO -to- ISO/RTO)

Use case text

**B. Medium volume, real-time data exchange with name translation**  (e.g., Transmission Owner -to- ISO/RTO)

Use case text

**C.  Medium-volume historical phasor data exchange ** (e.g., ISO/RTO -to- Transmission Owner)

Use case text

**D. Within an Entity**

Use case text

**D. Low-volume real-time phasor data exchange with automated gap filling** (e.g., Substation PDC -to- Control Center)

Use case text

> :construction: The following are _proposed_ ideas that may need a home -- purposely written in future tense

### Operaitonal Requirements

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
Per subscription delivery window – this subscription level setting would constrain data delivery to a provided timespan (in terms of UTC based start and stop time). This could either be a maximum (future) time constraint for real-time data or, where supported by publisher, a historical data request.
Publisher will likely want to validate size of historical requests, or least throttle responses, for very large historical requests.

#### Other Data Point Delivery Options
Send a sequence of values – with respect to specified per value delivery settings (think buffer blocks)

Send latest value – command allows for non-steaming request/reply, such as, translation to DNP3

Send historical values – subject to availability of local archive / buffer with start and stop time- it has been requested many times that single value data recovery option will be available to accommodate for simple UDP loss, however this should be carefully considered since this basically makes UDP and TCP style protocol – if implemented, restored point should likely flow over TCP channel to reduce repeat recovery requests. Also, this should include detail in response message that recovery either succeeded or failed, where failure mode could include “data not available”. To reduce noise, at connection time publisher should always let know subscriber its capabilities which might include “I Support Historical Data Buffer” and perhaps depth of available data. That said there is true value in recovery of data gaps that occur due to loss of connectivity.
