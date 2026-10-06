import React from "react";

interface BlankSectionProps {
  title: string;
  description?: string;
}

const BlankSection: React.FC<BlankSectionProps> = ({ title, description }) => (
  <div className="blank-section">
    <h3>{title}</h3>
    {description && <p>{description}</p>}
  </div>
);

export default BlankSection;
