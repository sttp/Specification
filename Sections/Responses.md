### Responses

This section the responses to commands that can be sent by STTP. Currently the only defined responses will be `Succeeded` or `Failed`. The payload of response message depends on the command code the message is in response to.

| Code | Response | Source | Description |
|:----:|----------|:------:|-------------|
| 0x80 | [Succeeded](#succeeded-response) | Any | Command request succeeded. Response success details follow. |
| 0x81 | [Failed](#failed-response) | Any | Command request failed. Response error details follow. |

#### Succeeded Response

* Wire Format: Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Can include response that is specific to source command:

#### Failed Response

* Wire Format: String + Binary (header)
  * Base wire format includes _in-response-to_ command code
  * Includes error message as why command request failed
  * Can include response that is specific to source command:
