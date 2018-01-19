## Bit Byte Block

One of the driving goals of STTP is to keep streaming data compact. Since constantly streaming data points, encoding values in terms of bits rather than bytes can save a tremendous amount of size. Consider storing a boolean as a single bit rather than one byte. 

Creating a purely bit based stream has adverse consequences with both speed and compression. Since most off the self compression algorithms compress on byte boundaries, making a bit-stream can render compression ineffective. Therefore a bit byte block serves as a hybrid solution that is fast, compact, and compressible. 

### Design Overview

Bit Byte Blocks must be transmitted as complete blocks. They cannot be streamed as traditional encoding methods can be streamed. Since STTP is a block based communications mechanism, there are no issues with this restriction. 

Each encoded block is encoded from both ends of the block. The 8-bit chunks are encoded from the left side of the block to the right. The non-8 bit chunks are encoded from the right to the left. The basic makeup looks like this:

While writing a Bit-Byte-Block Bytes are on the left, from left to right. Bits are on the right, from Right to Left, and the last 3 bits on the right are reserved to indications how many bits of the last bit block are used. 

  | Byte Blocks  | Unused Space | Bit Blocks | Unused Bits Header |

Note: when the block is finalized, the Unused Space in the middle MUST be trimmed out. 

If a Bit-Byte-Block contains only Bytes and no bits, it will look like this:

 | Byte Block |

If it contains only Bits, it will look like this:

 | Bit Blocks | Unused Bits Header |

A Bit Byte Block will be able to notify the reader when the end of the data stream has been reached. This will occur if a Byte is being read, but the read pointer either advances to the end of the block, or bumps up with the bit pointer; or if reading a bit block, the bit block pointer runs up against the byte block pointer and the Unused Bits Header has been reached.

### Details

Only bits of length 1 to 7 will be stored in the bit block section. For values such as 27 bits, the first 24 bits will be stored in the byte block section, while the remaining 3 bits will be stored in the bit block section.

Bits on the bit stream are also stored Right to Left within each 8 bit byte that they consume. This ensure that data is stored is intuitively stored.

#### Encoding Value Types

The following is the list of all value types that can be encoded in this buffer and how they will be encoded.

| Data Type                     | Encoding Notes   |
|:-----------------------------:| ---------------- |
| int{8,16,24,32,40,48,56,64}   | Natively stored as Big Endian |
| uint{8,16,24,32,40,48,56,64}  | Natively stored as Big Endian |
| uint{`X`}                     | *First* store the Least significant 0 to 7 bits that would be necessary to make `X` divisible by 8, then any remaining bytes stored as Big Endian. Note, this will yield the same result as the previous line if `X` is divisible by 8. See code sample below. |
| float                         | Direct cast as int32 and stored as Big Endian |
| double                        | Direct cast as int64 and stored as Big Endian |
| Guid                          | Stored as Big Endian. (RFC 4122) |
| 4-bit segmented uint64        | First a prefix for non-leading zero's is encoded. Then the value is written as a uint{X}. See code sample below. |
| 8-bit segmented uint64        | Same as above, except the leading prefix is per 8 bits instead of 4. See code sample below. |
| byte[]                        | First store the length as a 4-bit segmented uint64, then store all remaining bytes |
| String                        | Convert the string to a UTF-8 byte array, then follow the rules for a byte[] |
| ASCII                         | Limited to 255 characters. Encoded as a 1 byte length prefix, followed by ASCII characters |
| SttpTime                      | See fundamental type definition |
| SttpBuffer                    | See fundamental type definition |
| SttpMarkup                    | See fundamental type definition |
| SttpBulkTransport             | See fundamental type definition |

Example of encoding uint{`X`}:
``` C
void WriteBits(int bits, ulong value)
{
    if (bits > 64 || bits < 0)
        throw new ArgumentOutOfRangeException(nameof(bits), "Must be between 0 and 64 inclusive");

    switch (bits & 7)
    {
        case 0:
            break;
        case 1:
            WriteBits1((uint)value);
            break;
        case 2:
            WriteBits2((uint)value);
            break;
        case 3:
            WriteBits3((uint)value);
            break;
        case 4:
            WriteBits4((uint)value);
            break;
        case 5:
            WriteBits5((uint)value);
            break;
        case 6:
            WriteBits6((uint)value);
            break;
        case 7:
            WriteBits7((uint)value);
            break;
    }

    value >>= bits & 7;

    switch (bits >> 3)
    {
        case 0:
            return;
        case 1:
            WriteBits8((uint)value);
            return;
        case 2:
            WriteBits16((uint)value);
            return;
        case 3:
            WriteBits24((uint)value);
            return;
        case 4:
            WriteBits32((uint)value);
            return;
        case 5:
            WriteBits40(value);
            return;
        case 6:
            WriteBits48(value);
            return;
        case 7:
            WriteBits56(value);
            return;
        case 8:
            WriteBits64(value);
            return;
    }
}
```

Example of encoding 4-bit segmented uint64:
``` C
void Write4BitSegments(ulong value)
{
    int bits = 0;
    ulong tmpValue = value;
    while (tmpValue > 0)
    {
        bits += 4;
        tmpValue >>= 4;
        WriteBits1(1);
    }
    WriteBits1(0);
    WriteBits(bits, value); 
}
```

Example of encoding 8-bit segmented uint64:
``` C
void Write8BitSegments(ulong value)
{
    int bits = 0;
    ulong tmpValue = value;
    while (tmpValue > 0)
    {
        bits += 8;
        tmpValue >>= 8;
        WriteBits1(1);
    }
    WriteBits1(0);
    WriteBits(bits, value); 
}
```

