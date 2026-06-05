interface InlineSuccessNoticeProps {
  message?: string;
}

export function InlineSuccessNotice({ message = 'Action completed successfully. This is a placeholder success notice.' }: InlineSuccessNoticeProps) {
  return <div className="rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">{message}</div>;
}
