export default function ServerError() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "72px", margin: 0 }}>500</h1>
      <h2>Server Error</h2>
      <p>Something went wrong on our end. Please try again later.</p>
      <button
        onClick={() => window.location.href = "/"}
        style={{
          padding: "12px 24px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        Go Home
      </button>
    </div>
  );
}
