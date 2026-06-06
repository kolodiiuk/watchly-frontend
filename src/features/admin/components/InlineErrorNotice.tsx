interface InlineErrorNoticeProps {
  message?: string;
}

export function InlineErrorNotice({ message = 'An error occurred. This is a placeholder error notice.' }: InlineErrorNoticeProps) {
  return <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{message}</div>;
}
