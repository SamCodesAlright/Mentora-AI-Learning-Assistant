import React from "react";
import Spinner from "./Spinner";

const StartupScreen = ({ message = "Starting Mentora AI server..." }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <p className="text-xl mb-4">{message}</p>
    <Spinner />
  </div>
);

export default StartupScreen;
