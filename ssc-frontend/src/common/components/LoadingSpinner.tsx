export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: 20, md: 40, lg: 60 };
  const s = sizes[size];
  
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div
        style={{
          width: s,
          height: s,
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
