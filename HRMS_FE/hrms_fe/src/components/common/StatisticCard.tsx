import React from "react";

interface StatisticCardProps {
  label: string;
  value: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatisticCard;
