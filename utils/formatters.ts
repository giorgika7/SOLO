export function formatDataAmount(bytes: number): string {
  const GB_IN_BYTES = 1073741824;
  const MB_IN_BYTES = 1048576;

  if (bytes >= GB_IN_BYTES) {
    const gb = bytes / GB_IN_BYTES;
    return gb % 1 === 0 ? `${gb} GB` : `${gb.toFixed(2)} GB`;
  } else {
    const mb = bytes / MB_IN_BYTES;
    return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(0)} MB`;
  }
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
