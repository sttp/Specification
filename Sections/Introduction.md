## Introduction

Use of synchrophasors by U.S. utilities continues to grow following the jump start provided by the Smart Grid Investment Grants (2010-2014). Several utilities now have PMU installation counts of 500 phasor measurement units (PMUs) or more and other utilities anticipate being at this level within the next few years. The dominant method to exchange synchrophasor data remains the IEEE C37.118 <sup>[[1](References.md#user-content-ref1)]</sup> protocol that was designed for and continues to be the preferred solution for substation-to-control room communications.  It achieves its advantages through use of an ordered set (a frame) of information that is associated with a specific measurement time.  When IEEE C37.118 is used for PDC-to-PDC communication or for PDC-to-Application communication, large data frames are typically distributed to multiple systems.

To address the challenges presented by these large IEEE C37.118 frame sizes, many utilities have implemented purpose-built networks for synchrophasor data only.  Even with these purpose-built networks, large frame sizes result in an increased probability of UDP frame loss, or in the case of TCP, increased communication latency.  In addition, IEEE C37.118 has only prescriptive methods for the management of measurement metadata which is well-suited for substation-to-control-center use but which becomes difficult to manage as this metadata spans analytic solutions and is used by multiple configuration owners in a wide-area context.

The Advanced Synchrophasor Protocol (ASP) Project was proposed to DOE in response to FOA-1492. In this proposal, the argument was made for a new protocol that overcomes the limitations of IEEE C37.118 for large-scale synchrophasor data system deployments.  The new publish-subscribe protocol to be developed under the ASP Project is called the Streaming Telemetry Transport Protocol (STTP).  STTP leverages the successful design elements of the secure Gateway Exchange Protocol (GEP) that was originally developed by the Grid Protection Alliance (GPA) as part of the SIEGate project (DE-OE-536).

On May 1, 2017, a DOE grant (DE-OE-859) was awarded to GPA and the other 25 collaborators on the ASP Project (see [Contributors](Contributors.md) section) to: (1) write a detailed definition of the STTP protocol _(i.e., this document)_; (2) develop software to support it including production-grade implementations of STTP API's for multiple development platforms along with a collection of tools to test and validate STTP; and (3) demonstrate and evaluate its efficacy with multiple vendors and utilities.

### Scope of this Document

The purpose of this document is to define STTP and to include, as appendices, descriptions as to how to use its supporting software tools.  This STTP specification is focused on effective "streaming data" delivery of which synchrophasor data is a very important use case.

In the [Protocol Overview](Overview.md) section of this specification, high-level features and the business value of STTP are presented. The balance of the sections of the specification provide the details of protocol design.

[Appendix A - Functional Requirements](FunctionalRequirements.md) provides the set of functional requirements and use cases needed for successful STTP deployment.

[Appendix B - STTP API Reference](APIReference.md) provides instructions to enable software developers to integrate and use of STTP within other software systems.

[Appendix C - IEEE C37.118 Mapping](IEEE_C37.118Mapping.md) provides a detailed look at the process of transforming IEEE C37.118 into STTP as well as creating IEEE C37.118 streams from STTP.

While the format and structure of this document, established to facilitate collaboration, is different than that used by standards bodies, it is hoped that the content within this document can meet all the information requirements needed to enable repackaging of this specification into draft standard formats.
