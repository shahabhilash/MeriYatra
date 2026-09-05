import React from 'react';
import { Info, Cpu, Code, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">About TrackMyBus</h1>
        <p className="text-lg md:text-xl text-gray-500">
          A smart city initiative built during the <strong className="text-blue-600">SVH26003</strong> Hackathon.
        </p>
      </div>

      <div className="space-y-8">
        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            TrackMyBus aims to solve the problem of unpredictable public transit schedules by providing real-time, 
            affordable tracking for local city buses. Using cheap IoT nodes (NodeMCU ESP8266 + NEO-6M GPS modules) 
            installed in buses, we transmit live location data to a central cloud server, which is then visualized 
            on this frontend application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hardware</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              We leverage low-cost NodeMCU modules paired with GPS sensors. These act as our IoT nodes, sending latitude, longitude, and speed data over 4G cellular networks via MQTT or WebSockets to our backend.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Software</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our frontend is built with React, Vite, and Tailwind CSS for a modern, glassmorphic UI. 
              We use React Leaflet for mapping. 
              Currently, the data is mocked to showcase the UI while the backend is being integrated.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <Lightbulb className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Future Scope</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            In the next phase, we plan to implement machine learning models to predict accurate ETAs based on traffic conditions, historical data, and weather. We will also introduce an Admin Dashboard for fleet managers.
          </p>
        </div>
      </div>
    </div>
  );
}
