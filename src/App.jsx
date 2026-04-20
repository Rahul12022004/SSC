import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import Loader from "./components/Loader";
import AppLayout from "./AppLayout";

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Loader onFinish={() => setLoading(false)} />;
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;