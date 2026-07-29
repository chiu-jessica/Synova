export const SCAN_BUCKET = "mri-scans";

const ALLOWED_EXTENSIONS = [".nii", ".nii.gz", ".dcm"];

export function isAllowedScanFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return Boolean(fileName) && ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// Every object a physician uploads lives under their own id. Used both to
// build upload paths and to check that a path submitted later really belongs
// to the caller.
export function storagePrefixFor(physicianId: string): string {
  return `${physicianId}/`;
}
