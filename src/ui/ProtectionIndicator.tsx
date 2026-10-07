export function ProtectionIndicator({ seconds }: { seconds: number }) {
  return (
    <div className="protection-label">
      SHIELD ACTIVE · {Math.ceil(seconds)}s
    </div>
  );
}
