## Appendix A - Functional Requirements

* Functional requirement 1
* Functional requirement 2
* Functional requirement 3

> :construction: The following are _proposed_ ideas that may need a home:

#### Subscription Delivery Options
Per subscription delivery window – this subscription level setting would constrain data delivery to a provided timespan (in terms of UTC based start and stop time). This could either be a maximum (future) time constraint for real-time data or, where supported by publisher, a historical data request.
Publisher will likely want to validate size of historical requests, or least throttle responses, for very large historical requests.

#### Other Data Point Delivery Options
Send a sequence of values – with respect to specified per value delivery settings (think buffer blocks)

Send latest value – command allows for non-steaming request/reply, such as, translation to DNP3

Send historical values – subject to availability of local archive / buffer with start and stop time- it has been requested many times that single value data recovery option will be available to accommodate for simple UDP loss, however this should be carefully considered since this basically makes UDP and TCP style protocol – if implemented, restored point should likely flow over TCP channel to reduce repeat recovery requests. Also, this should include detail in response message that recovery either succeeded or failed, where failure mode could include “data not available”. To reduce noise, at connection time publisher should always let know subscriber its capabilities which might include “I Support Historical Data Buffer” and perhaps depth of available data. That said there is true value in recovery of data gaps that occur due to loss of connectivity.

### Use Cases
