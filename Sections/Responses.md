### Responses

Responses are sent over a designated channel based on the nature of the response.

| Code | Response | Source | Channel | Description |
|:----:|----------|:------:|:-------:|-------------|
| 0x80 | [Succeeded](#succeeded-response) | Publisher | Command | Command request succeeded. Response details follow. |
| 0x81 | [Failed](#failed-response) | Publisher | Command | Command request failed. Response error details follow. |
| 0x82 | [Data Point Packet](#data-point-packet-response) | Any | Data | Response contains data points. |
| 0x83 | [Signal Mapping](#signal-mapping-response) | Any | Command | Response contains data point Guid to run-time ID mappings. |
| 0x8n | etc. | | | | |

> :information_source: For the response table above, when a response is destined for the data channel, it should be understood that a connection can be established where both the command and data channel use the same TCP connection.

#### Succeeded Response

* Wire Format: Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Can include response that is specific to source command:

##### Succeeded Response for Metadata Refresh

* Wire Format: String + Binary
  * Includes response message with stats like size, number of tables etc.
  * Includes temporal data point ID for "chunked" metadata responses
  * Includes number of metadata data points to be expected

##### Succeeded Response for Subscribe

Subscriber will need to wait for

* Wire Format: String + Binary
  * Includes response message with stats like number of actual points subscribed,  
    count may not match requested points due to rights or points may no longer exist, etc.
  * Includes temporal data point ID for "chunked" signal mapping responses
  * Includes number of signal mapping data points to be expected

##### Succeeded Response for Unsubscribe

* Wire Format: String
  * Includes message as to successful unsubscribe with stats like connection time

#### Failed Response

* Wire Format: String + Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Includes error message as why command request failed
  * Can include response that is specific to source command:

##### Failed Response for Set Operational Modes

Failed responses to operational modes usually indicate lack of support by publisher. Failure response should include, per failed operational mode option, what options the publisher supports so that the operational modes can be re-negotiated by resending operational modes with a set of _supported_ options.

  * Wire Format: Binary
    * Includes operational mode that failed followed by available operational mode options

#### Data Point Packet Response

* Wire Format: Binary
  * Includes a byte flag indicating content, e.g.:
    * Data compression mode, if any
    * Total data points in packet
  * Includes serialized data points

:information_source: The data point packet is technically classified as a response to a `subscribe` command. However, unlike most responses that operate as a sole response to a parent command, data-packet responses will continue to flow for available measurements until an `unsubscribe` command is issued.

#### Signal Mapping Response

* Wire Format: Binary
  * Includes a mapping of data point Guids to run-time signal IDs
  * Includes per data point ownership state, rights and delivery characteristic details
