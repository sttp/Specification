## Appendix A - Initial Team Requirements


![Image of Collorbation ](https://github.com/sttp/Specification/blob/master/Sections/Images/CollorbationStockImage.jpg?raw=true)


<<<<<<< HEAD
###Overview:
Before setting out to create a definition of a new protocol, participation was solicited from a diverse set of stakeholders. Grid Protection Alliance (GPA) worked to assemble a group of users, academics, vendors and other stakeholders in order to vet the notion that a new protocol was actually needed and would provide value to our industries.   Once the group convinced themselves that none of the known existing standards was a protocol that would solve the problems being encountered, with very large, high speed data sets, they worked together to document what this new protocol required.   This appendix has been retained in the specification so that future users evaluating the use of the STTP protocol can see what drove the initial team in its creation of the protocol and associated APIs.
=======
### Overview:
Before setting out to create a definition of a new protocol, participation was solicited from a diverse set of stakeholders. Grid Protection Alliance (GPA) worked to assemble a group of users, implementors, vendors and academics in order to vet the notion that a new protocol was actually needed and would provide value to our industries.   Once the group convinced themselves that none of the known existing standards was a protocol that would solve the problems being encountered, with very large, high speed data sets, they worked together to document what this new protocol required.   This appendix has been retained in the specification so that future users evaluating the use of the STTP protocol can see what drove the initial team in its creation of the protocol and associated APIs.
>>>>>>> e46afbf92f50631334c73eaa6aa6bddcbc670f43

STTP defines a measurement as an ID, Timestamp and values

At the highest level, STTP is expected to be used to manage data sourced from a measurement device through a data gateway/historian onto the using application.  The following document is meant to show the likely interaction between the actors in this workflow:


![Actor UML Image](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20Actors.jpg)


### Use Case Examples

First, an initial set of [use cases](https://en.wikipedia.org/wiki/Use_case) were defined in order to document how stakeholders envisioned using this new STTP protocol. This is not meant to be an exhaustive list of  all possible uses, but rather a sampling of the driving needs that led to the need to create a new protocol. These use cases were collected and organized by how the team envisioned them to be deployed in real world applications.    This is not to limit implementation to one of these types, a system may implement a hybrid of two or more of these.   However, each system will advertise the functions that it provides or services so that neighbor connections can know what is available.


While the protocol is meant to be flexible, there are a minimum set of features that must be provided for each use case implementation.   In the below examples we will use an asterisk to designate those features that are desirable, but not required as part of the minimal implementation --- \*optional features

**Use Case #1 - Measurement Device**

The most basic implementation of STTP will be in a measurement device.    This could be a PMU, RTU or other device that is built to measure one or more values or conditions.    

_Use case definition statement:_  

As a measurement device with a Network Interface (NIC) connected to an IP based network,  I would like to communicate with a Measurement Device using STTP, so that I may request data and metadata in a secured and efficient manner.

Features:
 * Send Full Data Stream
 * Send Basic Metadata
 * Send Extended Metadata*
 * Fulfill Data Data Stream Subscription Request*
 * Fulfill Data Backfilling Request*
 * Encryption*
 * Data Compression*



![Device UML Image](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20device.jpg)


**Use Case #2 - Data Gateway**

The next most likely implementation of STTP after measurement device is likely to be a computer to collect data from multiple measurement devices.  With respect to STTP protocol these collection devices will be called Data Gateways.    A data gateway allows downstream systems to request measurement streams from a number of different devices without having direct network access to the device themselves.  The Data Gateway will forward a real time data stream for the requested measurements to authenticated and authorized requestors.      In addition to real time data a Data Gateway will provide related metadata once requestors have been properly authenticated and authorized.  

_Use case definition statement:_  

As a data gateway with a Network Interface (NIC) connected to an IP based network,  I would like collect as well as repackage measurements received to those systems that are requesting real time feeds. using STTP, so that I may request data and metadata in a secured and efficient manner.


Features:
* Send Full Data Stream
* Send Basic Metadata
* Send Extended Metadata*
* Fulfill Data Stream Subscription Request*
* Fulfill Data Backfilling Request*
* Request Full Data Stream
* Request Basic Metadata
* Request Extended Metadata*
* Request Data Stream Subscription*
* Request Data Backfilling*
* Encryption*
* Data Compression*




![Gateway UML Image](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20Gateway.jpg)


**Use Case #3 - Historian**

The Historian supports many of the same features of a Dat Gateway.   However its primary function is to store a historical record of both measurements as well as the associated metadata.  The other major difference for a Historian compared to a gateway is that a historian may provide advanced filtering, summation, averaging or other advanced query mechanisms in addition to raw measurements.  

_Use case definition statement:_  

As a designer of STTP I would like to be able to have an application that can collect real time data, store it for a long period of time and be able to sever the stored data back to authorized and authenticated users so that I may utilize in part or in full data measurement stream data after the fact.


Features:
* Send Full historical data stream
* Send filtered historical data stream
* Send Basic Metadata based on version or data
* Send Extended Metadata based on version or data
* Fulfill Data Stream Subscription Request for historical data
* Fulfill Data Backfilling Request*
* Request Full Data Stream
* Request filtered historical data stream
* Request Basic Metadata
* Request Extended Metadata*
* Request Data Stream Subscription*
* Request Data Backfilling*
* Encryption*
* Data Compression*
* Advanced Filters and Queries


![Historian UML Image](https://raw.githubusercontent.com/sttp/Specification/master/Sections/Images/Use%20Case%20UML%20-%20Historian.jpg)


**Use Case #4 - Combination Gateway / Historian**
as noted before the use cases are suggested implementations.   It is expected that some systems will implement both the gateway as well as historian functions in a single system.


**Use Case #4 - Consumer Application**
Possibly the easiest to understand use case is the consumer application.   A Consumer Application is any business (or IT) application that wishes to receive measurements via STTP.  Good examples would include EMS or control room visualization system.   In this case an application would request measurement and metadata in order to use it in its own processing.


**Use Case #4 - Data Generating Application**
As we described above a measurement device will likely be the initial data set for STTP data.   However it is expected that in addition to raw measurement devices there will be applications that create their own measurements.   An example could be a state estimator that takes raw measurements and refines the data to give a cleaner picture.   

For Purpose of use case, we can use the device documentation as they will provide essentially the same use cases.    Just like regular devices they may also include gateway or historian functionality as well as the measurement action.


#### Functional Requirements
Functional requirements are the subset of total requirements that explains how an it system  or one of its substations will work.    Functional requirements represent the needs that drive the business utility of the any final solution, in this case the STTP protocol.   Each functional requirement was defined to address a need that was not solved by existing.  These functional requirements were defined by the initial stakeholders and drove the protocol design and creation.

**The ASP solution will:**

* Support a command channel or communications that are not measurements which will:

  * allow the subscribing gateway to start and stop the data stream.
  * exchange and optionally synchronize measurement point metadata information received from external trusted gateway unions to the local configuration source so that users can examine points that are available for subscription.
  *  enforce trusted gateway measurement point publication and subscription lists as defined in the configuration database. The system will drop data that it is not configured to receive.
  * provide the necessary mechanisms to negotiate QoS configuration with the receiving entity.


* allow for dynamically requesting data or metadata.   It will not send all data all the time.  Most often this requirement is met with the use of a publish-subscribe implementation where the receiver can request data elements and they are delivered by the source on event such as value change.  **(Pub/Sub configurability)**
  * allow for the data to be requested (and sent) to multiple clients what may request the data elements in the same or different combinations.
  * allow the incoming connection to define the measurements that will be selectively streamed. **(Subscribed Data Stream)**


* support the collection, maintenance and communication of data attributes or metadata. **(Metadata management)**

  * support tabular collection and sharing of metadata associated with measurements.   
  * support metadata versioning, allowing a requester to ask for metadata as of a date or version id
  * support merging and update of metadata sets from multiple parties
  * support short descriptor for each data point.
  * the source system sending STTP data will be responsible for collection
  and sharing of metadata to authorized parties.


* allow for the prioritization of data feeds.  In addition to streaming data should take precedence over metadata, the streaming data should allow for the designation of a priority.    Higher priority data flows should be given consideration in times of network congestion.    **(Quality of Service)**

* be capable of managing and streaming of very large sets.   At time of authoring a very large set would be 1000 Phasor Measurement Units sending 10 streaming data points at a refresh rate of thirty times per second (.033ms per data for the same element) on a standard network (i.e 100mbps ethernet)




* Incorporate access control for both data and metadata so that only authorized users are able to successfully receive information after a request.   This security will be able to be set on a point by point basis (or element by element basis for metadata) **(Access Control)**

  * support measures to keep data from being viewed by non-authorized systems or staff.    This will include the ability to implement standard, [not propitiatory to this protocol] encryption techniques.  It will further provide the functions for management of the securing mechanisms. **(Confidentiality / Key management)** **(Enable best-practice security)** **(Reduced Risk of Non-Compliance)**
  *  provide data channels encryption by default as well as require and the connection be authenticated. **(Encryption)**
  * Support reverse direction communication where security mechanisms have created a [unidirectional network](https://en.wikipedia.org/wiki/Unidirectional_network).  In this case a physical data diode or software based firewall may prevent a normal connection from the sender to the receiver (publisher to the subscriber)  in this case the protocol will support a connection made from the higher security environment which may be the sender of the data to the receiver (or subscriber of the data).   This effects only the setup of the connection.  Once the connection is made normal functionality of publisher and subscriber are resumed.  This data diode will then establish a connection with a lower security level and forward data to this  client. The client will only be able to turn on/off the data stream, request metadata, and request a user
  configurable amount of historical data that may be missing during a communications outage. These requests must be handled by the data diode with no modifications made to the established connection to the publisher.


* be easily deployed in configurations that allow for very high fault tolerance.  This should include both network and client or server resiliency options. **(Deployment for high-availability)**  **(Support Disaster recovery considerations)**


* allow backfilling missing data in the event of a communications outage.  Receiving party would request and sending would respond with a data stream to fill in the missing data as defined by the receiver. **(Data Backfilling)**



* support advance compression methods. **(Data Stream Compression)**

* be capable of allowing the party that initiates  a connection to be the sender, or publisher of data . **(Data Pushing)**

* minimize data losses over network connections that do not guarantee delivery (e.g. UDP)

* optimized for the performant delivery of individual data points (in contrast to 37.118 frame based optimization)

* capable of sending a subset or all of the data points to any connecting stream for very large collections of measurements.

* support exchange of metadata as well as the measurement data between any two or more participants in a conversation using the STTP protocol (no centralized registry required)

*  support broadcast messaging and distribution of critical system alarms

* Each connection must operate independently of any other connection and isolate it to the extent possible.


* Support the following types of data requests:
   *  **Subscription Delivery**
   Per subscription delivery window - this subscription level setting would constrain data delivery to a provided timespan (in terms of UTC based start and stop time). This could either be a maximum (future) time constraint for real-time data or, where supported by publisher, a historical data request.
   Publisher will likely want to validate size of historical requests, or least throttle responses, for very large historical requests.

    * **sequence of values** - with respect to specified per value delivery settings (think buffer blocks)

   * **latest value** - command allows for non-steaming request/reply, such as, translation to DNP3

   * **historical values** - subject to availability of local archive / buffer with start and stop time- it has been requested many times that single value data recovery option will be available to accommodate for simple UDP loss, however this should be carefully considered since this basically makes UDP and TCP style protocol - if implemented, restored point should likely flow over TCP channel to reduce repeat recovery requests. Also, this should include detail in response message that recovery either succeeded or failed, where failure mode could include "data not available". To reduce noise, at connection time publisher should always let know subscriber its capabilities which might include “I Support Historical Data Buffer” and perhaps depth of available data. That said there is true value in recovery of data gaps that occur due to loss of connectivity.


#### Non-Functional Requirements
In software requirements documentation, a non-functional requirement is a requirement that specifies criteria that specifies the operation of a system, rather than behaviors. Many often call non-functional requirements "quality attributes"

**The ASP solution will:**

* Support the transfer of very large number of streaming (1,000s to 10s of 1,000s simultaneously) data points streaming at high update rates (30-60 times per second **(Scalability)**

* ensure data integrity end to end of any communication stream, for both streaming data and metadata **(Integrity)**

* Allow for future uses and data elements / attributes with minimal impact to the base protocol in order to allow for future improvements **(Extensibility)**

*  be able to send as many data elements in a given time with the lowest latency possible for any given network configuration **(Performance and throughput [latency & bandwidth])**

* minimize bandwidth requirements on real time steaming of data using resend only on update as well as compression to Lower bandwidth requirements (e.g., over TCP)

* support solutions using protocol that are simple to installation and deploy and integrate with existing and new applications

* include APIs that support condition based Alarming and notifications based on defined events  *(Alarming and notifications)*

* provide initial example API implementations in multiple languages, tested on multiple platforms to quickly utilize STTP protocol

* enforce a minimal set of metadata for any measurement type


#### To talk to Ritchie about(may not be true requirements or may just need additional clarification)  <todo>


* Advance Queries - Must be able to handle more advance request/reply queries.

* Detect and expose communication issues

 * Points defined in metadata will have a clear ownership path

 * Industry specific metadata extensions will exist to support specific industry deployments
