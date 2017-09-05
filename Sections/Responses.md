### Responses

Responses are sent over a designated channel based on the nature of the response.

| Code | Response | Source | Description |
|:----:|----------|:------:|-------------|
| 0x80 | [Succeeded](#succeeded-response) | Any | Command request succeeded. Response success details follow. |
| 0x81 | [Failed](#failed-response) | Any | Command request failed. Response error details follow. |
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
