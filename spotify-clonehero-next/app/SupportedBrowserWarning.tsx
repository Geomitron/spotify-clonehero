'use client';

const DIRECTORY_PICKER_SUPPROTED =
  typeof window !== 'undefined' &&
  typeof window.showDirectoryPicker === 'function';

const NOT_SUPPORTED = true; // !DIRECTORY_PICKER_SUPPROTED;

export default function SupportedBrowserWarning({
  children,
}: {
  children?: React.ReactNode;
}) {
  if (NOT_SUPPORTED) {
    return (
      <p className="text-2xl text-red-700 mt-2 text-center">
        A recent Chrome update has prevented the online version of this issue scanner from working properly.<br/>
        You can use the issue scanner built in to the <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="https://github.com/Geomitron/Bridge/releases/latest" target="_blank">Bridge Desktop App</a> for this feature.
      </p>
    );
  }

  return children ?? null;
}
