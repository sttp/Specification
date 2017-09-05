## Commands and Responses

STTP is implemented using functionality called the _command channel_ that is used to reliably negotiate session specific required communication, state and protocol parameters. Command channel functionality is used to establish communications with other STTP implementations, exchange metadata on available data points and request data points for subscription. Any messages, such as commands, transmitted with the expectation of receiving a response will only be sent over the command channel, as such this functionality requires a reliable transmission protocol, e.g., TCP.

STTP also defines functionality which is used to send messages without an expectation of receiving a response called the _data channel_. This functionality allows for transmission of messages over a lossy protocol, e.g., UDP. Data channel functionality is used to send compact, binary encoded data points of identifiable measured values along with timestamps accurate to one ten-millionth of a second and flags that can be used to indicate time and data quality.

This section describes the available commands and responses that define the functionality of STTP.
