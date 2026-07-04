import { useEffect, useState } from "react";
import API from "../api/api";

const Explore = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await API.get("/campaigns");

        console.log("API RESPONSE:", res.data);

        const data = res.data?.data || res.data || [];
        setCampaigns(data);
      } catch (err) {
        console.log("API ERROR:", err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Explore Campaigns</h1>

      {campaigns.length === 0 ? (
        <p>No campaigns found</p>
      ) : (
        campaigns.map((c) => (
          <div
            key={c._id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{c.title}</h3>
            <p>{c.shortDescription}</p>
            <p>Goal: ₹{c.fundingGoal}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Explore;