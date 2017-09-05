## Commands and Responses

STTP is implemented using functionality called the _command channel_ that is used to reliably negotiate session specific required communication, state and protocol parameters. Command channel functionality includes establishing communications with other STTP implementations, exchanging metadata on available data points and the ability to request data points for subscription. Any messages, such as commands, transmitted with the expectation of receiving a response will only be sent over the command channel, as such this functionality requires a reliable transmission protocol, e.g., TCP.

STTP also defines functionality which is used to send messages without an expectation of receiving a response called the _data channel_. This functionality allows for transmission of messages over a lossy protocol, e.g., UDP. Data channel functionality is used to send compact, binary encoded data points of identifiable measured values along with timestamps accurate to one ten-millionth of a second and flags that can be used to indicate time and data quality.

This section describes the available commands and responses that define the functionality of STTP.

### Message Structures

Commands and responses are defined as simple binary message structures as follows:

```C
struct {
  uint8 code;
  uint16 length;
  uint8[] payload;
}
Command

struct {
  uint8 code;
  uint8 responseToCode;
  uint16 length;
  uint8[] payload;
}
Response
```

The payload of the message will depend on command or response code which are detailed in the following sections.
