interface FoscoBrandingProps {
  size?: 'small' | 'large';
}

export default function FoscoBranding({ size = 'large' }: FoscoBrandingProps) {
  if (size === 'small') {
    return (
      <div className="flex items-center gap-2">
        <img
          src="/assets/generated/fosco-logo.dim_512x512.png"
          alt="FOSCO"
          className="h-8 w-8"
        />
        <span className="text-xl font-bold">FOSCO</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <img
        src="/assets/generated/fosco-logo.dim_512x512.png"
        alt="FOSCO Logo"
        className="mx-auto h-24 w-24"
      />
      <img
        src="/assets/generated/fosco-wordmark.dim_1200x300.png"
        alt="FOSCO"
        className="mx-auto h-16 w-auto"
      />
    </div>
  );
}
