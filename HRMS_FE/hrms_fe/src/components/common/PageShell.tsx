import React from "react";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ title, children }) => {
  return (
    <div className="page-container">
      <header className="page-title-bar">
        <div>
          <h1>{title}</h1>
        </div>
      </header>
      {children}
    </div>
  );
};

export default PageShell;
