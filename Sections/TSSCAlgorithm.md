## Appendix E - TSSC Algorithm

The Time-series Special Compression algorithm (TSSC) is an algorithm that was specifically designed for STTP that is used to quickly compress streaming time-series data packets with very good compression ratios.

TSSC is a stateful compression algorithm and must only be used when the STTP data channel functions are established with a reliable transport protocol, e.g., TCP.

Fundamentally TSSC works by applying simple XOR based compression techniques and only sending bits of data that have changed since the last saved state. Many compression algorithms use this technique for compression, the reason TSSC is able to archive such high compression ratios is by taking advantage of the common structure in use by STTP, i.e., that data points are based on a fixed set of elements, specifically an identifier, a timestamp, a set of quality flags and a value block. From a stateful compression perspective, each of these structural elements can be treated as three separate compression streams and handled differently based on the nature and repeating patterns in the continuous data.

Another factor that contributes to the compression algorithm's success is that streaming data has a tendency to have some level of sequencing. For example one measured value will often follow another, in this case a new measured value will have a timestamp that likely only have slightly changed since the last measurement. Also, if the measurements are taken very rapidly, the difference in the actual measured value may also be small. By taking advantage of these non-entropic states for individual structure elements, compression is improved.

> :construction: Must be able to describe TSSC major functions verbally, at least by describing major code chunks. FYI, the following snippets were copied from GEP's TSSC implementation and will need to change based on architectural changes in STTP, e.g., multiple data types. Final code references should be in C language for a more universal example.

### Code Words

Compression in TSSC happens per STTP data point element. Encoding compressed elements into a stream happens based a set of commands that describe the element targeted for compression and its compression state. The available code words are defined below.

```C
  const byte EndOfStream = 0;

  const byte PointIDXOR4 = 1;
  const byte PointIDXOR8 = 2;
  const byte PointIDXOR12 = 3;
  const byte PointIDXOR16 = 4;

  const byte TimeDelta1Forward = 5;
  const byte TimeDelta2Forward = 6;
  const byte TimeDelta3Forward = 7;
  const byte TimeDelta4Forward = 8;
  const byte TimeDelta1Reverse = 9;
  const byte TimeDelta2Reverse = 10;
  const byte TimeDelta3Reverse = 11;
  const byte TimeDelta4Reverse = 12;
  const byte Timestamp2 = 13;
  const byte TimeXOR7Bit = 14;

  const byte Quality2 = 15;
  const byte Quality7Bit32 = 16;

  const byte Value1 = 17;
  const byte Value2 = 18;
  const byte Value3 = 19;
  const byte ValueZero = 20;
  const byte ValueXOR4 = 21;
  const byte ValueXOR8 = 22;
  const byte ValueXOR12 = 23;
  const byte ValueXOR16 = 24;
  const byte ValueXOR20 = 25;
  const byte ValueXOR24 = 26;
  const byte ValueXOR28 = 27;
  const byte ValueXOR32 = 28;
```

### Encoding

The following defines a class that represents the encoder for each STTP data point.

> :construction: Break down functions into details and describe

```C
class TsscEncoder
{
    const uint Bits28 = 0xFFFFFFFu;
    const uint Bits24 = 0xFFFFFFu;
    const uint Bits20 = 0xFFFFFu;
    const uint Bits16 = 0xFFFFu;
    const uint Bits12 = 0xFFFu;
    const uint Bits8 = 0xFFu;
    const uint Bits4 = 0xFu;
    const uint Bits0 = 0x0u;

    private byte[] m_data;
    private int m_position;
    private int m_lastPosition;

    private long m_prevTimestamp1;
    private long m_prevTimestamp2;

    private long m_prevTimeDelta1;
    private long m_prevTimeDelta2;
    private long m_prevTimeDelta3;
    private long m_prevTimeDelta4;

    private TsscPointMetadata m_lastPoint;
    private IndexedArray<TsscPointMetadata> m_points;

    public void Reset() {}

    public void SetBuffer(byte[] data, int startingPosition, int length) {}

    public int FinishBlock() {}

    public unsafe bool TryAddMeasurement(ushort id, long timestamp, uint quality, float value) {}
}

/* CODE TRUNCATED */
```

### Decoding

The following defines a class that represents the encoder for each STTP data point.

> :construction: Break down functions into details and describe

```C
class TsscDecoder
{
    private byte[] m_data;
    private int m_position;
    private int m_lastPosition;

    private long m_prevTimestamp1;
    private long m_prevTimestamp2;

    private long m_prevTimeDelta1;
    private long m_prevTimeDelta2;
    private long m_prevTimeDelta3;
    private long m_prevTimeDelta4;

    private TsscPointMetadata m_lastPoint;
    private IndexedArray<TsscPointMetadata> m_points;

    public void Reset() {}

    public void SetBuffer(byte[] data, int startingPosition, int length) {}

    public unsafe bool TryGetMeasurement(out ushort id, out long timestamp, out uint quality, out float value) {}

    private void DecodePointID(int code, TsscPointMetadata lastPoint) {}

    private long DecodeTimestamp(int code) {}

    private uint DecodeQuality(int code, TsscPointMetadata nextPoint) {}
}

/* CODE TRUNCATED */
```

### Data Point Metadata

The following defines a class that represents the metadata stored for each STTP data point.

> :construction: Break down functions into details and describe

```C
class TsscPointMetadata
{
    public ushort PrevNextPointId1;

    public uint PrevQuality1;
    public uint PrevQuality2;
    public uint PrevValue1;
    public uint PrevValue2;
    public uint PrevValue3;

    private readonly byte[] m_commandStats;
    private int m_commandsSentSinceLastChange = 0;

    private byte m_mode;
    private byte m_mode21;
    private byte m_mode31;
    private byte m_mode301;
    private byte m_mode41;
    private byte m_mode401;
    private byte m_mode4001;

    private int m_startupMode = 0;
    private readonly Action<int, int> m_writeBits;
    private readonly Func<int> m_readBit;
    private readonly Func<int> m_readBits5;

    public TsscPointMetadata(Action<int, int> writeBits, Func<int> readBit, Func<int> readBits5) {}

    public void WriteCode(int code) {}

    public int ReadCode() {}

    private void UpdatedCodeStatistics(int code) {}

    private void AdaptCommands() {}
}

/* CODE TRUNCATED */
```
