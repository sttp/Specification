## Commands and Responses

STTP is implemented using functionality called the _command channel_ that is used to reliably negotiate session specific required communication, state and protocol parameters. Command channel functionality includes establishing communications with other STTP implementations, exchanging metadata on available data points and the ability to request data points for subscription. Any messages, such as commands, transmitted with the expectation of receiving a response will only be sent over the command channel, as such this functionality requires a reliable transmission protocol, e.g., TCP.

STTP also defines functionality which is used to send messages without an expectation of receiving a response called the _data channel_. This functionality allows for transmission of messages over a lossy protocol, e.g., UDP. Data channel functionality is used to send compact, binary encoded data points of identifiable measured values along with timestamps accurate to one ten-millionth of a second and flags that can be used to indicate time and data quality.

This section describes the available commands and responses that define the functionality of STTP.

### Message Formats

Commands and responses are defined as simple binary message structures that include a payload. The details for the payload of the message will depend on the specific command or response code.

#### Message Payloads

Payloads in STTP are defined as a byte arrays prefixed by an unsigned 16-bit integer representing the array length. Implementations of STTP should make target payload sizes configurable, but all payloads delivered by STTP must have a fixed maximum upper length of `2^16`, i.e., `65,535`, less 3 bytes for the packet overhead.

```C
  uint8[] payload;
```

It is permitted to send an empty payload if the [command code](Commands.md) does not require a payload.

#### Command Structure

Commands are used to manage primary STTP functionality. The following defines the binary format of a `Command`, see [Figure 5](#user-content-figure5) for an example:

```C
struct {
  uint8 commandCode;
  uint16 length;
  uint8[] payload;
}
Command;
```
- The `commandCode` field defines the command code value for the command message, see defined [command codes](Commands.md).
- The `length` field defines the length of the entire packet in bytes.
- The `payload` field is a byte array representing the serialized payload associated with the `commandCode`.

<p class="insert-page-break-after"></p>

<a name="figure5"></a> <center>

**Example Command Structure for a [`DataPointPacket`](Commands.md#data-point-packet-command)**

![Mapping Data Structure Elements to Data Points](Images/command-structure.png)

<sup>Figure 5</sup>
</center>

#### Response Structure

Some form of response exists for every command. Responses take the same format as commands but are distinguished with a different command code. Sometimes, successful responses are implied and not expressly stated. However, in these cases, it's still permitted to send a successful response in addition to the command. Responses for most commands will be either `Succeeded` or `Failed`. The following structure defines the binary format of a `Response`:

```C
struct {
  uint8 responseCode;
  uint16 length;
  uint8[] payload;
}
Response;
```
- The `responseCode` field defines the response code value for the response message, see defined [response codes](Responses.md).
- The `length` field defines the length of the entire packet in bytes.
- The `payload` field is a byte array representing the serialized payload associated with the `responseCode`.
