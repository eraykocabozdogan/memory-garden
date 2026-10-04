export const MULTIPART_PART_SIZE_BYTES = 16 * 1024 * 1024;

export async function* fixedSizeParts(readable, partSize = MULTIPART_PART_SIZE_BYTES) {
  let chunks = [];
  let bufferedBytes = 0;

  for await (const value of readable) {
    let chunk = Buffer.from(value);
    while (chunk.length > 0) {
      const remainingBytes = partSize - bufferedBytes;
      if (chunk.length < remainingBytes) {
        chunks.push(chunk);
        bufferedBytes += chunk.length;
        break;
      }

      chunks.push(chunk.subarray(0, remainingBytes));
      yield Buffer.concat(chunks, partSize);
      chunk = chunk.subarray(remainingBytes);
      chunks = [];
      bufferedBytes = 0;
    }
  }

  if (bufferedBytes > 0) yield Buffer.concat(chunks, bufferedBytes);
}
