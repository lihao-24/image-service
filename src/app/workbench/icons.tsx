import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function SvgIcon({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function PanelIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <path d="M9 3v18" />
    </SvgIcon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </SvgIcon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </SvgIcon>
  );
}

export function LoaderIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </SvgIcon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </SvgIcon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
      <path d="M3 12A9 9 0 0 1 18.3 5.6L21 8" />
      <path d="M21 3v5h-5" />
    </SvgIcon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="14" rx="2" width="14" x="8" y="8" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </SvgIcon>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </SvgIcon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </SvgIcon>
  );
}

export function ExpandIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m15 3 6 6" />
      <path d="M21 3v6h-6" />
      <path d="m9 21-6-6" />
      <path d="M3 21v-6h6" />
    </SvgIcon>
  );
}

export function CollapseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m9 3-6 6" />
      <path d="M3 3v6h6" />
      <path d="m15 21 6-6" />
      <path d="M21 21v-6h-6" />
    </SvgIcon>
  );
}

export function XIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8 12 3 7 8" />
      <path d="M12 3v12" />
    </SvgIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" />
      <path d="M5 3l.8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8Z" />
    </SvgIcon>
  );
}
