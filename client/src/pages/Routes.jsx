import { useNavigate } from "react-router-dom";

function Routes() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Routes</h1>
      <p>Select a route to view its vehicles.</p>
    </div>
  );
}

export default Routes;