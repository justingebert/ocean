import React from "react";

export interface HeadlineProps {
  title: string;

  size: "small" | "medium" | "large";
}

const Headline: React.FC<HeadlineProps> = ({ title, size }) => {
  const renderInternal = (): React.ReactElement => {
    if (size === "small") {
      return <div className="text-l text-gray-600 sm:text-xl mb-1">{title}</div>;
    } else if (size === "medium") {
      return <div className="text-xl  text-gray-600 sm:text-2xl mb-3">{title}</div>;
    } else {
      return <div className="text-3xl text-gray-600 sm:text-4xl mb-5">{title}</div>;
    }
  };

  return renderInternal();
};

export default Headline;
