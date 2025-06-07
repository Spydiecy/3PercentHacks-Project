"use client"
import React, { useEffect } from 'react'
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCNqDApCumryib67jTVBqssnojqXisg7oM" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

const api_agent = () => {
    // useEffect
    useEffect(() => {
   
      main();
    
    }, [])
    
  return (
    <div>api_agent</div>
  )
}

export default api_agent