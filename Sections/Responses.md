### Responses

The following table defines the responses to commands that can be sent by STTP. Currently the only defined responses are `Succeeded` or `Failed`. The payload of the response message depends on the command code the message is in response to.

| Code | Type | Source | Description |
|:----:|------|:------:|-------------|
| 0x80 | [Succeeded](#succeeded-response) | Any | Command request succeeded. Response success payload, if any, included. |
| 0x81 | [Failed](#failed-response) | Any | Command request failed. Response error payload, if any, included. |

#### Succeeded Response

A response with a type `Succeeded` is intended to represent a successful reply for a command function. See associated [command code](Commands.md#commands) for proper response payload.

#### Failed Response

A response with a type `Failed` is intended to represent a failure reply for a command function. See associated [command code](Commands.md#commands) for proper response payload.
